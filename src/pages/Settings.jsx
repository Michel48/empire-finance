import React, { useState, useRef } from 'react';
import { Trash2, Plus, Edit3, Check, X, Upload, Download, RotateCcw, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, AlertBanner } from '../components/UI';
import { useConfig } from '../hooks/useConfig';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../utils/defaults';
import { fmtCompact } from '../utils/format';

// ─── Icon Picker ───
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-11 h-11 rounded-xl bg-empire-bg-soft border border-empire-border flex items-center justify-center text-xl hover:border-empire-accent/30 transition-colors">{value}</button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-empire-card border border-empire-border rounded-2xl p-3 shadow-xl grid grid-cols-7 gap-1.5 w-[260px]">
          {AVAILABLE_ICONS.map(icon => (
            <button key={icon} onClick={() => { onChange(icon); setOpen(false); }} className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-empire-bg-soft transition-colors ${value === icon ? 'bg-empire-accent/15 ring-1 ring-empire-accent/40' : ''}`}>{icon}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Color Picker ───
function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-lg border-2 border-empire-border hover:border-empire-accent/40 transition-colors" style={{ background: value }} />
      {open && (
        <div className="absolute top-10 left-0 z-50 bg-empire-card border border-empire-border rounded-xl p-2.5 shadow-xl flex flex-wrap gap-1.5 w-[200px]">
          {AVAILABLE_COLORS.map(color => (
            <button key={color} onClick={() => { onChange(color); setOpen(false); }} className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${value === color ? 'ring-2 ring-white/50 scale-110' : ''}`} style={{ background: color }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Editable Item Row ───
function EditableItem({ item, onUpdate, onDelete, fields }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  const save = () => { onUpdate(item.id, draft); setEditing(false); };
  const cancel = () => { setDraft(item); setEditing(false); };

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-3 px-2 border-b border-empire-border/40 last:border-0 group hover:bg-empire-bg-soft/50 rounded-xl transition-colors -mx-2">
        <div className="flex items-center gap-3">
          {item.icon && <span className="text-lg">{item.icon}</span>}
          {item.color && !item.icon && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />}
          <div>
            <div className="text-xs font-semibold text-empire-text">{item.label}</div>
            <div className="text-[10px] text-empire-muted mt-0.5">
              {item.budget !== undefined && `Budget: ${fmtCompact(item.budget)}`}
              {item.target !== undefined && `Cible: ${fmtCompact(item.target)}`}
              {item.pct !== undefined && `${item.pct}%`}
              {item.examples && ` · ${item.examples}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-empire-muted hover:text-empire-accent hover:bg-empire-accent/10 transition-colors"><Edit3 size={13} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-empire-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-3 border border-empire-accent/20 rounded-2xl bg-empire-bg-soft/50 my-1">
      <div className="flex flex-wrap gap-2.5 items-end">
        {fields.includes('icon') && <IconPicker value={draft.icon || '📦'} onChange={v => setDraft({ ...draft, icon: v })} />}
        {fields.includes('color') && <ColorPicker value={draft.color || '#6B7280'} onChange={v => setDraft({ ...draft, color: v })} />}
        {fields.includes('label') && (
          <div className="flex-1 min-w-[120px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Nom</label><input type="text" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('budget') && (
          <div className="w-[100px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Budget</label><input type="number" value={draft.budget || ''} onChange={e => setDraft({ ...draft, budget: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('target') && (
          <div className="w-[120px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Cible</label><input type="number" value={draft.target || ''} onChange={e => setDraft({ ...draft, target: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('pct') && (
          <div className="w-[70px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">%</label><input type="number" value={draft.pct || ''} onChange={e => setDraft({ ...draft, pct: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('examples') && (
          <div className="flex-1 min-w-[150px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Exemples</label><input type="text" value={draft.examples || ''} onChange={e => setDraft({ ...draft, examples: e.target.value })} className="!py-2 !text-xs" /></div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={cancel} className="flex-1 py-2 rounded-xl text-xs font-semibold text-empire-muted border border-empire-border flex items-center justify-center gap-1"><X size={12} /> Annuler</button>
        <button onClick={save} className="flex-[2] py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] text-[#0A0E18] flex items-center justify-center gap-1"><Check size={12} /> Sauvegarder</button>
      </div>
    </div>
  );
}

// ─── Add New Item Form ───
function AddItemForm({ fields, onAdd, onCancel, accent = 'var(--accent)' }) {
  const [draft, setDraft] = useState({ label: '', icon: '📦', color: '#6B7280', budget: 0, target: 0, pct: 0, examples: '' });

  const submit = () => {
    if (!draft.label) return;
    onAdd(draft);
    setDraft({ label: '', icon: '📦', color: '#6B7280', budget: 0, target: 0, pct: 0, examples: '' });
    onCancel();
  };

  return (
    <div className="p-4 rounded-2xl bg-empire-bg-soft border border-empire-border mb-2">
      <div className="flex flex-wrap gap-2.5 items-end">
        {fields.includes('icon') && <IconPicker value={draft.icon} onChange={v => setDraft({ ...draft, icon: v })} />}
        {fields.includes('color') && <ColorPicker value={draft.color} onChange={v => setDraft({ ...draft, color: v })} />}
        {fields.includes('label') && (
          <div className="flex-1 min-w-[120px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Nom</label><input type="text" placeholder="Ma catégorie" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} className="!py-2 !text-xs" autoFocus /></div>
        )}
        {fields.includes('budget') && (
          <div className="w-[100px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Budget</label><input type="number" inputMode="numeric" placeholder="0" value={draft.budget || ''} onChange={e => setDraft({ ...draft, budget: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('target') && (
          <div className="w-[120px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Cible</label><input type="number" inputMode="numeric" placeholder="500000" value={draft.target || ''} onChange={e => setDraft({ ...draft, target: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('pct') && (
          <div className="w-[70px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">%</label><input type="number" placeholder="10" value={draft.pct || ''} onChange={e => setDraft({ ...draft, pct: Number(e.target.value) || 0 })} className="!py-2 !text-xs" /></div>
        )}
        {fields.includes('examples') && (
          <div className="flex-1 min-w-[150px]"><label className="block text-[9px] text-empire-muted mb-1 uppercase tracking-widest">Exemples</label><input type="text" placeholder="SNTS, ORAC..." value={draft.examples || ''} onChange={e => setDraft({ ...draft, examples: e.target.value })} className="!py-2 !text-xs" /></div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-xs font-semibold text-empire-muted border border-empire-border">Annuler</button>
        <button onClick={submit} className="flex-[2] py-2 rounded-xl text-xs font-bold text-white" style={{ background: accent }}>Ajouter</button>
      </div>
    </div>
  );
}

// ─── Collapsible Section ───
function CollapsibleSection({ title, icon, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SectionCard>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <SectionTitle icon={icon}>{title} <span className="text-empire-muted font-mono text-[10px] ml-1">({count})</span></SectionTitle>
        {open ? <ChevronUp size={16} className="text-empire-muted" /> : <ChevronDown size={16} className="text-empire-muted" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════
export default function Settings() {
  const { config, updateConfig, addCategory, removeCategory, updateCategory, addGoal, removeGoal, updateGoal, addPlan, removePlan, updatePlan, resetConfig, exportConfig, importConfig } = useConfig();
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const fileRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importConfig(ev.target.result);
      alert(ok ? '✅ Configuration importée !' : '❌ Fichier invalide');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Profile */}
      <SectionCard glow>
        <SectionTitle icon="👤">Profil financier</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nom">
            <input type="text" value={config.userName} onChange={e => updateConfig({ userName: e.target.value })} />
          </FormField>
          <FormField label="Devise">
            <select value={config.currency} onChange={e => updateConfig({ currency: e.target.value })}>
              <option value="FCFA">FCFA</option>
              <option value="€">Euro (€)</option>
              <option value="$">Dollar ($)</option>
              <option value="£">Livre (£)</option>
            </select>
          </FormField>
          <FormField label="Salaire mensuel">
            <input type="number" inputMode="numeric" value={config.salary} onChange={e => updateConfig({ salary: Number(e.target.value) || 0 })} />
          </FormField>
          <FormField label="Budget dépenses max">
            <input type="number" inputMode="numeric" value={config.maxDepenses} onChange={e => updateConfig({ maxDepenses: Number(e.target.value) || 0 })} />
          </FormField>
          <FormField label="Budget investissement/mois">
            <input type="number" inputMode="numeric" value={config.monthlyInvestBudget} onChange={e => updateConfig({ monthlyInvestBudget: Number(e.target.value) || 0 })} />
          </FormField>
        </div>
      </SectionCard>

      {/* Categories */}
      <CollapsibleSection title="Catégories de dépenses" icon="📂" count={config.categories.length}>
        {showAddCat && <AddItemForm fields={['icon', 'color', 'label', 'budget']} onAdd={addCategory} onCancel={() => setShowAddCat(false)} accent="#3B82F6" />}
        {config.categories.map(cat => (
          <EditableItem key={cat.id} item={cat} onUpdate={updateCategory} onDelete={removeCategory} fields={['icon', 'color', 'label', 'budget']} />
        ))}
        {!showAddCat && (
          <button onClick={() => setShowAddCat(true)} className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-blue-500 border border-blue-500/25 border-dashed flex items-center justify-center gap-1.5 hover:bg-blue-500/5 transition-colors">
            <Plus size={14} /> Ajouter une catégorie
          </button>
        )}
      </CollapsibleSection>

      {/* Savings Goals */}
      <CollapsibleSection title="Objectifs d'épargne" icon="🎯" count={config.savingsGoals.length}>
        {showAddGoal && <AddItemForm fields={['icon', 'color', 'label', 'target']} onAdd={addGoal} onCancel={() => setShowAddGoal(false)} accent="#10B981" />}
        {config.savingsGoals.map(goal => (
          <EditableItem key={goal.id} item={goal} onUpdate={updateGoal} onDelete={removeGoal} fields={['icon', 'color', 'label', 'target']} />
        ))}
        {!showAddGoal && (
          <button onClick={() => setShowAddGoal(true)} className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-500 border border-emerald-500/25 border-dashed flex items-center justify-center gap-1.5 hover:bg-emerald-500/5 transition-colors">
            <Plus size={14} /> Ajouter un objectif
          </button>
        )}
      </CollapsibleSection>

      {/* Investment Plans */}
      <CollapsibleSection title="Plans d'investissement" icon="📈" count={config.investmentPlans.length}>
        {showAddPlan && <AddItemForm fields={['color', 'label', 'pct', 'examples']} onAdd={addPlan} onCancel={() => setShowAddPlan(false)} accent="#F59E0B" />}
        {config.investmentPlans.map(plan => (
          <EditableItem key={plan.id} item={plan} onUpdate={updatePlan} onDelete={removePlan} fields={['color', 'label', 'pct', 'examples']} />
        ))}
        {!showAddPlan && (
          <button onClick={() => setShowAddPlan(true)} className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-amber-500 border border-amber-500/25 border-dashed flex items-center justify-center gap-1.5 hover:bg-amber-500/5 transition-colors">
            <Plus size={14} /> Ajouter un plan
          </button>
        )}
      </CollapsibleSection>

      {/* Import / Export / Reset */}
      <SectionCard>
        <SectionTitle icon="⚙️">Outils</SectionTitle>
        <div className="space-y-2.5">
          <button onClick={exportConfig} className="w-full py-3 rounded-xl text-xs font-semibold text-empire-accent border border-empire-accent/25 flex items-center justify-center gap-2 hover:bg-[var(--accent)]/5 transition-colors">
            <Download size={14} /> Exporter la configuration (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl text-xs font-semibold text-blue-500 border border-blue-500/25 flex items-center justify-center gap-2 hover:bg-blue-500/5 transition-colors">
            <Upload size={14} /> Importer une configuration
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="w-full py-3 rounded-xl text-xs font-semibold text-red-500 border border-red-500/25 flex items-center justify-center gap-2 hover:bg-red-500/5 transition-colors">
              <RotateCcw size={14} /> Réinitialiser aux valeurs par défaut
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-red-400 font-semibold mb-3">⚠️ Cela va remettre toutes les catégories, objectifs et plans aux valeurs d'origine. Tes données (dépenses, épargne, BRVM) ne seront PAS supprimées.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowReset(false)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-empire-muted border border-empire-border">Annuler</button>
                <button onClick={() => { resetConfig(); setShowReset(false); }} className="flex-[2] py-2 rounded-xl text-xs font-bold bg-red-500 text-white">Confirmer le reset</button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Version */}
      <div className="text-center text-[10px] text-empire-muted py-4">
        Michel Arnaud Finance v2.0 · Built for future billionaires
      </div>
    </div>
  );
}
