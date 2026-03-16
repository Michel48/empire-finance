import { supabase, isSupabaseConfigured } from './supabase';

const PREFIX = 'empire_';

// ─── LocalStorage helpers ───
function localGet(key) {
  try {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function localSet(key, data) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch {}
}

// ─── Supabase CRUD ───
export const db = {
  // Fetch all rows from a table
  async getAll(table) {
    if (!isSupabaseConfigured()) return localGet(table);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Cache locally for offline
      localSet(table, data || []);
      return data || [];
    } catch (err) {
      console.warn(`[DB] Supabase fetch failed for ${table}, using localStorage:`, err.message);
      return localGet(table);
    }
  },

  // Insert a new row
  async insert(table, row) {
    // Generate a local id
    const newRow = { ...row, id: row.id || crypto.randomUUID() };
    
    if (!isSupabaseConfigured()) {
      const current = localGet(table);
      const updated = [...current, newRow];
      localSet(table, updated);
      return { data: newRow, source: 'local' };
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .insert(newRow)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local cache
      const current = localGet(table);
      localSet(table, [...current, data]);
      return { data, source: 'supabase' };
    } catch (err) {
      console.warn(`[DB] Supabase insert failed for ${table}, saving locally:`, err.message);
      const current = localGet(table);
      localSet(table, [...current, newRow]);
      return { data: newRow, source: 'local' };
    }
  },

  // Delete a row by id
  async remove(table, id) {
    if (!isSupabaseConfigured()) {
      const current = localGet(table);
      localSet(table, current.filter(r => r.id !== id));
      return { source: 'local' };
    }

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      // Update local cache
      const current = localGet(table);
      localSet(table, current.filter(r => r.id !== id));
      return { source: 'supabase' };
    } catch (err) {
      console.warn(`[DB] Supabase delete failed, removing locally:`, err.message);
      const current = localGet(table);
      localSet(table, current.filter(r => r.id !== id));
      return { source: 'local' };
    }
  },

  // Clear all rows from a table
  async clearAll(table) {
    localSet(table, []);
    
    if (!isSupabaseConfigured()) return;
    
    try {
      await supabase.from(table).delete().neq('id', '');
    } catch (err) {
      console.warn(`[DB] Supabase clear failed for ${table}:`, err.message);
    }
  },

  // Sync local data to Supabase (one-time migration)
  async syncLocalToSupabase(table) {
    if (!isSupabaseConfigured()) return;
    
    const localData = localGet(table);
    if (localData.length === 0) return;

    try {
      // Check if supabase already has data
      const { data: existing } = await supabase.from(table).select('id').limit(1);
      if (existing && existing.length > 0) return; // Already has data, skip

      const { error } = await supabase.from(table).insert(localData);
      if (error) throw error;
      console.log(`[DB] Synced ${localData.length} rows from localStorage to Supabase for ${table}`);
    } catch (err) {
      console.warn(`[DB] Sync failed for ${table}:`, err.message);
    }
  }
};
