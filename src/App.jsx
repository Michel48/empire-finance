import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Depenses from './pages/Depenses';
import Epargne from './pages/Epargne';
import Brvm from './pages/Brvm';
import Rapport from './pages/Rapport';
import { useStore, useTheme } from './hooks/useStore';
import { isSupabaseConfigured } from './utils/supabase';
import { CloudOff, Cloud, Wifi } from 'lucide-react';

function DbBadge({ status }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full font-medium">
        <CloudOff size={11} /> Mode local
      </div>
    );
  }
  if (status === 'online') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium">
        <Cloud size={11} /> Synced
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-empire-muted bg-empire-border/50 px-2.5 py-1 rounded-full font-medium animate-pulse">
        <Wifi size={11} /> Sync...
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const expenses = useStore('expenses');
  const savings = useStore('savings');
  const brvmInvests = useStore('brvm');
  const { dark, toggle } = useTheme();

  // Determine overall db status
  const dbStatus = [expenses.dbStatus, savings.dbStatus, brvmInvests.dbStatus].includes('online') ? 'online' :
    [expenses.dbStatus, savings.dbStatus, brvmInvests.dbStatus].every(s => s === 'loading') ? 'loading' : 'offline';

  const pages = {
    dashboard: <Dashboard expenses={expenses.data} savings={savings.data} brvmInvests={brvmInvests.data} />,
    depenses: <Depenses expenses={expenses.data} addExpense={expenses.add} removeExpense={expenses.remove} />,
    epargne: <Epargne savings={savings.data} addSaving={savings.add} removeSaving={savings.remove} />,
    brvm: <Brvm brvmInvests={brvmInvests.data} addBrvm={brvmInvests.add} removeBrvm={brvmInvests.remove} />,
    rapport: <Rapport expenses={expenses.data} savings={savings.data} brvmInvests={brvmInvests.data} />,
  };

  return (
    <div className="min-h-[100dvh] bg-empire-bg grain transition-colors duration-300">
      <Navigation active={tab} onChange={setTab} dark={dark} onToggleTheme={toggle} />
      
      {/* DB status badge — mobile */}
      <div className="md:hidden flex justify-center pt-2">
        <DbBadge status={dbStatus} />
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-5 py-3 pb-28 md:pb-8 safe-left safe-right">
        {/* DB status badge — desktop */}
        <div className="hidden md:flex justify-end mb-2">
          <DbBadge status={dbStatus} />
        </div>
        {pages[tab]}
      </main>
    </div>
  );
}
