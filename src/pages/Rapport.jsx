import React, { useState, useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, KpiCard } from '../components/UI';
import { fmt, fmtCompact, today } from '../utils/format';
import { useConfig } from '../hooks/useConfig';
import { generateReport } from '../utils/reportGenerator';

export default function Rapport({ expenses, savings, brvmInvests }) {
  const { config } = useConfig();
  const { categories } = config;
  const firstDay = new Date(); firstDay.setDate(1);
  const [dateFrom, setDateFrom] = useState(firstDay.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today());
  const [generating, setGenerating] = useState(false);

  const filtered = useMemo(() => {
    const exp = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);
    const sav = savings.filter(s => s.date >= dateFrom && s.date <= dateTo);
    const brv = brvmInvests.filter(b => b.date >= dateFrom && b.date <= dateTo);
    return { expenses: exp, savings: sav, brvm: brv, totalExp: exp.reduce((s, e) => s + Number(e.amount), 0), totalSav: sav.reduce((s, e) => s + Number(e.amount), 0), totalBrv: brv.reduce((s, e) => s + Number(e.amount), 0), txCount: exp.length + sav.length + brv.length };
  }, [expenses, savings, brvmInvests, dateFrom, dateTo]);

  const catBreakdown = useMemo(() => categories.map(cat => ({ ...cat, total: filtered.expenses.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total), [filtered.expenses, categories]);

  const handleDownload = async () => { setGenerating(true); try { await new Promise(r => setTimeout(r, 300)); generateReport({ expenses, savings, brvmInvests, dateFrom, dateTo }); } catch { alert('Erreur'); } setGenerating(false); };

  const periods = [
    { label: 'Ce mois', fn: () => { const d = new Date(); d.setDate(1); setDateFrom(d.toISOString().slice(0, 10)); setDateTo(today()); } },
    { label: 'Dernier mois', fn: () => { const d = new Date(); d.setMonth(d.getMonth() - 1, 1); setDateFrom(d.toISOString().slice(0, 10)); setDateTo(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)); } },
    { label: '3 mois', fn: () => { const d = new Date(); d.setMonth(d.getMonth() - 3, 1); setDateFrom(d.toISOString().slice(0, 10)); setDateTo(today()); } },
    { label: 'Année', fn: () => { setDateFrom(new Date().getFullYear() + '-01-01'); setDateTo(today()); } },
    { label: 'Tout', fn: () => { setDateFrom('2020-01-01'); setDateTo(today()); } },
  ];

  const exportCSV = (data, name) => { if (!data.length) { alert('Aucune donnée.'); return; } const h = Object.keys(data[0]).filter(k => k !== 'id').join(','); const r = data.map(d => Object.keys(d).filter(k => k !== 'id').map(k => `"${d[k]}"`).join(',')); const b = new Blob(['\ufeff' + [h, ...r].join('\n')], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `empire-${name}-${dateFrom}-${dateTo}.csv`; a.click(); };

  return (
    <div className="flex flex-col gap-4">
      <SectionCard glow>
        <div className="flex items-center gap-3 mb-5"><div className="w-11 h-11 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center"><FileText size={22} className="text-empire-accent" /></div><div><h2 className="text-sm font-bold">Générer un rapport</h2><p className="text-[10px] text-empire-muted mt-0.5">PDF ou CSV sur la période de ton choix</p></div></div>
        <div className="flex flex-wrap gap-1.5 mb-4">{periods.map(p => (<button key={p.label} onClick={p.fn} className="px-3.5 py-2 rounded-xl text-[11px] font-semibold border border-empire-border text-empire-muted hover:text-empire-accent hover:border-[var(--accent)]/30 transition-all">{p.label}</button>))}</div>
        <div className="flex flex-wrap gap-3 mb-4"><FormField label="Du"><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></FormField><FormField label="Au"><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></FormField></div>
        <button onClick={handleDownload} disabled={generating} className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] text-[#0A0E18] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">{generating ? <span className="animate-pulse">Génération...</span> : <><Download size={16} /> Télécharger PDF</>}</button>
      </SectionCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💸" title="Dépenses" value={fmtCompact(filtered.totalExp)} accent="#EF4444" />
        <KpiCard icon="🏦" title="Épargne" value={fmtCompact(filtered.totalSav)} accent="#10B981" />
        <KpiCard icon="📈" title="BRVM" value={fmtCompact(filtered.totalBrv)} accent="#F59E0B" />
        <KpiCard icon="📋" title="Transactions" value={filtered.txCount} accent="#8B5CF6" />
      </div>

      {catBreakdown.length > 0 && (
        <SectionCard><SectionTitle icon="📊">Dépenses par catégorie</SectionTitle><div className="space-y-1">{catBreakdown.map(cat => (<div key={cat.id} className="flex items-center justify-between py-2.5 border-b border-empire-border/40 last:border-0"><div className="flex items-center gap-2.5"><span className="text-base">{cat.icon}</span><span className="text-xs font-semibold">{cat.label}</span></div><div className="flex items-center gap-3"><span className="text-[10px] text-empire-muted font-mono">{filtered.totalExp ? ((cat.total / filtered.totalExp) * 100).toFixed(0) : 0}%</span><span className="text-xs font-mono font-bold" style={{ color: cat.color }}>{fmtCompact(cat.total)}</span></div></div>))}<div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-empire-border"><span className="text-xs font-bold">TOTAL</span><span className="text-sm font-mono font-bold text-red-500">{fmt(filtered.totalExp)}</span></div></div></SectionCard>
      )}

      <SectionCard><SectionTitle icon="📁">Export CSV</SectionTitle><p className="text-[11px] text-empire-muted mb-4">Pour Excel ou Google Sheets</p>
        <div className="grid grid-cols-3 gap-2">{[{ l: '💸 Dépenses', d: filtered.expenses, n: 'depenses', c: 'text-red-500 border-red-500/25' }, { l: '🏦 Épargne', d: filtered.savings, n: 'epargne', c: 'text-emerald-500 border-emerald-500/25' }, { l: '📈 BRVM', d: filtered.brvm, n: 'brvm', c: 'text-amber-500 border-amber-500/25' }].map(e => (<button key={e.n} onClick={() => exportCSV(e.d, e.n)} className={`py-3 rounded-xl text-[11px] font-semibold border ${e.c} active:scale-[0.97]`}>{e.l}</button>))}</div>
      </SectionCard>
    </div>
  );
}
