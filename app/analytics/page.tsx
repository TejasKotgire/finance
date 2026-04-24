'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, subMonths } from 'date-fns';
import { BarChart3, PieChart as PieIcon, TrendingUp, Zap } from 'lucide-react';
import { BottomNav }          from '@/components/ui/BottomNav';
import { CommandSearch }      from '@/components/ui/CommandSearch';
import { QuickEntry }         from '@/components/widgets/QuickEntry';
import { GlassCard }          from '@/components/ui/GlassCard';
import { CategoryPie }        from '@/components/charts/CategoryPie';
import { MonthlyBar }         from '@/components/charts/MonthlyBar';
import { useToast }           from '@/components/ui/Toast';
import { getMonthlyMetrics, getCategories, addTransaction } from '@/lib/supabase';
import {
  formatCurrency, getCategoryColor, getCategoryIcon,
  getCurrentMonth, getDaysElapsed, getDaysInMonth, DEFAULT_INCOME,
} from '@/lib/utils';
import type { Category } from '@/lib/database.types';

interface MonthRow { month: string; total: number; trueBurn: number; }

export default function AnalyticsPage() {
  const { toast }  = useToast();
  const [catData,  setCatData]   = useState<Record<string,number>>({});
  const [barData,  setBarData]   = useState<MonthRow[]>([]);
  const [cats,     setCats]      = useState<Category[]>([]);
  const [thisM,    setThisM]     = useState({ total:0, trueBurn:0, wealth:0 });
  const [entryOpen,setEntryOpen] = useState(false);
  const [search,   setSearch]    = useState(false);
  const [loading,  setLoading]   = useState(true);

  const curMonth = getCurrentMonth();

  const load = useCallback(async () => {
    try {
      const months = Array.from({ length: 6 }, (_,i) =>
        format(subMonths(new Date(), i), 'yyyy-MM')
      ).reverse();

      const [metricsArr, catList] = await Promise.all([
        Promise.all(months.map(m => getMonthlyMetrics(m).then(d => ({ month:m, ...d })))),
        getCategories(),
      ]);

      const bar: MonthRow[] = metricsArr.map(m => ({
        month:    format(new Date(m.month + '-01'), 'MMM'),
        total:    m.totalSpent,
        trueBurn: m.trueBurn,
      }));
      setBarData(bar);

      const last = metricsArr[metricsArr.length - 1];
      setThisM({ total: last.totalSpent, trueBurn: last.trueBurn, wealth: last.wealthBuilding });
      setCatData(last.categoryBreakdown ?? {});
      setCats(catList);
    } catch { toast('Failed to load analytics', 'error'); }
    finally { setLoading(false); }
  }, [curMonth]);                // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction({ ...data, date: format(new Date(), 'yyyy-MM-dd') });
    toast('Expense saved ✓');
    await load();
    setEntryOpen(false);
  };

  const elapsed     = getDaysElapsed();
  const inMonth     = getDaysInMonth();
  const avgDaily    = elapsed > 0 ? thisM.total / elapsed : 0;
  const projected   = avgDaily * inMonth;
  const topCat      = Object.entries(catData).sort(([,a],[,b])=>b-a)[0];
  const wealthPct   = DEFAULT_INCOME > 0 ? (thisM.wealth / DEFAULT_INCOME * 100) : 0;

  return (
    <main className="min-h-dvh bg-finance-mesh pb-28 safe-pt">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl font-extrabold text-white">Analytics</h1>
        <p className="text-white/35 text-sm mt-0.5">{format(new Date(), 'MMMM yyyy')} · Deep insights</p>
      </header>

      <div className="px-4 space-y-4 mt-3">

        {/* Quick stat pair */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-sm rounded-2xl p-3">
            <p className="text-white/35 text-xs mb-1">Avg Daily Spend</p>
            <p className="font-mono text-base font-bold text-[#00b4d8]">{formatCurrency(avgDaily, true)}</p>
            <p className="text-white/22 text-xs mt-0.5">This month so far</p>
          </div>
          <div className="glass-sm rounded-2xl p-3">
            <p className="text-white/35 text-xs mb-1">Month-End Forecast</p>
            <p className="font-mono text-base font-bold"
              style={{ color: projected > DEFAULT_INCOME * 0.75 ? '#ff006e' : '#ffb703' }}>
              {formatCurrency(projected, true)}
            </p>
            <p className="text-white/22 text-xs mt-0.5">Projected total</p>
          </div>
        </div>

        {/* 6-month bar */}
        <GlassCard accentColor="#00b4d8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#00b4d8]" />
            <span className="text-white/65 text-sm font-semibold font-display">6-Month Overview</span>
          </div>
          {loading
            ? <div className="h-36 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#00b4d8] rounded-full animate-spin" />
              </div>
            : <>
                <MonthlyBar data={barData} />
                <div className="flex items-center gap-4 mt-2 justify-center">
                  {[['rgba(0,180,216,0.32)','Total'],['#ff006e','True Burn']].map(([c,l])=>(
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-3 h-2 rounded-sm" style={{ background:c }} />
                      <span className="text-white/28 text-xs">{l}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </GlassCard>

        {/* Category pie */}
        <GlassCard accentColor="#7b2fff">
          <div className="flex items-center gap-2 mb-1">
            <PieIcon className="w-4 h-4 text-[#7b2fff]" />
            <span className="text-white/65 text-sm font-semibold font-display">Category Split</span>
            <span className="ml-auto text-white/28 text-xs font-mono">{format(new Date(),'MMM')}</span>
          </div>
          {Object.keys(catData).length === 0
            ? <div className="h-28 flex items-center justify-center">
                <p className="text-white/28 text-sm">No data yet this month</p>
              </div>
            : <CategoryPie data={catData} total={thisM.total} />
          }
        </GlassCard>

        {/* Smart insights */}
        <div>
          <p className="text-white/38 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Smart Insights
          </p>
          <div className="space-y-2">

            {topCat && (
              <GlassCard accentColor={getCategoryColor(topCat[0])}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background:`${getCategoryColor(topCat[0])}15` }}>
                    {getCategoryIcon(topCat[0])}
                  </div>
                  <div className="flex-1">
                    <p className="text-white/42 text-xs">Top spend category this month</p>
                    <p className="text-white/88 text-sm font-semibold">{topCat[0]}</p>
                  </div>
                  <p className="font-mono text-sm font-bold flex-shrink-0"
                    style={{ color: getCategoryColor(topCat[0]) }}>
                    {formatCurrency(topCat[1])}
                  </p>
                </div>
              </GlassCard>
            )}

            <GlassCard accentColor="#06d6a0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center text-xl flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#06d6a0]" />
                </div>
                <div className="flex-1">
                  <p className="text-white/42 text-xs">Wealth-building rate</p>
                  <p className="text-white/88 text-sm font-semibold">
                    {DEFAULT_INCOME > 0 ? `${wealthPct.toFixed(1)}% of income` : '—'}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold text-[#06d6a0] flex-shrink-0">
                  {formatCurrency(thisM.wealth)}
                </p>
              </div>
            </GlassCard>

            {projected > DEFAULT_INCOME && (
              <GlassCard accentColor="#ff006e">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff006e]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <p className="text-[#ff006e]/80 text-xs font-semibold">Overspend Alert</p>
                    <p className="text-white/65 text-sm">
                      Projected to exceed income by{' '}
                      <span className="text-[#ff006e] font-semibold">
                        {formatCurrency(projected - DEFAULT_INCOME)}
                      </span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {wealthPct >= 50 && (
              <GlassCard accentColor="#ffb703">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffb703]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    🏆
                  </div>
                  <div>
                    <p className="text-[#ffb703]/80 text-xs font-semibold">Wealth Target Hit!</p>
                    <p className="text-white/65 text-sm">You're building wealth at 50%+ of income 🎉</p>
                  </div>
                </div>
              </GlassCard>
            )}

            <GlassCard accentColor="#00b4d8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#00b4d8]" />
                </div>
                <div>
                  <p className="text-white/42 text-xs">Daily run-rate</p>
                  <p className="text-white/88 text-sm font-semibold">
                    {formatCurrency(avgDaily)}/day · {elapsed}/{inMonth} days elapsed
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <BottomNav onQuickAdd={() => setEntryOpen(true)} />
      <CommandSearch open={search} onClose={() => setSearch(false)} />
      {entryOpen && (
        <QuickEntry categories={cats} onSubmit={handleAdd} onClose={() => setEntryOpen(false)} />
      )}
    </main>
  );
}
