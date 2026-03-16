import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Depenses from './pages/Depenses';
import Epargne from './pages/Epargne';
import Brvm from './pages/Brvm';
import Rapport from './pages/Rapport';
import { useStore } from './hooks/useStore';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [expenses, setExpenses] = useStore('expenses', []);
  const [savings, setSavings] = useStore('savings', []);
  const [brvmInvests, setBrvmInvests] = useStore('brvm', []);

  const pages = {
    dashboard: <Dashboard expenses={expenses} savings={savings} brvmInvests={brvmInvests} />,
    depenses: <Depenses expenses={expenses} setExpenses={setExpenses} />,
    epargne: <Epargne savings={savings} setSavings={setSavings} />,
    brvm: <Brvm brvmInvests={brvmInvests} setBrvmInvests={setBrvmInvests} />,
    rapport: <Rapport expenses={expenses} savings={savings} brvmInvests={brvmInvests} />,
  };

  return (
    <div className="min-h-screen bg-empire-bg">
      <Navigation active={tab} onChange={setTab} />
      <main className="max-w-4xl mx-auto px-3 md:px-4 py-4 pb-24 md:pb-8">
        {pages[tab]}
      </main>
    </div>
  );
}
