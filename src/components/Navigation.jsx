import React from 'react';
import { LayoutDashboard, Receipt, PiggyBank, TrendingUp, FileDown, Sun, Moon } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tableau', icon: LayoutDashboard },
  { id: 'depenses', label: 'Dépenses', icon: Receipt },
  { id: 'epargne', label: 'Épargne', icon: PiggyBank },
  { id: 'brvm', label: 'BRVM', icon: TrendingUp },
  { id: 'rapport', label: 'Rapport', icon: FileDown },
];

export default function Navigation({ active, onChange, dark, onToggleTheme }) {
  return (
    <>
      {/* ── Desktop Header ── */}
      <header className="hidden md:block border-b border-empire-border glass-panel sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-bold gold-text tracking-wide">Empire Finance</h1>
              <p className="text-[10px] text-empire-muted -mt-0.5">Build your empire, one franc at a time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 mr-2">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => onChange(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active === t.id
                      ? 'bg-[var(--accent)]/12 text-empire-accent shadow-sm'
                      : 'text-empire-muted hover:text-empire-text hover:bg-empire-border/40'
                  }`}
                >
                  <t.icon size={15} strokeWidth={active === t.id ? 2.2 : 1.5} />
                  {t.label}
                </button>
              ))}
            </nav>
            <button onClick={onToggleTheme} className="theme-toggle" aria-label="Toggle theme">
              <span className="sr-only">{dark ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Header — Dynamic Island Safe ── */}
      <header className="md:hidden glass-panel border-b border-empire-border sticky top-0 z-50 safe-top">
        <div className="px-5 pt-2 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] flex items-center justify-center shadow-md">
                <span className="text-white font-display font-bold text-xs">E</span>
              </div>
              <div>
                <h1 className="text-[15px] font-display font-bold gold-text tracking-wide leading-tight">Empire Finance</h1>
                <p className="text-[9px] text-empire-muted leading-tight">Build your empire</p>
              </div>
            </div>
            <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center bg-empire-bg-soft transition-colors" aria-label="Toggle theme">
              {dark ? <Sun size={16} className="text-empire-gold" /> : <Moon size={16} className="text-empire-accent" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav — Home Indicator Safe ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-empire-border z-50">
        <div className="flex justify-around items-center pt-2 pb-1 safe-bottom safe-left safe-right">
          {TABS.map(t => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className="flex flex-col items-center gap-[2px] py-1 px-1 min-w-[52px] transition-all duration-200"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-[var(--accent)]/12' : ''}`}>
                  <t.icon
                    size={20}
                    strokeWidth={isActive ? 2.3 : 1.4}
                    className={`transition-colors duration-200 ${isActive ? 'text-empire-accent' : 'text-empire-muted'}`}
                  />
                </div>
                <span className={`text-[9px] font-semibold transition-colors duration-200 ${isActive ? 'text-empire-accent' : 'text-empire-muted'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
