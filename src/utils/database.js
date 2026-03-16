import { supabase, isSupabaseConfigured } from './supabase';

const PREFIX = 'empire_';
const QUEUE_KEY = 'empire_offline_queue';

// ─── LocalStorage helpers ───
function localGet(key) { try { return JSON.parse(localStorage.getItem(PREFIX + key)) || []; } catch { return []; } }
function localSet(key, data) { try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch {} }

// ════════════════════════════════════════════════
// OFFLINE QUEUE — Stores failed operations for later sync
// ════════════════════════════════════════════════
function getQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch { return []; } }
function setQueue(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} }

function enqueue(op) {
  const q = getQueue();
  q.push({ ...op, timestamp: Date.now() });
  setQueue(q);
  console.log(`[Offline] Queued ${op.action} on ${op.table} (${q.length} pending)`);
}

// Process the offline queue when back online
async function processQueue() {
  if (!isSupabaseConfigured()) return { processed: 0, failed: 0 };
  const q = getQueue();
  if (q.length === 0) return { processed: 0, failed: 0 };

  console.log(`[Offline] Processing ${q.length} queued operations...`);
  const failed = [];
  let processed = 0;

  for (const op of q) {
    try {
      if (op.action === 'insert') {
        const { error } = await supabase.from(op.table).upsert(op.data, { onConflict: 'id' });
        if (error) throw error;
      } else if (op.action === 'delete') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id);
        if (error) throw error;
      }
      processed++;
    } catch (err) {
      console.warn(`[Offline] Failed to process op:`, err.message);
      // Only re-queue if not too old (max 7 days)
      if (Date.now() - op.timestamp < 7 * 24 * 60 * 60 * 1000) {
        failed.push(op);
      }
    }
  }

  setQueue(failed);
  console.log(`[Offline] Done: ${processed} synced, ${failed.length} remaining`);
  return { processed, failed: failed.length };
}

// ════════════════════════════════════════════════
// NETWORK STATUS
// ════════════════════════════════════════════════
let _online = navigator.onLine;
const listeners = new Set();

export function isOnline() { return _online; }
export function getQueueSize() { return getQueue().length; }
export function onNetworkChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function notifyListeners() { listeners.forEach(fn => fn(_online)); }

if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    _online = true;
    notifyListeners();
    console.log('[Network] Back online — syncing queue...');
    const result = await processQueue();
    if (result.processed > 0) notifyListeners(); // trigger UI refresh
  });
  window.addEventListener('offline', () => {
    _online = false;
    notifyListeners();
    console.log('[Network] Gone offline');
  });
}

// ════════════════════════════════════════════════
// DATABASE CRUD
// ════════════════════════════════════════════════
export const db = {
  async getAll(table) {
    if (!isSupabaseConfigured()) return localGet(table);
    try {
      const { data, error } = await supabase.from(table).select('*').order('date', { ascending: false });
      if (error) throw error;
      localSet(table, data || []);
      // Process any pending queue while we're connected
      processQueue().catch(() => {});
      return data || [];
    } catch (err) {
      console.warn(`[DB] Fetch failed for ${table}, using cache:`, err.message);
      return localGet(table);
    }
  },

  async insert(table, row) {
    const newRow = { ...row, id: row.id || crypto.randomUUID() };

    // Always save locally first
    const current = localGet(table);
    localSet(table, [...current, newRow]);

    if (!isSupabaseConfigured()) return { data: newRow, source: 'local' };

    try {
      if (!navigator.onLine) throw new Error('offline');
      const { data, error } = await supabase.from(table).insert(newRow).select().single();
      if (error) throw error;
      // Update local with server version
      const updated = localGet(table).map(r => r.id === newRow.id ? data : r);
      localSet(table, updated);
      return { data, source: 'supabase' };
    } catch {
      // Queue for later sync
      enqueue({ action: 'insert', table, data: newRow });
      return { data: newRow, source: 'queued' };
    }
  },

  async remove(table, id) {
    // Always remove locally first
    const current = localGet(table);
    localSet(table, current.filter(r => r.id !== id));

    if (!isSupabaseConfigured()) return { source: 'local' };

    try {
      if (!navigator.onLine) throw new Error('offline');
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { source: 'supabase' };
    } catch {
      enqueue({ action: 'delete', table, id });
      return { source: 'queued' };
    }
  },

  async clearAll(table) {
    localSet(table, []);
    if (!isSupabaseConfigured()) return;
    try { await supabase.from(table).delete().neq('id', ''); } catch {}
  },

  async syncLocalToSupabase(table) {
    if (!isSupabaseConfigured() || !navigator.onLine) return;
    const localData = localGet(table);
    if (localData.length === 0) return;
    try {
      const { data: existing } = await supabase.from(table).select('id').limit(1);
      if (existing && existing.length > 0) return;
      await supabase.from(table).insert(localData);
      console.log(`[DB] Synced ${localData.length} rows for ${table}`);
    } catch {}
  },

  processQueue,
  getQueueSize: () => getQueue().length,
};
