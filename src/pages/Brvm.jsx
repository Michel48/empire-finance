import React, { useState, useMemo } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionCard, SectionTitle, FormField, KpiCard, ProgressBar, EmptyState } from '../components/UI';
import { fmt, fmtCompact, today, getLastNMonths } from '../utils/format';
import { MONTHS_SHORT } from '../utils/defaults';
import { useConfig } from '../hooks/useConfig';

export default function Brvm({ brvmInvests, addBrvm, removeBrvm }) {
  const { config } = useConfig();
  const { investmentPlans, monthlyInvestBudget } = config;
  const [form, setForm] = useState({ amount: '', ticker: '', date: today(), note: '' });
  const [showForm, setShowForm] = useState(false);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);

  const portfolio = useMemo(() => { const m = {}; brvmInvests.forEach(b => { const k = b.ticker || 'Divers'; if (!m[k]) m[k] = { ticker: k, total: 0, count: 0 }; m[k].total += Number(b.amount); m[k].count += 1; }); return Object.values(m).sort((a, b) => b.total - a.total); }, [brvmInvests]);
  const trend = useMemo(() => getLastNMonths(6).reverse().map(m => { const [, mo] = m.split('-'); return { name: MONTHS_SHORT[parseInt(mo) - 1], montant: brvmInvests.filter(b => b.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0) }; }), [brvmInvests]);

  const add = async () => { if (!form.amount || Number(form.amount) <= 0) return; await addBrvm({ amount: Number(form.amount), ticker: form.ticker, note: form.note, date: form.date }); setForm({ amount: '', ticker: '', date: today(), note: '' }); setShowForm(false); };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon="💰" title="Total investi" value={fmtCompact(totalBrvm)} accent="#F59E0B" />
        <KpiCard icon="📊" title="Positions" value={portfolio.length} sub={`${brvmInvests.length} tx`} accent="#8B5CF6" />
      </div>

      <SectionCard className="!border-amber-500/15">
        <SectionTitle icon="📈">Stratégie — {fmtCompact(monthlyInvestBudget)}/mois</SectionTitle>
        <div className="text-[11px] text-red-500 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-2.5 mb-4 font-medium">⚠️ N'investis que l'argent dont tu n'as PAS besoin à court terme.</div>
        <div className="space-y-4">{investmentPlans.map((s, i) => (
          <div key={s.id || i}><div className="flex justify-between mb-1.5 text-xs"><span className="font-semibold">{s.label}</span><span className="font-mono font-bold text-amber-500">{s.pct}% → {fmtCompact((monthlyInvestBudget * s.pct) / 100)}</span></div><ProgressBar value={s.pct} max={100} color={s.color} height={6} />{s.examples && <div className="text-[10px] text-empire-muted mt-1">Ex: {s.examples}</div>}</div>
        ))}</div>
        <p className="text-[10px] text-empire-muted mt-4">Modifie les plans dans l'onglet Config</p>
      </SectionCard>

      {trend.some(t => t.montant > 0) && (
        <SectionCard><SectionTitle icon="📉">Évolution</SectionTitle><ResponsiveContainer width="100%" height={150}><LineChart data={trend}><XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 11 }} formatter={v => [fmtCompact(v), 'Investi']} /><Line type="monotone" dataKey="montant" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} /></LineChart></ResponsiveContainer></SectionCard>
      )}

      {portfolio.length > 0 && (
        <SectionCard><SectionTitle icon="🏦">Portefeuille</SectionTitle>{portfolio.map(p => (<div key={p.ticker} className="flex items-center justify-between py-3 px-1 border-b border-empire-border/40 last:border-0"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center font-mono font-bold text-amber-500 text-[11px]">{p.ticker.slice(0, 4)}</div><div><span className="text-xs font-bold">{p.ticker}</span><span className="text-[10px] text-empire-muted ml-2">{p.count} achat{p.count > 1 ? 's' : ''}</span></div></div><span className="font-mono font-bold text-amber-500 text-[13px]">{fmtCompact(p.total)}</span></div>))}</SectionCard>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="card flex items-center justify-center gap-2 py-4 text-amber-500 font-semibold text-sm border-dashed !border-[1.5px] !border-amber-500/30 cursor-pointer"><Plus size={18} /> Nouvel achat</button>
      ) : (
        <SectionCard className="!border-amber-500/20"><SectionTitle icon="➕">Enregistrer un achat</SectionTitle>
          <div className="flex flex-wrap gap-3"><FormField label="Montant"><input type="number" inputMode="numeric" placeholder="50 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} autoFocus /></FormField><FormField label="Ticker"><input type="text" placeholder="SNTS" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value.toUpperCase() })} /></FormField></div>
          <div className="flex flex-wrap gap-3 mt-3"><FormField label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField><FormField label="Note"><input type="text" placeholder="5 actions" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} /></FormField></div>
          <div className="flex gap-2 mt-4"><button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm text-empire-muted border border-empire-border">Annuler</button><button onClick={add} className="flex-[2] py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0E18] active:scale-[0.98]">Enregistrer</button></div>
        </SectionCard>
      )}

      <SectionCard><SectionTitle icon="📜" right={<span className="font-mono font-bold text-amber-500 text-xs">{fmt(totalBrvm)}</span>}>Historique</SectionTitle>
        {brvmInvests.length === 0 ? <EmptyState message="Aucun investissement." icon="📈" /> :
          <div className="space-y-1">{[...brvmInvests].reverse().slice(0, 30).map(b => (<div key={b.id} className="flex items-center justify-between py-3 px-1 border-b border-empire-border/40 last:border-0 group hover:bg-empire-bg-soft/50 rounded-lg -mx-1"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">📈</div><div><div className="text-xs font-semibold">{b.ticker || 'BRVM'}</div><div className="text-[10px] text-empire-muted mt-0.5">{b.date}{b.note ? ` · ${b.note}` : ''}</div></div></div><div className="flex items-center gap-2"><span className="font-mono font-bold text-amber-500 text-[13px]">{fmtCompact(b.amount)}</span><button onClick={() => removeBrvm(b.id)} className="opacity-0 group-hover:opacity-100 text-empire-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} /></button></div></div>))}</div>}
      </SectionCard>
    </div>
  );
}
