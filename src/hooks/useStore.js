import { useState, useCallback, useEffect, useRef } from 'react';
import { db } from '../utils/database';

/**
 * useStore — Hybrid Supabase + localStorage hook
 * 
 * - Loads from localStorage instantly (fast first paint)
 * - Then fetches from Supabase in background
 * - All writes go to both Supabase + localStorage
 * - Works 100% offline with localStorage fallback
 */
export function useStore(table, defaultValue = []) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem('empire_' + table);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('loading'); // 'loading' | 'online' | 'offline'
  const initialized = useRef(false);

  // Load from Supabase on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // Try syncing existing localStorage data first
        await db.syncLocalToSupabase(table);
        
        const rows = await db.getAll(table);
        setData(rows);
        setDbStatus('online');
      } catch {
        setDbStatus('offline');
      }
      setLoading(false);
    })();
  }, [table]);

  // Add a row
  const add = useCallback(async (row) => {
    const newRow = { ...row, id: row.id || crypto.randomUUID() };
    
    // Optimistic update (instant UI)
    setData(prev => {
      const updated = [...prev, newRow];
      localStorage.setItem('empire_' + table, JSON.stringify(updated));
      return updated;
    });

    // Persist to Supabase in background
    const result = await db.insert(table, newRow);
    if (result.source === 'supabase' && result.data) {
      // Update with server-side data (might have different id)
      setData(prev => {
        const updated = prev.map(r => r.id === newRow.id ? result.data : r);
        localStorage.setItem('empire_' + table, JSON.stringify(updated));
        return updated;
      });
    }
    return result.data;
  }, [table]);

  // Remove a row
  const remove = useCallback(async (id) => {
    // Optimistic update
    setData(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('empire_' + table, JSON.stringify(updated));
      return updated;
    });

    await db.remove(table, id);
  }, [table]);

  // Set all data (for compatibility with old interface)
  const setAll = useCallback((newValOrFn) => {
    setData(prev => {
      const resolved = typeof newValOrFn === 'function' ? newValOrFn(prev) : newValOrFn;
      localStorage.setItem('empire_' + table, JSON.stringify(resolved));
      return resolved;
    });
  }, [table]);

  // Clear all
  const clearAll = useCallback(async () => {
    setData([]);
    localStorage.setItem('empire_' + table, JSON.stringify([]));
    await db.clearAll(table);
  }, [table]);

  return { data, add, remove, setAll, clearAll, loading, dbStatus };
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
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('empire_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = useCallback(() => setDark(d => !d), []);
  return { dark, toggle };
}
