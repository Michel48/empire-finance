import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, AlertBanner, EmptyState } from '../components/UI';
import { fmt, fmtCompact, today, getMonthKey, getLastNMonths } from '../utils/format';
import { CATEGORIES, MAX_DEPENSES, MONTHS_SHORT } from '../utils/constants';

export default function Depenses({ expenses, addExpense, removeExpense }) {
  const [form, setForm] = useState({ amount: '', category: 'transport', note: '', date: today() });
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [showForm, setShowForm] = useState(false);

  const monthExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonth = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = MAX_DEPENSES - totalMonth;

  const add = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    await addExpense({ amount: Number(form.amount), category: form.category, note: form.note, date: form.date });
    setForm({ amount: '', category: form.category, note: '', date: today() });
    setShowForm(false);
  };

  const months = getLastNMonths(6);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard glow>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] text-empire-muted uppercase tracking-widest font-semibold">Budget mensuel</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${remaining < 0 ? 'text-red-500' : 'text-empire-text'}`}>{fmtCompact(totalMonth)}</span>
              <span className="text-xs text-empire-muted font-mono">/ {fmtCompact(MAX_DEPENSES)}</span>
            </div>
          </div>
          <div className={`text-right px-4 py-2 rounded-2xl ${remaining < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
            <p className="text-[10px] text-empire-muted font-semibold">Reste</p>
            <p className={`text-lg font-bold font-mono ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{fmtCompact(Math.max(remaining, 0))}</p>
          </div>
        </div>
        <div className="progress-bar mt-3" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${Math.min((totalMonth / MAX_DEPENSES) * 100, 100)}%`, background: remaining < 0 ? '#EF4444' : totalMonth > MAX_DEPENSES * 0.8 ? '#F59E0B' : '#10B981' }} />
        </div>
      </SectionCard>

      {remaining < 0 && <AlertBanner type="danger">🚨 Budget dépassé de {fmt(Math.abs(remaining))}</AlertBanner>}
      {remaining >= 0 && remaining < 30000 && <AlertBanner type="warning">⚠️ Plus que {fmt(remaining)} ce mois</AlertBanner>}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="card flex items-center justify-center gap-2 py-4 text-empire-accent font-semibold text-sm hover:bg-empire-card-hover transition-colors cursor-pointer border-dashed !border-[1.5px] !border-empire-accent/30">
          <Plus size={18} /> Nouvelle dépense
        </button>
      ) : (
        <SectionCard className="!border-empire-accent/20">
          <SectionTitle icon="➕">Nouvelle dépense</SectionTitle>
          <div className="flex flex-wrap gap-3">
            <FormField label="Montant (FCFA)"><input type="number" inputMode="numeric" placeholder="5 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} autoFocus /></FormField>
            <FormField label="Catégorie"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></FormField>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <FormField label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Note"><input type="text" placeholder="Gbaka aller-retour" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} /></FormField>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm text-empire-muted border border-empire-border">Annuler</button>
            <button onClick={add} className="flex-[2] py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] text-[#0A0E18] active:scale-[0.98] transition-transform">Ajouter</button>
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle icon="📝" right={<span className="text-xs font-mono font-bold" style={{ color: totalMonth > MAX_DEPENSES ? '#EF4444' : '#10B981' }}>{fmt(totalMonth)}</span>}>Historique</SectionTitle>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {months.map(m => { const [, mo] = m.split('-'); return (
            <button key={m} onClick={() => setCurrentMonth(m)} className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0 ${currentMonth === m ? 'bg-[var(--accent)] text-[#0A0E18] shadow-sm' : 'text-empire-muted border border-empire-border'}`}>{MONTHS_SHORT[parseInt(mo) - 1]}</button>
          ); })}
        </div>
        {monthExp.length === 0 ? <EmptyState message="Aucune dépense ce mois." /> :
          <div className="space-y-1">
            {[...monthExp].reverse().map(e => { const cat = CATEGORIES.find(c => c.id === e.category); return (
              <div key={e.id} className="flex items-center justify-between py-3 px-1 border-b border-empire-border/40 last:border-0 group hover:bg-empire-bg-soft/50 rounded-lg transition-colors -mx-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${cat?.color}12` }}>{cat?.icon}</div>
                  <div><div className="text-xs font-semibold text-empire-text">{cat?.label}</div><div className="text-[10px] text-empire-muted mt-0.5">{e.date}{e.note ? ` · ${e.note}` : ''}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-red-500 text-[13px]">-{fmtCompact(e.amount)}</span>
                  <button onClick={() => removeExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-empire-muted hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
            ); })}
          </div>
        }
      </SectionCard>
    </div>
  );
}
