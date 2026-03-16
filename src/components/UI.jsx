import React from 'react';

export function ProgressBar({ value, max, color = '#10B981', height = 8, showLabel = false }) {
  const ratio = max ? Math.min(value / max, 1) : 0;
  return (
    <div className="w-full">
      <div className="progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${ratio * 100}%`, background: color }} />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-[10px] text-empire-muted font-mono">
          <span>{(ratio * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

export function KpiCard({ icon, title, value, sub, accent = '#C8A962', delay = 0 }) {
  return (
    <div className="card fade-in flex-1 min-w-[140px]" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-1.5 text-[10px] text-empire-muted uppercase tracking-wider mb-1.5">
        {icon && <span className="text-xs">{icon}</span>}
        {title}
      </div>
      <div className="text-xl font-bold font-mono" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-[10px] text-empire-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function SectionCard({ children, className = '', glow = false }) {
  return (
    <div className={`${glow ? 'card-glow' : 'card'} fade-in ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, icon }) {
  return (
    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {children}
    </h3>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-empire-muted text-xs">
      {message}
    </div>
  );
}

export function AlertBanner({ type = 'warning', children }) {
  const styles = {
    warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    danger: 'border-red-500/30 bg-red-500/5 text-red-400',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  };
  return (
    <div className={`card border ${styles[type]} text-xs font-semibold`}>
      {children}
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="block text-[10px] text-empire-muted mb-1 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
