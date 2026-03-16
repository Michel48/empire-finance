import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Area, AreaChart, Legend, ReferenceLine, ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { KpiCard, SectionCard, SectionTitle, ProgressBar, TrendBadge } from '../components/UI';
import { fmtCompact, getMonthKey, getLastNMonths } from '../utils/format';
import { MONTHS_SHORT } from '../utils/defaults';
import { useConfig } from '../hooks/useConfig';

// ─── Helper: get previous month key ───
function getPrevMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return getMonthKey(d);
}

// ─── Helper: compute monthly totals for a dataset ───
function monthlyTotals(data, months) {
  return months.map(m => data.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0));
}

// ─── Prediction: linear regression on last N months ───
function predictNext(values, nFuture = 3) {
  const n = values.length;
  if (n < 2) return Array(nFuture).fill(values[0] || 0);
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) { sumX += i; sumY += values[i]; sumXY += i * values[i]; sumX2 += i * i; }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return Array.from({ length: nFuture }, (_, i) => Math.max(0, Math.round(intercept + slope * (n + i))));
}

// ─── Custom Tooltip ───
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card !p-3 !rounded-xl text-xs shadow-lg border border-empire-border">
      <p className="font-bold text-empire-accent mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono" style={{ color: p.color || p.stroke }}>{p.name}: {fmtCompact(p.value)}</p>
      ))}
    </div>
  );
}

