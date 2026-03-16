import React, { useState } from 'react';
import { Trash2, Target, Plus } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, KpiCard, ProgressBar, EmptyState } from '../components/UI';
import { fmt, fmtCompact, today } from '../utils/format';
import { SAVINGS_GOALS } from '../utils/constants';

export default function Epargne({ savings, setSavings }) {
  const [form, setForm] = useState({ amount: '', goal: 'emmenagement', note: '', date: today() });
  const [customGoals, setCustomGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('empire_custom_goals') || '[]'); } catch { return []; }
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ label: '', target: '' });

  const allGoals = [...SAVINGS_GOALS, ...customGoals];
  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);

  const goalsProgress = allGoals.map(g => ({
    ...g,
    current: savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0),
  }));

  const add = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setSavings(prev => [...prev, { ...form, amount: Number(form.amount), id: Date.now() }]);
    setForm({ amount: '', goal: form.goal, note: '', date: today() });
  };

  const del = (id) => setSavings(prev => prev.filter(e => e.id !== id));

  const addCustomGoal = () => {
    if (!newGoal.label || !newGoal.target) return;
    const goal = {
      id: 'custom_' + Date.now(),
      label: '🎯 ' + newGoal.label,
      target: Number(newGoal.target),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };
    const updated = [...customGoals, goal];
    setCustomGoals(updated);
    localStorage.setItem('empire_custom_goals', JSON.stringify(updated));
    setNewGoal({ label: '', target: '' });
    setShowAddGoal(false);
  };

  const delGoal = (id) => {
    const updated = customGoals.filter(g => g.id !== id);
    setCustomGoals(updated);
    localStorage.setItem('empire_custom_goals', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Total KPI */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon="🏦" title="Total épargné" value={fmtCompact(totalSaved)} accent="#10B981" />
        <KpiCard icon="📊" title="Versements" value={savings.length} accent="#3B82F6" />
      </div>

      {/* Goals progress */}
      <SectionCard glow>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon="🎯">Objectifs</SectionTitle>
          <button onClick={() => setShowAddGoal(!showAddGoal)} className="text-empire-accent text-xs font-semibold flex items-center gap-1 hover:opacity-80">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {showAddGoal && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-empire-bg border border-empire-border">
            <FormField label="Nom de l'objectif">
              <input type="text" placeholder="Ex: Macbook Pro" value={newGoal.label} onChange={e => setNewGoal({ ...newGoal, label: e.target.value })} />
            </FormField>
            <FormField label="Montant cible">
              <input type="number" placeholder="500 000" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} />
            </FormField>
            <div className="w-full">
              <button onClick={addCustomGoal} className="btn-emerald text-xs py-2">Créer l'objectif</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {goalsProgress.map(g => {
            const ratio = g.target ? Math.min(g.current / g.target, 1) : 0;
            return (
              <div key={g.id} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    {g.label}
                    {ratio >= 1 && <span className="text-emerald-400 text-[10px]">✅ Atteint !</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono" style={{ color: g.color }}>
                      {fmtCompact(g.current)} / {fmtCompact(g.target)}
                    </span>
                    {g.id.startsWith('custom_') && (
                      <button onClick={() => delGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-empire-muted hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <ProgressBar value={g.current} max={g.target} color={g.color} height={8} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Add form */}
      <SectionCard>
        <SectionTitle icon="➕">Nouveau versement</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <FormField label="Montant">
            <input type="number" placeholder="416 000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
          <FormField label="Objectif">
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
              {allGoals.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              <option value="general">💰 Épargne générale</option>
            </select>
          </FormField>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <FormField label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </FormField>
          <FormField label="Note">
            <input type="text" placeholder="Salaire mars" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          </FormField>
        </div>
        <button onClick={add} className="btn-sapphire mt-4">Enregistrer le versement</button>
      </SectionCard>

      {/* History */}
      <SectionCard>
        <SectionTitle icon="📜">Historique</SectionTitle>
        {savings.length === 0 ? <EmptyState message="Aucun versement enregistré." /> :
          <div className="space-y-0.5">
            {[...savings].reverse().slice(0, 30).map(s => {
              const goal = allGoals.find(g => g.id === s.goal);
              return (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-empire-border/50 last:border-0 group">
                  <div>
                    <div className="text-xs font-semibold">🏦 {goal?.label || 'Épargne générale'}</div>
                    <div className="text-[10px] text-empire-muted">{s.date}{s.note ? ` — ${s.note}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">+{fmt(s.amount)}</span>
                    <button onClick={() => del(s.id)} className="opacity-0 group-hover:opacity-100 md:opacity-100 text-empire-muted hover:text-red-400 p-1">
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
