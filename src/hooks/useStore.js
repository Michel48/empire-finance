import { useState, useCallback } from 'react';

const PREFIX = 'empire_';

export function useStore(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(value) : newVal;
    setValue(resolved);
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(resolved));
    } catch {}
    return resolved;
  }, [key, value]);

  return [value, set];
}