export default function Dashboard({ expenses, savings, brvmInvests }) {
  const { config } = useConfig();
  const { categories, savingsGoals, maxDepenses, salary } = config;

  const currentMonth = getMonthKey();
  const prevMonth = getPrevMonthKey();

  // ─── Current & Previous month expenses ───
  const monthExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const prevMonthExp = expenses.filter(e => e.date?.startsWith(prevMonth));
  const totalMonthExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const totalPrevMonthExp = prevMonthExp.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = maxDepenses - totalMonthExp;

  // ─── Current & Previous month savings ───
  const monthSav = savings.filter(e => e.date?.startsWith(currentMonth));
  const prevMonthSav = savings.filter(e => e.date?.startsWith(prevMonth));
  const totalMonthSav = monthSav.reduce((s, e) => s + Number(e.amount), 0);
  const totalPrevMonthSav = prevMonthSav.reduce((s, e) => s + Number(e.amount), 0);

  // ─── Current & Previous month BRVM ───
  const monthBrvm = brvmInvests.filter(e => e.date?.startsWith(currentMonth));
  const prevMonthBrvm = brvmInvests.filter(e => e.date?.startsWith(prevMonth));
  const totalMonthBrvm = monthBrvm.reduce((s, e) => s + Number(e.amount), 0);
  const totalPrevMonthBrvm = prevMonthBrvm.reduce((s, e) => s + Number(e.amount), 0);

  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);
  const netWorth = totalSaved + totalBrvm;

  // ─── Category pie chart ───
  const catData = useMemo(() => categories.map(cat => ({
    name: cat.label, value: monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0),
    prevValue: prevMonthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0),
    color: cat.color, icon: cat.icon, id: cat.id
  })).filter(c => c.value > 0 || c.prevValue > 0), [monthExp, prevMonthExp, categories]);

  // ─── Last 6 months + 3 month predictions ───
  const last6Keys = getLastNMonths(6).reverse();
  const expValues = monthlyTotals(expenses, last6Keys);
  const savValues = monthlyTotals(savings, last6Keys);
  const predExp = predictNext(expValues, 3);
  const predSav = predictNext(savValues, 3);

  const chartData = useMemo(() => {
    const now = new Date();
    const data = last6Keys.map((m, i) => {
      const [, mo] = m.split('-');
      return { name: MONTHS_SHORT[parseInt(mo) - 1], depenses: expValues[i], epargne: savValues[i], type: 'actual' };
    });
    // Add 3 predicted months
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      data.push({
        name: MONTHS_SHORT[d.getMonth()] + '*',
        depensesPred: predExp[i - 1],
        epargnePred: predSav[i - 1],
        type: 'predicted'
      });
    }
    return data;
  }, [last6Keys, expValues, savValues, predExp, predSav]);

  // ─── Wealth projection (cumulative) ───
  const wealthProjection = useMemo(() => {
    const months12 = getLastNMonths(6).reverse();
    let cumSav = 0, cumBrvm = 0;
    const actual = months12.map(m => {
      const [, mo] = m.split('-');
      cumSav += savings.filter(s => s.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0);
      cumBrvm += brvmInvests.filter(b => b.date?.startsWith(m)).reduce((s, e) => s + Number(e.amount), 0);
      return { name: MONTHS_SHORT[parseInt(mo) - 1], patrimoine: cumSav + cumBrvm, epargne: cumSav, brvm: cumBrvm };
    });
    // Project 6 months forward
    const avgMonthlySav = savValues.reduce((a, b) => a + b, 0) / savValues.length || 0;
    const avgMonthlyBrvm = monthlyTotals(brvmInvests, last6Keys).reduce((a, b) => a + b, 0) / 6 || 0;
    const now = new Date();
    let projSav = cumSav, projBrvm = cumBrvm;
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projSav += avgMonthlySav;
      projBrvm += avgMonthlyBrvm * 1.007; // ~8%/yr compound
      actual.push({ name: MONTHS_SHORT[d.getMonth()] + '*', patrimoinePred: Math.round(projSav + projBrvm), epargnePred: Math.round(projSav), brvmPred: Math.round(projBrvm) });
    }
    return actual;
  }, [savings, brvmInvests, savValues, last6Keys]);

  // ─── Category comparison (this month vs last) ───
  const catComparison = useMemo(() =>
    categories.map(cat => {
      const curr = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
      const prev = prevMonthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
      return { ...cat, current: curr, previous: prev };
    }).filter(c => c.current > 0 || c.previous > 0),
  [monthExp, prevMonthExp, categories]);

  // ─── Goals progress ───
  const goalsProgress = savingsGoals.map(g => {
    const current = savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0);
    const monthlyAvg = savValues.reduce((a, b) => a + b, 0) / Math.max(savValues.filter(v => v > 0).length, 1);
    const remaining = Math.max(g.target - current, 0);
    const monthsToGoal = monthlyAvg > 0 ? Math.ceil(remaining / monthlyAvg) : null;
    return { ...g, current, monthsToGoal };
  });

  // ─── Savings rate ───
  const savingsRate = salary > 0 ? ((totalMonthSav / salary) * 100).toFixed(0) : 0;
  const prevSavingsRate = salary > 0 ? ((totalPrevMonthSav / salary) * 100).toFixed(0) : 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ═══ KPIs with trend badges ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💸" title="Dépensé" value={fmtCompact(totalMonthExp)} sub={`sur ${fmtCompact(maxDepenses)}`}
          accent={remaining < 0 ? '#EF4444' : '#F59E0B'} delay={0}
          trend={<TrendBadge current={totalMonthExp} previous={totalPrevMonthExp} />} />
        <KpiCard icon="🏦" title="Épargné" value={fmtCompact(totalMonthSav)}
          accent="#10B981" delay={0.05}
          trend={<TrendBadge current={totalMonthSav} previous={totalPrevMonthSav} invertColors />} />
        <KpiCard icon="💎" title="Patrimoine" value={fmtCompact(netWorth)} accent="var(--accent)" sub="Épargne + BRVM" delay={0.1} />
        <KpiCard icon="📊" title="Taux d'épargne" value={`${savingsRate}%`} sub={`vs ${prevSavingsRate}% le mois dernier`}
          accent={Number(savingsRate) >= 30 ? '#10B981' : '#F59E0B'} delay={0.15} />
      </div>

      {/* ═══ Month comparison summary ═══ */}
      <SectionCard>
        <SectionTitle icon="⚡" right={<span className="text-[10px] text-empire-muted font-mono">vs mois dernier</span>}>Comparaison mensuelle</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Dépenses', curr: totalMonthExp, prev: totalPrevMonthExp, color: '#EF4444', invert: false },
            { label: 'Épargne', curr: totalMonthSav, prev: totalPrevMonthSav, color: '#10B981', invert: true },
            { label: 'BRVM', curr: totalMonthBrvm, prev: totalPrevMonthBrvm, color: '#F59E0B', invert: true },
          ].map(item => {
            const diff = item.prev > 0 ? ((item.curr - item.prev) / item.prev * 100) : 0;
            const isGood = item.invert ? diff >= 0 : diff <= 0;
            return (
              <div key={item.label} className="text-center p-3 rounded-2xl bg-empire-bg-soft border border-empire-border">
                <p className="text-[10px] text-empire-muted font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-base font-bold font-mono mt-1" style={{ color: item.color }}>{fmtCompact(item.curr)}</p>
                <p className="text-[10px] text-empire-muted font-mono mt-0.5">vs {fmtCompact(item.prev)}</p>
                <div className="mt-1.5">
                  <TrendBadge current={item.curr} previous={item.prev} invertColors={item.invert} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══ Goals with ETA prediction ═══ */}
      <SectionCard glow>
        <SectionTitle icon="🎯">Objectifs d'épargne</SectionTitle>
        <div className="space-y-5">
          {goalsProgress.map(g => {
            const ratio = g.target ? Math.min(g.current / g.target, 1) : 0;
            return (
              <div key={g.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold">{g.icon || '🎯'} {g.label}</span>
                  <div className="flex items-center gap-2">
                    {ratio >= 1 && <span className="text-[10px] text-emerald-500 font-bold">✅</span>}
                    {ratio < 1 && g.monthsToGoal && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold flex items-center gap-0.5">
                        <Target size={9} /> ~{g.monthsToGoal} mois
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-semibold" style={{ color: g.color }}>{fmtCompact(g.current)} / {fmtCompact(g.target)}</span>
                  </div>
                </div>
                <ProgressBar value={g.current} max={g.target} color={g.color} height={10} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ═══ Charts row: Pie + Evolution with predictions ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie */}
        <SectionCard>
          <SectionTitle icon="📊">Répartition du mois</SectionTitle>
          {catData.filter(c => c.value > 0).length === 0 ? (
            <div className="text-center py-10 text-empire-muted text-xs"><div className="text-3xl mb-2">📭</div>Aucune dépense</div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="w-[110px] h-[110px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={catData.filter(c => c.value > 0)} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={28} strokeWidth={0} paddingAngle={2}>
                    {catData.filter(c => c.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {catData.filter(c => c.value > 0).map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="flex-1 truncate text-empire-text-secondary">{c.icon} {c.name}</span>
                    <span className="font-mono text-empire-muted">{fmtCompact(c.value)}</span>
                    <TrendBadge current={c.value} previous={c.prevValue} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Evolution + Predictions */}
        <SectionCard>
          <SectionTitle icon="🔮" right={<span className="text-[9px] text-empire-muted font-mono">* = prédiction</span>}>Tendance & Prédictions</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData} barGap={3}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              {/* Actual bars */}
              <Bar dataKey="depenses" fill="#EF4444" radius={[5, 5, 0, 0]} name="Dépenses" />
              <Bar dataKey="epargne" fill="#10B981" radius={[5, 5, 0, 0]} name="Épargne" />
              {/* Predicted bars (dashed look via opacity) */}
              <Bar dataKey="depensesPred" fill="#EF4444" radius={[5, 5, 0, 0]} name="Dép. (préd.)" opacity={0.35} />
              <Bar dataKey="epargnePred" fill="#10B981" radius={[5, 5, 0, 0]} name="Ép. (préd.)" opacity={0.35} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[9px] text-empire-muted"><span className="w-2 h-2 rounded-full bg-red-500" />Dépenses</span>
            <span className="flex items-center gap-1.5 text-[9px] text-empire-muted"><span className="w-2 h-2 rounded-full bg-emerald-500" />Épargne</span>
            <span className="flex items-center gap-1.5 text-[9px] text-empire-muted"><span className="w-4 h-2 rounded-sm bg-empire-muted/30" />Prédit</span>
          </div>
        </SectionCard>
      </div>

      {/* ═══ Category comparison: This month vs Last month ═══ */}
      {catComparison.length > 0 && (
        <SectionCard>
          <SectionTitle icon="📊" right={<span className="text-[9px] text-empire-muted font-mono">ce mois vs dernier</span>}>Comparaison par catégorie</SectionTitle>
          <div className="space-y-3">
            {catComparison.map(cat => {
              const maxVal = Math.max(cat.current, cat.previous, 1);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium">{cat.icon} {cat.label}</span>
                    <TrendBadge current={cat.current} previous={cat.previous} />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-empire-muted w-[28px] text-right font-mono">M</span>
                    <div className="flex-1 h-[8px] rounded-full overflow-hidden bg-empire-bg-soft">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(cat.current / maxVal) * 100}%`, background: cat.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-empire-muted w-[48px] text-right">{fmtCompact(cat.current)}</span>
                  </div>
                  <div className="flex gap-1.5 items-center mt-0.5">
                    <span className="text-[9px] text-empire-muted w-[28px] text-right font-mono">M-1</span>
                    <div className="flex-1 h-[8px] rounded-full overflow-hidden bg-empire-bg-soft">
                      <div className="h-full rounded-full transition-all duration-700 opacity-50" style={{ width: `${(cat.previous / maxVal) * 100}%`, background: cat.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-empire-muted w-[48px] text-right">{fmtCompact(cat.previous)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ═══ Wealth projection chart ═══ */}
      <SectionCard>
        <SectionTitle icon="🚀" right={<span className="text-[9px] text-empire-muted font-mono">* = projection</span>}>Projection patrimoniale</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={wealthProjection}>
            <defs>
              <linearGradient id="gradPatrimoine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="patrimoine" stroke="var(--accent)" strokeWidth={2.5} fill="url(#gradPatrimoine)" name="Patrimoine" dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} />
            <Area type="monotone" dataKey="patrimoinePred" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" fill="url(#gradPred)" name="Projection" dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-5 justify-center mt-2">
          <span className="flex items-center gap-1.5 text-[9px] text-empire-muted"><span className="w-3 h-[2px] rounded-full" style={{ background: 'var(--accent)' }} />Réel</span>
          <span className="flex items-center gap-1.5 text-[9px] text-empire-muted"><span className="w-3 h-[2px] rounded-full bg-purple-500 opacity-60" style={{ borderTop: '1px dashed #8B5CF6' }} />Projection</span>
        </div>
      </SectionCard>

      {/* ═══ Budget by category with trend ═══ */}
      <SectionCard>
        <SectionTitle icon="📋">Budget par catégorie</SectionTitle>
        <div className="space-y-3.5">
          {categories.filter(c => c.budget > 0).map(cat => {
            const spent = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
            const prevSpent = prevMonthExp.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
            const over = spent > cat.budget;
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium">{cat.icon} {cat.label}</span>
                  <div className="flex items-center gap-2">
                    <TrendBadge current={spent} previous={prevSpent} />
                    <span className={`text-[11px] font-mono font-semibold ${over ? 'text-red-500' : 'text-empire-muted'}`}>{fmtCompact(spent)} / {fmtCompact(cat.budget)}</span>
                  </div>
                </div>
                <ProgressBar value={spent} max={cat.budget} color={over ? '#EF4444' : cat.color} height={6} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
