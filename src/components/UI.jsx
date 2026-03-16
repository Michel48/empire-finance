import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function ProgressBar({ value, max, color = '#10B981', height = 8, showLabel = false }) {
  const ratio = max ? Math.min(value / max, 1) : 0;
  return (
    <div className="w-full">
      <div className="progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${ratio * 100}%`, background: color }} />
      </div>
      {showLabel && <div className="flex justify-between mt-1 text-[10px] text-empire-muted font-mono"><span>{(ratio * 100).toFixed(0)}%</span></div>}
    </div>
  );
}

// Trend badge: shows arrow + percentage vs previous
export function TrendBadge({ current, previous, invertColors = false }) {
  if (!previous || previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  const abs = Math.abs(diff).toFixed(0);
  if (abs === '0') return <span className="flex items-center gap-0.5 text-[10px] text-empire-muted font-mono"><Minus size={10} /> 0%</span>;
  
  const isUp = diff > 0;
  // For expenses, up = bad (red), down = good (green). invertColors flips this.
  const isGood = invertColors ? isUp : !isUp;
  const color = isGood ? 'text-emerald-500' : 'text-red-500';
  const bg = isGood ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const Icon = isUp ? TrendingUp : TrendingDown;
  
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${color} ${bg}`}>
      <Icon size={10} strokeWidth={2.5} />
      {abs}%
    </span>
  );
}

export function KpiCard({ icon, title, value, sub, accent = 'var(--accent)', delay = 0, trend }) {
  return (
    <div className="card fade-in flex-1 min-w-[140px] group hover:scale-[1.01] transition-transform" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-empire-muted uppercase tracking-wider font-semibold">
          {icon && <span className="text-sm">{icon}</span>}{title}
        </div>
        {trend}
      </div>
      <div className="text-[22px] font-bold font-mono leading-tight" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-[10px] text-empire-muted mt-1">{sub}</div>}
    </div>
  );
}

export function SectionCard({ children, className = '', glow = false }) {
  return <div className={`${glow ? 'card-glow' : 'card'} fade-in ${className}`}>{children}</div>;
}

export function SectionTitle({ children, icon, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold flex items-center gap-2 text-empire-text">
        {icon && <span className="text-base">{icon}</span>}{children}
      </h3>
      {right && <div>{right}</div>}
    </div>
  );
}

export function EmptyState({ message, icon = '📭' }) {
  return <div className="text-center py-10"><div className="text-3xl mb-2">{icon}</div><p className="text-empire-muted text-xs">{message}</p></div>;
}

export function AlertBanner({ type = 'warning', children }) {
  const styles = { warning: 'border-amber-400/30 bg-amber-500/5 text-amber-500 dark:text-amber-400', danger: 'border-red-400/30 bg-red-500/5 text-red-500 dark:text-red-400', success: 'border-emerald-400/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' };
  return <div className={`card border-[1.5px] ${styles[type]} text-xs font-semibold leading-relaxed`}>{children}</div>;
}

export function FormField({ label, children }) {
  return <div className="flex-1 min-w-[130px]"><label className="block text-[10px] text-empire-muted mb-1.5 uppercase tracking-widest font-semibold">{label}</label>{children}</div>;
}

export function Badge({ children, color = 'var(--accent)' }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: `${color}15`, color }}>{children}</span>;
}
