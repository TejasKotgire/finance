'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Wallet, ChevronRight, Settings, Search } from 'lucide-react';
import { TrueBurnCard }         from '@/components/widgets/TrueBurnCard';
import { WealthGauge }          from '@/components/charts/WealthGauge';
import { QuickEntry }           from '@/components/widgets/QuickEntry';
import { DailyLimitCard }       from '@/components/widgets/DailyLimitCard';
import { RecentTransactions }   from '@/components/widgets/RecentTransactions';
import { SpendingChart }        from '@/components/charts/SpendingChart';
import { CommandSearch }        from '@/components/ui/CommandSearch';
import { BottomNav }            from '@/components/ui/BottomNav';
import { useToast }             from '@/components/ui/Toast';
import {
  getMonthlyMetrics, getTransactions, getCategories, addTransaction,
} from '@/lib/supabase';
import {
  getCurrentMonth, getDaysRemainingInMonth,
  DEFAULT_INCOME, DEFAULT_WANTS_BUDGET, formatCurrency, calcSpendableToday,
} from '@/lib/utils';
import type { Transaction, Category } from '@/lib/database.types';

export default function Dashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    totalSpent:0, trueBurn:0, wealthBuilding:0, setupCosts:0,
    familySupport:0, investments:0, dailyBreakdown:{} as Record<string,number>, categoryBreakdown:{} as Record<string,number>,
  });
  const [transactions,  setTransactions]  = useState<Transaction[]>([]);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [entryOpen,     setEntryOpen]     = useState(false);
  const [loading,       setLoading]       = useState(true);

  const month = getCurrentMonth();

  const load = useCallback(async () => {
    try {
      const [m, txs, cats] = await Promise.all([
        getMonthlyMetrics(month),
        getTransactions({ month, limit: 12 }),
        getCategories(),
      ]);
      setMetrics(m);
      setTransactions(txs);
      setCategories(cats);
    } catch { toast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, [month]);                   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // ⌘K shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Open Quick Add if ?add=true (PWA shortcut)
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('add') === 'true') {
      setEntryOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    try {
      await addTransaction({ ...data, date: format(new Date(), 'yyyy-MM-dd') });
      toast(`₹${data.amount} logged ✓`, 'success');
      await load();
      setEntryOpen(false);
    } catch { toast('Failed to save', 'error'); }
  };

  const daysLeft      = getDaysRemainingInMonth();
  const wantsSpent    = metrics.trueBurn - metrics.wealthBuilding;
  const remainWants   = Math.max(0, DEFAULT_WANTS_BUDGET - wantsSpent);
  const spendToday    = calcSpendableToday(remainWants, daysLeft);
  const wealthRatio   = DEFAULT_INCOME > 0 ? (metrics.wealthBuilding / DEFAULT_INCOME) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-dvh bg-finance-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#00f5d4] animate-spin" />
          <p className="text-white/30 text-sm font-mono">Loading your finances…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-finance-mesh pb-28 safe-pt">
      {/* ── Header ── */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/35 text-[11px] font-mono uppercase tracking-widest">
              {format(new Date(), 'MMMM yyyy')}
            </p>
            <h1 className="font-display text-2xl font-extrabold text-white mt-0.5 leading-none">
              Fin<span style={{ color:'#00f5d4' }}>Flow</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className="glass glass-hover w-10 h-10 flex items-center justify-center rounded-xl">
              <Search className="w-4 h-4 text-white/50" />
            </button>
            <a href="/settings"
              className="glass glass-hover w-10 h-10 flex items-center justify-center rounded-xl">
              <Settings className="w-4 h-4 text-white/50" />
            </a>
          </div>
        </div>

        {/* Income pill */}
        <div className="glass-sm px-3 py-2 mt-3 flex items-center justify-between rounded-xl">
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-[#ffb703]" />
            <span className="text-white/40 text-xs">Monthly Income</span>
          </div>
          <span className="font-mono text-sm font-semibold text-[#ffb703]">
            {formatCurrency(DEFAULT_INCOME)}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="px-4 space-y-3 mt-3">

        {/* Row 1 — True Burn + Daily Limit */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up delay-1">
          <TrueBurnCard trueBurn={metrics.trueBurn} totalSpent={metrics.totalSpent} setupCosts={metrics.setupCosts} />
          <DailyLimitCard spendableToday={spendToday} remainingBudget={remainWants} daysRemaining={daysLeft} />
        </div>

        {/* Row 2 — Wealth Gauge */}
        <div className="animate-slide-up delay-2">
          <WealthGauge
            wealthAmount={metrics.wealthBuilding} income={DEFAULT_INCOME}
            investments={metrics.investments} familySupport={metrics.familySupport}
            ratio={wealthRatio}
          />
        </div>

        {/* Row 3 — Spending trend chart */}
        <div className="animate-slide-up delay-3">
          <SpendingChart dailyBreakdown={metrics.dailyBreakdown} currentMonth={month} />
        </div>

        {/* Row 4 — Recent transactions */}
        <div className="animate-slide-up delay-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xs font-semibold text-white/50 uppercase tracking-wider">
              Recent
            </h2>
            <a href="/transactions"
              className="flex items-center gap-0.5 text-xs text-[#00f5d4]/65 hover:text-[#00f5d4] transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <RecentTransactions transactions={transactions} onRefresh={load} />
        </div>

        {/* Row 5 — Quick links */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up delay-5">
          <a href="/remittance"
            className="glass glass-hover p-4 flex items-center gap-3 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center text-xl">❤️</div>
            <div>
              <p className="text-white/80 text-sm font-semibold">Family</p>
              <p className="text-white/35 text-xs">Safety Net</p>
            </div>
          </a>
          <a href="/analytics"
            className="glass glass-hover p-4 flex items-center gap-3 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#7b2fff]/10 flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-white/80 text-sm font-semibold">Insights</p>
              <p className="text-white/35 text-xs">Analytics</p>
            </div>
          </a>
        </div>
      </div>

      <BottomNav onQuickAdd={() => setEntryOpen(true)} />
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      {entryOpen && (
        <QuickEntry categories={categories} onSubmit={handleAdd} onClose={() => setEntryOpen(false)} />
      )}
    </main>
  );
}
