import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard, SectionCard, SectionTitle, ProgressBar } from '../components/UI';
import { fmtCompact, getMonthKey, getLastNMonths } from '../utils/format';
import { MONTHS_SHORT } from '../utils/defaults';
import { useConfig } from '../hooks/useConfig';

export default function Dashboard({ expenses, savings, brvmInvests }) {
  const { config } = useConfig();
  const { categories, savingsGoals, maxDepenses } = config;

  const currentMonth = getMonthKey();
  const monthExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = maxDepenses - totalMonthExp;
  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);

  const catData = useMemo(() => categories.map(cat => ({ name: cat.label, value: monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0), color: cat.color, icon: cat.icon })).filter(c => c.value > 0), [monthExp, categories]);

  const last6 = useMemo(() => getLastNMonths(6).reverse().map(m => {
    const [, mo] = m.split('-');
    return { name: MONTHS_SHORT[parseInt(mo) - 1], depenses: expenses.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0), epargne: savings.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0) };
  }), [expenses, savings]);

  const goalsProgress = savingsGoals.map(g => ({ ...g, current: savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0) }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💸" title="Dépensé" value={fmtCompact(totalMonthExp)} sub={`sur ${fmtCompact(maxDepenses)}`} accent={remaining < 0 ? '#EF4444' : '#F59E0B'} delay={0} />
        <KpiCard icon="✅" title="Reste" value={fmtCompact(Math.max(remaining, 0))} accent={remaining < 0 ? '#EF4444' : '#10B981'} delay={0.05} />
        <KpiCard icon="💎" title="Patrimoine" value={fmtCompact(totalSaved + totalBrvm)} accent="var(--accent)" sub="Épargne + BRVM" delay={0.1} />
        <KpiCard icon="📈" title="BRVM" value={fmtCompact(totalBrvm)} sub={`${brvmInvests.length} position${brvmInvests.length !== 1 ? 's' : ''}`} accent="#F59E0B" delay={0.15} />
      </div>

      <SectionCard glow>
        <SectionTitle icon="🎯">Objectifs d'épargne</SectionTitle>
        <div className="space-y-5">
          {goalsProgress.map(g => { const ratio = g.target ? Math.min(g.current / g.target, 1) : 0; return (
            <div key={g.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold">{g.icon || '🎯'} {g.label}</span>
                <div className="flex items-center gap-2">{ratio >= 1 && <span className="text-[10px] text-emerald-500 font-bold">✅</span>}<span className="text-[11px] font-mono font-semibold" style={{ color: g.color }}>{fmtCompact(g.current)} / {fmtCompact(g.target)}</span></div>
              </div>
              <ProgressBar value={g.current} max={g.target} color={g.color} height={10} />
            </div>
          ); })}
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard>
          <SectionTitle icon="📊">Répartition</SectionTitle>
          {catData.length === 0 ? <div className="text-center py-10 text-empire-muted text-xs"><div className="text-3xl mb-2">📭</div>Aucune dépense</div> : (
            <div className="flex items-center gap-5">
              <div className="w-[110px] h-[110px] flex-shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={28} strokeWidth={0} paddingAngle={2}>{catData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer></div>
              <div className="flex-1 space-y-2">{catData.map(c => (<div key={c.name} className="flex items-center gap-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} /><span className="flex-1 truncate text-empire-text-secondary">{c.icon} {c.name}</span><span className="font-mono text-empire-muted">{fmtCompact(c.value)}</span></div>))}</div>
            </div>
          )}
        </SectionCard>
        <SectionCard>
          <SectionTitle icon="📈">6 derniers mois</SectionTitle>
          <ResponsiveContainer width="100%" height={170}><BarChart data={last6} barGap={3}><XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 11 }} formatter={v => [fmtCompact(v), '']} /><Bar dataKey="depenses" fill="#EF4444" radius={[6, 6, 0, 0]} name="Dépenses" /><Bar dataKey="epargne" fill="#10B981" radius={[6, 6, 0, 0]} name="Épargne" /></BarChart></ResponsiveContainer>
          <div className="flex gap-5 justify-center mt-3"><span className="flex items-center gap-1.5 text-[10px] text-empire-muted"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Dépenses</span><span className="flex items-center gap-1.5 text-[10px] text-empire-muted"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Épargne</span></div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionTitle icon="📋">Budget par catégorie</SectionTitle>
        <div className="space-y-3.5">{categories.filter(c => c.budget > 0).map(cat => { const spent = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0); const over = spent > cat.budget; return (
          <div key={cat.id}><div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium">{cat.icon} {cat.label}</span><span className={`text-[11px] font-mono font-semibold ${over ? 'text-red-500' : 'text-empire-muted'}`}>{fmtCompact(spent)} / {fmtCompact(cat.budget)}</span></div><ProgressBar value={spent} max={cat.budget} color={over ? '#EF4444' : cat.color} height={6} /></div>
        ); })}</div>
      </SectionCard>
    </div>
  );
}
