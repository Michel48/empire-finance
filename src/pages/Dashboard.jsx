import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard, SectionCard, SectionTitle, ProgressBar } from '../components/UI';
import { fmt, fmtCompact, getMonthKey, getLastNMonths, pct } from '../utils/format';
import { CATEGORIES, SALARY, MAX_DEPENSES, BUDGET_EMMENAGEMENT, MONTHS_SHORT, SAVINGS_GOALS } from '../utils/constants';

export default function Dashboard({ expenses, savings, brvmInvests }) {
  const currentMonth = getMonthKey();
  const monthExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = MAX_DEPENSES - totalMonthExp;
  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);
  const netWorth = totalSaved + totalBrvm;

  const catData = useMemo(() =>
    CATEGORIES.map(cat => ({
      name: cat.label,
      value: monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0),
      color: cat.color,
      icon: cat.icon,
    })).filter(c => c.value > 0),
  [monthExp]);

  const last6 = useMemo(() => {
    return getLastNMonths(6).reverse().map(m => {
      const [y, mo] = m.split('-');
      const mExp = expenses.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0);
      const mSav = savings.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0);
      return { name: MONTHS_SHORT[parseInt(mo) - 1], depenses: mExp, epargne: mSav };
    });
  }, [expenses, savings]);

  // Goals progress
  const goalsProgress = SAVINGS_GOALS.map(g => {
    const total = savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...g, current: total };
  });

  return (
    <div className="flex flex-col gap-3.5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💸" title="Dépensé" value={fmtCompact(totalMonthExp)} sub={`sur ${fmtCompact(MAX_DEPENSES)}`} accent={remaining < 0 ? '#EF4444' : '#F59E0B'} delay={0} />
        <KpiCard icon="✅" title="Reste" value={fmtCompact(Math.max(remaining, 0))} accent={remaining < 0 ? '#EF4444' : '#10B981'} sub={remaining < 0 ? 'Dépassé !' : ''} delay={0.05} />
        <KpiCard icon="💎" title="Patrimoine" value={fmtCompact(netWorth)} accent="#C8A962" sub="Épargne + BRVM" delay={0.1} />
        <KpiCard icon="📈" title="BRVM" value={fmtCompact(totalBrvm)} sub={`${brvmInvests.length} positions`} accent="#F59E0B" delay={0.15} />
      </div>

      {/* Goals */}
      <SectionCard glow>
        <SectionTitle icon="🎯">Objectifs d'épargne</SectionTitle>
        <div className="space-y-4">
          {goalsProgress.map(g => (
            <div key={g.id}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold">{g.label}</span>
                <span className="text-[11px] font-mono" style={{ color: g.color }}>
                  {fmtCompact(g.current)} / {fmtCompact(g.target)}
                </span>
              </div>
              <ProgressBar value={g.current} max={g.target} color={g.color} height={8} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-3.5">
        {/* Pie chart */}
        <SectionCard>
          <SectionTitle icon="📊">Répartition du mois</SectionTitle>
          {catData.length === 0 ? (
            <div className="text-center py-8 text-empire-muted text-xs">Aucune dépense ce mois</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[120px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={0}>
                      {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {catData.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="flex-1 truncate">{c.icon} {c.name}</span>
                    <span className="font-mono text-empire-muted">{fmtCompact(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Bar chart */}
        <SectionCard>
          <SectionTitle icon="📈">Évolution 6 mois</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last6} barGap={2}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 12, fontSize: 11 }}
                labelStyle={{ color: '#C8A962', fontWeight: 700 }}
                formatter={(v) => [fmtCompact(v), '']}
              />
              <Bar dataKey="depenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Dépenses" />
              <Bar dataKey="epargne" fill="#10B981" radius={[4, 4, 0, 0]} name="Épargne" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-empire-muted"><span className="w-2 h-2 rounded-full bg-red-500" />Dépenses</span>
            <span className="flex items-center gap-1.5 text-[10px] text-empire-muted"><span className="w-2 h-2 rounded-full bg-emerald-500" />Épargne</span>
          </div>
        </SectionCard>
      </div>

      {/* Budget by category */}
      <SectionCard>
        <SectionTitle icon="📋">Budget par catégorie</SectionTitle>
        <div className="space-y-3">
          {CATEGORIES.filter(c => c.budget > 0).map(cat => {
            const spent = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
            const over = spent > cat.budget;
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">{cat.icon} {cat.label}</span>
                  <span className={`text-[11px] font-mono ${over ? 'text-red-400' : 'text-empire-muted'}`}>
                    {fmtCompact(spent)} / {fmtCompact(cat.budget)}
                  </span>
                </div>
                <ProgressBar value={spent} max={cat.budget} color={over ? '#EF4444' : cat.color} height={5} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
