import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionCard, SectionTitle, FormField, KpiCard, ProgressBar, EmptyState } from '../components/UI';
import { fmt, fmtCompact, today, getLastNMonths } from '../utils/format';
import { BRVM_STRATEGY, MONTHS_SHORT } from '../utils/constants';

export default function Brvm({ brvmInvests, setBrvmInvests }) {
  const [form, setForm] = useState({ amount: '', ticker: '', date: today(), note: '' });

  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);

  // Portfolio by ticker
  const portfolio = useMemo(() => {
    const map = {};
    brvmInvests.forEach(b => {
      const key = b.ticker || 'Divers';
      if (!map[key]) map[key] = { ticker: key, total: 0, count: 0 };
      map[key].total += Number(b.amount);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [brvmInvests]);

  // Monthly investment trend
  const trend = useMemo(() => {
    return getLastNMonths(6).reverse().map(m => {
      const [, mo] = m.split('-');
      const total = brvmInvests.filter(b => b.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0);
      return { name: MONTHS_SHORT[parseInt(mo) - 1], montant: total };
    });
  }, [brvmInvests]);

  const add = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setBrvmInvests(prev => [...prev, { ...form, amount: Number(form.amount), id: Date.now() }]);
    setForm({ amount: '', ticker: '', date: today(), note: '' });
  };

  const del = (id) => setBrvmInvests(prev => prev.filter(e => e.id !== id));

  return (
    <div className="flex flex-col gap-3.5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon="💰" title="Total investi" value={fmtCompact(totalBrvm)} accent="#F59E0B" />
        <KpiCard icon="📊" title="Positions" value={portfolio.length} sub={`${brvmInvests.length} transactions`} accent="#8B5CF6" />
      </div>

      {/* Strategy */}
      <SectionCard className="border-yellow-500/20">
        <SectionTitle icon="📈">Stratégie BRVM — 80 000 F/mois</SectionTitle>
        <div className="text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          ⚠️ N'investis que l'argent dont tu n'as PAS besoin à court terme (6 mois min).
        </div>
        <div className="space-y-3">
          {BRVM_STRATEGY.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1 text-xs">
                <span className="font-semibold">{s.label}</span>
                <span className="font-mono font-bold" style={{ color: '#F59E0B' }}>{s.pct}% → {fmtCompact((80000 * s.pct) / 100)}</span>
              </div>
              <ProgressBar value={s.pct} max={100} color={s.color} height={5} />
              <div className="text-[10px] text-empire-muted mt-0.5">Ex: {s.examples}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-empire-bg rounded-xl text-[11px] text-empire-muted leading-relaxed">
          <span className="text-emerald-400 font-bold block mb-1">🏁 Pour démarrer</span>
          1. Compte-titres SGI (Africabourse, NSIA Finance, BOA Capital)<br/>
          2. Ou appli Daba Finance dès 10 000 FCFA<br/>
          3. Commissions: ~0.3% par transaction<br/>
          4. Privilégier les actions à dividendes
        </div>
      </SectionCard>

      {/* Trend chart */}
      {trend.some(t => t.montant > 0) && (
        <SectionCard>
          <SectionTitle icon="📉">Évolution des investissements</SectionTitle>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={trend}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 12, fontSize: 11 }}
                formatter={(v) => [fmtCompact(v), 'Investi']}
              />
              <Line type="monotone" dataKey="montant" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* Portfolio breakdown */}
      {portfolio.length > 0 && (
        <SectionCard>
          <SectionTitle icon="🏦">Portefeuille</SectionTitle>
          <div className="space-y-2">
            {portfolio.map(p => (
              <div key={p.ticker} className="flex items-center justify-between py-2 border-b border-empire-border/50 last:border-0">
                <div>
                  <span className="text-xs font-bold">{p.ticker}</span>
                  <span className="text-[10px] text-empire-muted ml-2">{p.count} achat{p.count > 1 ? 's' : ''}</span>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm">{fmtCompact(p.total)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add form */}
      <SectionCard>
        <SectionTitle icon="➕">Enregistrer un achat</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <FormField label="Montant (FCFA)">
            <input type="number" placeholder="50 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
          <FormField label="Ticker">
            <input type="text" placeholder="SNTS, ORAC" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value.toUpperCase() })} />
          </FormField>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <FormField label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </FormField>
          <FormField label="Note">
            <input type="text" placeholder="5 actions SNTS" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
        </div>
        <button onClick={add} className="btn-amber mt-4">Enregistrer l'achat</button>
      </SectionCard>

      {/* History */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon="📜">Historique</SectionTitle>
          <span className="font-mono font-bold text-amber-400">{fmt(totalBrvm)}</span>
        </div>
        {brvmInvests.length === 0 ? <EmptyState message="Aucun investissement." /> :
          <div className="space-y-0.5">
            {[...brvmInvests].reverse().slice(0, 30).map(b => (
              <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-empire-border/50 last:border-0 group">
                <div>
                  <div className="text-xs font-semibold">📈 {b.ticker || 'BRVM'}</div>
                  <div className="text-[10px] text-empire-muted">{b.date}{b.note ? ` — ${b.note}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm">{fmt(b.amount)}</span>
                  <button onClick={() => del(b.id)} className="opacity-0 group-hover:opacity-100 md:opacity-100 text-empire-muted hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        }
      </SectionCard>
    </div>
  );
}
