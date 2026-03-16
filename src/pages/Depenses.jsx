import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, AlertBanner, EmptyState } from '../components/UI';
import { fmt, today, getMonthKey, getLastNMonths } from '../utils/format';
import { CATEGORIES, MAX_DEPENSES, MONTHS_SHORT } from '../utils/constants';

export default function Depenses({ expenses, setExpenses }) {
  const [form, setForm] = useState({ amount: '', category: 'transport', note: '', date: today() });
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());

  const monthExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonth = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = MAX_DEPENSES - totalMonth;

  const add = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setExpenses(prev => [...prev, { ...form, amount: Number(form.amount), id: Date.now() }]);
    setForm({ amount: '', category: form.category, note: '', date: today() });
  };

  const del = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const months = getLastNMonths(6);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Form */}
      <SectionCard glow>
        <SectionTitle icon="➕">Nouvelle dépense</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <FormField label="Montant (FCFA)">
            <input type="number" placeholder="5 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
          <FormField label="Catégorie">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </FormField>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <FormField label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </FormField>
          <FormField label="Note (optionnel)">
            <input type="text" placeholder="Gbaka aller-retour" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
        </div>
        <button onClick={add} className="btn-primary mt-4">Ajouter la dépense</button>
      </SectionCard>

      {/* Alerts */}
      {remaining < 0 && <AlertBanner type="danger">🚨 Budget dépassé de {fmt(Math.abs(remaining))} ! Chaque franc en trop retarde ton objectif.</AlertBanner>}
      {remaining >= 0 && remaining < 30000 && <AlertBanner type="warning">⚠️ Attention — Il te reste seulement {fmt(remaining)} ce mois.</AlertBanner>}

      {/* Month selector + history */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon="📝">Historique</SectionTitle>
          <span className="text-xs font-mono font-bold" style={{ color: totalMonth > MAX_DEPENSES ? '#EF4444' : '#10B981' }}>
            {fmt(totalMonth)} / {fmt(MAX_DEPENSES)}
          </span>
        </div>
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {months.map(m => {
            const [, mo] = m.split('-');
            return (
              <button key={m} onClick={() => setCurrentMonth(m)} className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                currentMonth === m ? 'bg-empire-accent/15 text-empire-accent border border-empire-accent/30' : 'text-empire-muted border border-empire-border hover:border-empire-muted/30'
              }`}>{MONTHS_SHORT[parseInt(mo) - 1]}</button>
            );
          })}
        </div>
        {monthExp.length === 0 ? <EmptyState message="Aucune dépense ce mois." /> :
          <div className="space-y-0.5">
            {[...monthExp].reverse().map(e => {
              const cat = CATEGORIES.find(c => c.id === e.category);
              return (
                <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-empire-border/50 last:border-0 group">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat?.icon}</span>
                    <div>
                      <div className="text-xs font-semibold">{cat?.label}</div>
                      <div className="text-[10px] text-empire-muted">{e.date}{e.note ? ` — ${e.note}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-400 text-sm">-{fmt(e.amount)}</span>
                    <button onClick={() => del(e.id)} className="opacity-0 group-hover:opacity-100 md:opacity-100 text-empire-muted hover:text-red-400 transition-all p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </SectionCard>
    </div>
  );
}
