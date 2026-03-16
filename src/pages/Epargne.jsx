import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, KpiCard, ProgressBar, EmptyState } from '../components/UI';
import { fmt, fmtCompact, today } from '../utils/format';
import { SAVINGS_GOALS } from '../utils/constants';

export default function Epargne({ savings, addSaving, removeSaving }) {
  const [form, setForm] = useState({ amount: '', goal: 'emmenagement', note: '', date: today() });
  const [customGoals, setCustomGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('empire_custom_goals') || '[]'); } catch { return []; } });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ label: '', target: '' });
  const [showForm, setShowForm] = useState(false);

  const allGoals = [...SAVINGS_GOALS, ...customGoals];
  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);
  const goalsProgress = allGoals.map(g => ({ ...g, current: savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0) }));

  const add = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    await addSaving({ amount: Number(form.amount), goal: form.goal, note: form.note, date: form.date });
    setForm({ amount: '', goal: form.goal, note: '', date: today() });
    setShowForm(false);
  };

  const addCustomGoal = () => {
    if (!newGoal.label || !newGoal.target) return;
    const colors = ['#E11D48', '#7C3AED', '#0891B2', '#CA8A04', '#059669'];
    const goal = { id: 'custom_' + Date.now(), label: newGoal.label, target: Number(newGoal.target), color: colors[customGoals.length % colors.length] };
    const updated = [...customGoals, goal];
    setCustomGoals(updated);
    localStorage.setItem('empire_custom_goals', JSON.stringify(updated));
    setNewGoal({ label: '', target: '' });
    setShowAddGoal(false);
  };

  const delGoal = (id) => { const updated = customGoals.filter(g => g.id !== id); setCustomGoals(updated); localStorage.setItem('empire_custom_goals', JSON.stringify(updated)); };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon="🏦" title="Total épargné" value={fmtCompact(totalSaved)} accent="#10B981" />
        <KpiCard icon="📊" title="Versements" value={savings.length} accent="var(--accent)" sub={`${allGoals.length} objectif${allGoals.length > 1 ? 's' : ''}`} />
      </div>

      <SectionCard glow>
        <SectionTitle icon="🎯" right={<button onClick={() => setShowAddGoal(!showAddGoal)} className="text-empire-accent text-[11px] font-bold flex items-center gap-1"><Plus size={14} /> Objectif</button>}>Objectifs</SectionTitle>
        {showAddGoal && (
          <div className="mb-5 p-4 rounded-2xl bg-empire-bg-soft border border-empire-border">
            <div className="flex flex-wrap gap-3">
              <FormField label="Nom"><input type="text" placeholder="Ex: Macbook" value={newGoal.label} onChange={e => setNewGoal({ ...newGoal, label: e.target.value })} /></FormField>
              <FormField label="Cible (FCFA)"><input type="number" inputMode="numeric" placeholder="500 000" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} /></FormField>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowAddGoal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-empire-muted border border-empire-border">Annuler</button>
              <button onClick={addCustomGoal} className="flex-[2] py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">Créer</button>
            </div>
          </div>
        )}
        <div className="space-y-5">
          {goalsProgress.map(g => { const ratio = g.target ? Math.min(g.current / g.target, 1) : 0; return (
            <div key={g.id} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2"><span className="text-xs font-bold text-empire-text">{g.label}</span>{ratio >= 1 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Atteint !</span>}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold" style={{ color: g.color }}>{fmtCompact(g.current)} / {fmtCompact(g.target)}</span>
                  {g.id.startsWith('custom_') && <button onClick={() => delGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-empire-muted hover:text-red-500 p-1"><Trash2 size={12} /></button>}
                </div>
              </div>
              <ProgressBar value={g.current} max={g.target} color={g.color} height={10} />
              <div className="text-[10px] text-empire-muted mt-1 font-mono">{(ratio * 100).toFixed(0)}%</div>
            </div>
          ); })}
        </div>
      </SectionCard>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="card flex items-center justify-center gap-2 py-4 text-emerald-500 font-semibold text-sm border-dashed !border-[1.5px] !border-emerald-500/30 cursor-pointer"><Plus size={18} /> Nouveau versement</button>
      ) : (
        <SectionCard className="!border-emerald-500/20">
          <SectionTitle icon="➕">Nouveau versement</SectionTitle>
          <div className="flex flex-wrap gap-3">
            <FormField label="Montant"><input type="number" inputMode="numeric" placeholder="416 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} autoFocus /></FormField>
            <FormField label="Objectif"><select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>{allGoals.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}<option value="general">💰 Générale</option></select></FormField>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <FormField label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Note"><input type="text" placeholder="Salaire mars" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} /></FormField>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm text-empire-muted border border-empire-border">Annuler</button>
            <button onClick={add} className="flex-[2] py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white active:scale-[0.98]">Enregistrer</button>
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle icon="📜" right={<span className="text-xs font-mono font-bold text-emerald-500">{fmt(totalSaved)}</span>}>Historique</SectionTitle>
        {savings.length === 0 ? <EmptyState message="Aucun versement." icon="🏦" /> :
          <div className="space-y-1">
            {[...savings].reverse().slice(0, 30).map(s => { const goal = allGoals.find(g => g.id === s.goal); return (
              <div key={s.id} className="flex items-center justify-between py-3 px-1 border-b border-empire-border/40 last:border-0 group hover:bg-empire-bg-soft/50 rounded-lg -mx-1">
                <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">🏦</div><div><div className="text-xs font-semibold text-empire-text">{goal?.label || 'Générale'}</div><div className="text-[10px] text-empire-muted mt-0.5">{s.date}{s.note ? ` · ${s.note}` : ''}</div></div></div>
                <div className="flex items-center gap-2"><span className="font-mono font-bold text-emerald-500 text-[13px]">+{fmtCompact(s.amount)}</span><button onClick={() => removeSaving(s.id)} className="opacity-0 group-hover:opacity-100 text-empire-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} /></button></div>
              </div>
            ); })}
          </div>
        }
      </SectionCard>
    </div>
  );
}
