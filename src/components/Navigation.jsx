import React from 'react';
import { LayoutDashboard, Receipt, PiggyBank, TrendingUp, FileDown } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tableau', icon: LayoutDashboard },
  { id: 'depenses', label: 'Dépenses', icon: Receipt },
  { id: 'epargne', label: 'Épargne', icon: PiggyBank },
  { id: 'brvm', label: 'BRVM', icon: TrendingUp },
  { id: 'rapport', label: 'Rapport', icon: FileDown },
];

export default function Navigation({ active, onChange }) {
  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:block border-b border-empire-border bg-empire-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-bold gold-text tracking-wide">Empire Finance</h1>
            <p className="text-[10px] text-empire-muted">Build your empire, one franc at a time</p>
          </div>
          <nav className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active === t.id
                    ? 'bg-empire-accent/15 text-empire-accent'
                    : 'text-empire-muted hover:text-empire-text hover:bg-empire-border/30'
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden border-b border-empire-border bg-empire-card/80 backdrop-blur-xl sticky top-0 z-50 px-4 py-3">
        <h1 className="text-base font-display font-bold gold-text tracking-wide">Empire Finance</h1>
        <p className="text-[9px] text-empire-muted">Build your empire, one franc at a time</p>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-empire-card/95 backdrop-blur-xl border-t border-empire-border z-50 safe-area-bottom">
        <div className="flex justify-around py-1.5 pb-[env(safe-area-inset-bottom,8px)]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all duration-200 ${
                active === t.id ? 'text-empire-accent' : 'text-empire-muted'
              }`}
            >
              <t.icon size={18} strokeWidth={active === t.id ? 2.5 : 1.5} />
              <span className="text-[9px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
