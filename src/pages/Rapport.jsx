import React, { useState, useMemo } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, KpiCard } from '../components/UI';
import { fmt, fmtCompact, today } from '../utils/format';
import { CATEGORIES } from '../utils/constants';
import { generateReport } from '../utils/reportGenerator';

export default function Rapport({ expenses, savings, brvmInvests }) {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today());
  const [generating, setGenerating] = useState(false);

  const filtered = useMemo(() => {
    const exp = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);
    const sav = savings.filter(s => s.date >= dateFrom && s.date <= dateTo);
    const brv = brvmInvests.filter(b => b.date >= dateFrom && b.date <= dateTo);
    return {
      expenses: exp,
      savings: sav,
      brvm: brv,
      totalExp: exp.reduce((s, e) => s + Number(e.amount), 0),
      totalSav: sav.reduce((s, e) => s + Number(e.amount), 0),
      totalBrv: brv.reduce((s, e) => s + Number(e.amount), 0),
      txCount: exp.length + sav.length + brv.length,
    };
  }, [expenses, savings, brvmInvests, dateFrom, dateTo]);

  const catBreakdown = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      total: filtered.expenses.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0),
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  }, [filtered.expenses]);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      generateReport({ expenses, savings, brvmInvests, dateFrom, dateTo });
    } catch (err) {
      alert('Erreur lors de la génération du rapport. Vérifie ta connexion.');
    }
    setGenerating(false);
  };

  // Quick period selectors
  const setThisMonth = () => {
    const d = new Date();
    d.setDate(1);
    setDateFrom(d.toISOString().slice(0, 10));
    setDateTo(today());
  };
  const setLastMonth = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1, 1);
    setDateFrom(d.toISOString().slice(0, 10));
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setDateTo(end.toISOString().slice(0, 10));
  };
  const setLast3Months = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3, 1);
    setDateFrom(d.toISOString().slice(0, 10));
    setDateTo(today());
  };
  const setThisYear = () => {
    setDateFrom(new Date().getFullYear() + '-01-01');
    setDateTo(today());
  };
  const setAllTime = () => {
    setDateFrom('2020-01-01');
    setDateTo(today());
  };

  const quickButtons = [
    { label: 'Ce mois', fn: setThisMonth },
    { label: 'Mois dernier', fn: setLastMonth },
    { label: '3 derniers mois', fn: setLast3Months },
    { label: 'Cette année', fn: setThisYear },
    { label: 'Tout', fn: setAllTime },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Header */}
      <SectionCard glow>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-empire-accent/10 flex items-center justify-center">
            <FileText size={20} className="text-empire-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Générer un rapport PDF</h2>
            <p className="text-[10px] text-empire-muted">Sélectionne la période et télécharge ton reporting complet</p>
          </div>
        </div>

        {/* Quick periods */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {quickButtons.map(b => (
            <button key={b.label} onClick={b.fn} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-empire-border text-empire-muted hover:text-empire-accent hover:border-empire-accent/30 transition-all">
              {b.label}
            </button>
          ))}
        </div>

        {/* Date pickers */}
        <div className="flex flex-wrap gap-3">
          <FormField label="Du">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </FormField>
          <FormField label="Au">
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </FormField>
        </div>

        <button onClick={handleDownload} disabled={generating} className="btn-primary mt-4 flex items-center justify-center gap-2">
          {generating ? (
            <span className="animate-pulse">Génération en cours...</span>
          ) : (
            <>
              <Download size={16} />
              Télécharger le rapport PDF
            </>
          )}
        </button>
      </SectionCard>

      {/* Preview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💸" title="Dépenses" value={fmtCompact(filtered.totalExp)} accent="#EF4444" />
        <KpiCard icon="🏦" title="Épargne" value={fmtCompact(filtered.totalSav)} accent="#10B981" />
        <KpiCard icon="📈" title="BRVM" value={fmtCompact(filtered.totalBrv)} accent="#F59E0B" />
        <KpiCard icon="📋" title="Transactions" value={filtered.txCount} accent="#8B5CF6" />
      </div>

      {/* Category breakdown preview */}
      {catBreakdown.length > 0 && (
        <SectionCard>
          <SectionTitle icon="📊">Aperçu — Dépenses par catégorie</SectionTitle>
          <div className="space-y-2">
            {catBreakdown.map(cat => (
              <div key={cat.id} className="flex items-center justify-between py-2 border-b border-empire-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-empire-muted font-mono">
                    {filtered.totalExp ? ((cat.total / filtered.totalExp) * 100).toFixed(1) : 0}%
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: cat.color }}>{fmtCompact(cat.total)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-empire-border">
              <span className="text-xs font-bold">TOTAL</span>
              <span className="text-sm font-mono font-bold text-red-400">{fmt(filtered.totalExp)}</span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Recent transactions preview */}
      <SectionCard>
        <SectionTitle icon="📝">Dernières transactions de la période</SectionTitle>
        {filtered.txCount === 0 ? (
          <div className="text-center py-8 text-empire-muted text-xs">Aucune transaction sur cette période.</div>
        ) : (
          <div className="space-y-0.5">
            {[
              ...filtered.expenses.map(e => ({ ...e, type: 'expense', sortDate: e.date })),
              ...filtered.savings.map(s => ({ ...s, type: 'saving', sortDate: s.date })),
              ...filtered.brvm.map(b => ({ ...b, type: 'brvm', sortDate: b.date })),
            ]
              .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
              .slice(0, 15)
              .map(tx => {
                const cat = CATEGORIES.find(c => c.id === tx.category);
                const icons = { expense: cat?.icon || '💸', saving: '🏦', brvm: '📈' };
                const labels = { expense: cat?.label || 'Dépense', saving: 'Épargne', brvm: tx.ticker || 'BRVM' };
                const colors = { expense: '#EF4444', saving: '#10B981', brvm: '#F59E0B' };
                const signs = { expense: '-', saving: '+', brvm: '' };
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-empire-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{icons[tx.type]}</span>
                      <div>
                        <div className="text-[11px] font-semibold">{labels[tx.type]}</div>
                        <div className="text-[9px] text-empire-muted">{tx.date}{tx.note ? ` — ${tx.note}` : ''}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs" style={{ color: colors[tx.type] }}>
                      {signs[tx.type]}{fmtCompact(tx.amount)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </SectionCard>

      {/* Export CSV */}
      <SectionCard>
        <SectionTitle icon="📁">Export CSV</SectionTitle>
        <p className="text-[11px] text-empire-muted mb-3">Exporte tes données brutes pour les analyser dans Excel ou Google Sheets.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV(filtered.expenses, 'depenses', dateFrom, dateTo)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/5 transition-all">
            💸 Dépenses CSV
          </button>
          <button onClick={() => exportCSV(filtered.savings, 'epargne', dateFrom, dateTo)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5 transition-all">
            🏦 Épargne CSV
          </button>
          <button onClick={() => exportCSV(filtered.brvm, 'brvm', dateFrom, dateTo)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-amber-500/30 text-amber-400 hover:bg-amber-500/5 transition-all">
            📈 BRVM CSV
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function exportCSV(data, name, from, to) {
  if (data.length === 0) { alert('Aucune donnée à exporter pour cette période.'); return; }
  const headers = Object.keys(data[0]).filter(k => k !== 'id').join(',');
  const rows = data.map(d => Object.keys(d).filter(k => k !== 'id').map(k => `"${d[k]}"`).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `empire-${name}-${from}-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
