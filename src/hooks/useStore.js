import { useState, useCallback, useEffect, useRef } from 'react';
import { db, isOnline, getQueueSize, onNetworkChange } from '../utils/database';

/**
 * useStore — Hybrid Supabase + localStorage + Offline Queue
 */
export function useStore(table, defaultValue = []) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('empire_' + table)) || defaultValue; } catch { return defaultValue; }
  });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('loading');
  const [pendingSync, setPendingSync] = useState(getQueueSize());
  const initialized = useRef(false);

  // Listen to network changes
  useEffect(() => {
    const unsub = onNetworkChange(async (online) => {
      setDbStatus(online ? 'online' : 'offline');
      setPendingSync(getQueueSize());
      if (online) {
        // Re-fetch fresh data when coming back online
        try {
          const rows = await db.getAll(table);
          setData(rows);
          setPendingSync(getQueueSize());
        } catch {}
      }
    });
    return unsub;
  }, [table]);

  // Initial load
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        await db.syncLocalToSupabase(table);
        const rows = await db.getAll(table);
        setData(rows);
        setDbStatus(isOnline() ? 'online' : 'offline');
      } catch { setDbStatus('offline'); }
      setPendingSync(getQueueSize());
      setLoading(false);
    })();
  }, [table]);

  const add = useCallback(async (row) => {
    const newRow = { ...row, id: row.id || crypto.randomUUID() };
    setData(prev => {
      const updated = [...prev, newRow];
      localStorage.setItem('empire_' + table, JSON.stringify(updated));
      return updated;
    });
    const result = await db.insert(table, newRow);
    setPendingSync(getQueueSize());
    if (result.source === 'supabase' && result.data) {
      setData(prev => {
        const updated = prev.map(r => r.id === newRow.id ? result.data : r);
        localStorage.setItem('empire_' + table, JSON.stringify(updated));
        return updated;
      });
    }
    return result.data;
  }, [table]);

  const remove = useCallback(async (id) => {
    setData(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('empire_' + table, JSON.stringify(updated));
      return updated;
    });
    await db.remove(table, id);
    setPendingSync(getQueueSize());
  }, [table]);

  const setAll = useCallback((newValOrFn) => {
    setData(prev => {
      const resolved = typeof newValOrFn === 'function' ? newValOrFn(prev) : newValOrFn;
      localStorage.setItem('empire_' + table, JSON.stringify(resolved));
      return resolved;
    });
  }, [table]);

  const clearAll = useCallback(async () => {
    setData([]);
    localStorage.setItem('empire_' + table, JSON.stringify([]));
    await db.clearAll(table);
  }, [table]);

  return { data, add, remove, setAll, clearAll, loading, dbStatus, pendingSync };
}

/**
 * useTheme — Dark/Light mode toggle
 */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('empire_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return true; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    localStorage.setItem('empire_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = useCallback(() => setDark(d => !d), []);
  return { dark, toggle };
}
