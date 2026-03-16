import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { DEFAULT_CONFIG } from '../utils/defaults';

const CONFIG_KEY = 'empire_config';

function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new fields added in updates
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch {}
}

// Context so all components can access config without prop drilling
const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfigState] = useState(loadConfig);

  const updateConfig = useCallback((updates) => {
    setConfigState(prev => {
      const next = { ...prev, ...(typeof updates === 'function' ? updates(prev) : updates) };
      saveConfig(next);
      return next;
    });
  }, []);

  // Category helpers
  const addCategory = useCallback((cat) => {
    updateConfig(prev => ({
      categories: [...prev.categories, { ...cat, id: cat.id || 'cat_' + Date.now() }]
    }));
  }, [updateConfig]);

  const removeCategory = useCallback((id) => {
    updateConfig(prev => ({
      categories: prev.categories.filter(c => c.id !== id)
    }));
  }, [updateConfig]);

  const updateCategory = useCallback((id, updates) => {
    updateConfig(prev => ({
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, [updateConfig]);

  // Savings goal helpers
  const addGoal = useCallback((goal) => {
    updateConfig(prev => ({
      savingsGoals: [...prev.savingsGoals, { ...goal, id: goal.id || 'goal_' + Date.now() }]
    }));
  }, [updateConfig]);

  const removeGoal = useCallback((id) => {
    updateConfig(prev => ({
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id)
    }));
  }, [updateConfig]);

  const updateGoal = useCallback((id, updates) => {
    updateConfig(prev => ({
      savingsGoals: prev.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  }, [updateConfig]);

  // Investment plan helpers
  const addPlan = useCallback((plan) => {
    updateConfig(prev => ({
      investmentPlans: [...prev.investmentPlans, { ...plan, id: plan.id || 'plan_' + Date.now() }]
    }));
  }, [updateConfig]);

  const removePlan = useCallback((id) => {
    updateConfig(prev => ({
      investmentPlans: prev.investmentPlans.filter(p => p.id !== id)
    }));
  }, [updateConfig]);

  const updatePlan = useCallback((id, updates) => {
    updateConfig(prev => ({
      investmentPlans: prev.investmentPlans.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, [updateConfig]);

  // Reset to defaults
  const resetConfig = useCallback(() => {
    const fresh = { ...DEFAULT_CONFIG };
    setConfigState(fresh);
    saveConfig(fresh);
  }, []);

  // Export / Import config
  const exportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'empire-finance-config.json';
    a.click();
  }, [config]);

  const importConfig = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const merged = { ...DEFAULT_CONFIG, ...parsed };
      setConfigState(merged);
      saveConfig(merged);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = {
    config,
    updateConfig,
    addCategory, removeCategory, updateCategory,
    addGoal, removeGoal, updateGoal,
    addPlan, removePlan, updatePlan,
    resetConfig, exportConfig, importConfig,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
