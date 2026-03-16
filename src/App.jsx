import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Depenses from './pages/Depenses';
import Epargne from './pages/Epargne';
import Brvm from './pages/Brvm';
import Watchlist from './pages/Watchlist';
import Rapport from './pages/Rapport';
import Settings from './pages/Settings';
import AIInsights from './pages/AIInsights';
import { useStore, useTheme } from './hooks/useStore';
import { isSupabaseConfigured } from './utils/supabase';
import { isOnline as checkOnline, onNetworkChange, getQueueSize } from './utils/database';
import { CloudOff, Cloud, Wifi, WifiOff, UploadCloud } from 'lucide-react';

function DbBadge({ dbStatus, pendingSync }) {
  const [online, setOnline] = useState(checkOnline());

  useEffect(() => {
    const unsub = onNetworkChange(setOnline);
    return unsub;
  }, []);

  // Offline with pending items
  if (!online && pendingSync > 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full font-medium">
        <WifiOff size={11} /> Hors-ligne · {pendingSync} en attente
      </div>
    );
  }

  // Offline, nothing pending
  if (!online) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full font-medium">
        <WifiOff size={11} /> Hors-ligne
      </div>
    );
  }

  // Online with pending sync
  if (pendingSync > 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium animate-pulse">
        <UploadCloud size={11} /> Sync {pendingSync}...
      </div>
    );
  }

  // Supabase not configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full font-medium">
        <CloudOff size={11} /> Local
      </div>
    );
  }

  // All good
  if (dbStatus === 'online') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium">
        <Cloud size={11} /> Synced
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-empire-muted bg-empire-border/50 px-2.5 py-1 rounded-full font-medium animate-pulse">
      <Wifi size={11} /> Connexion...
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const expenses = useStore('expenses');
  const savings = useStore('savings');
  const brvmInvests = useStore('brvm');
  const { dark, toggle } = useTheme();

  const dbStatus = [expenses.dbStatus, savings.dbStatus, brvmInvests.dbStatus].includes('online') ? 'online' : 'offline';
  const pendingSync = Math.max(expenses.pendingSync, savings.pendingSync, brvmInvests.pendingSync);

  const pages = {
    dashboard: <Dashboard expenses={expenses.data} savings={savings.data} brvmInvests={brvmInvests.data} />,
    depenses: <Depenses expenses={expenses.data} addExpense={expenses.add} removeExpense={expenses.remove} />,
    epargne: <Epargne savings={savings.data} addSaving={savings.add} removeSaving={savings.remove} />,
    brvm: <Brvm brvmInvests={brvmInvests.data} addBrvm={brvmInvests.add} removeBrvm={brvmInvests.remove} />,
    watchlist: <Watchlist />,
    ai: <AIInsights expenses={expenses.data} savings={savings.data} brvmInvests={brvmInvests.data} />,
    rapport: <Rapport expenses={expenses.data} savings={savings.data} brvmInvests={brvmInvests.data} />,
    settings: <Settings />,
  };

  return (
    <div className="min-h-[100dvh] bg-empire-bg grain transition-colors duration-300">
      <Navigation active={tab} onChange={setTab} dark={dark} onToggleTheme={toggle} />
      <div className="md:hidden flex justify-center pt-2"><DbBadge dbStatus={dbStatus} pendingSync={pendingSync} /></div>
      <main className="max-w-4xl mx-auto px-4 md:px-5 py-3 pb-28 md:pb-8 safe-left safe-right">
        <div className="hidden md:flex justify-end mb-2"><DbBadge dbStatus={dbStatus} pendingSync={pendingSync} /></div>
        {pages[tab]}
      </main>
    </div>
  );
}
