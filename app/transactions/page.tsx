'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, subMonths } from 'date-fns';
import { BottomNav }          from '@/components/ui/BottomNav';
import { CommandSearch }      from '@/components/ui/CommandSearch';
import { QuickEntry }         from '@/components/widgets/QuickEntry';
import { useToast }           from '@/components/ui/Toast';
import { TxSkeleton }         from '@/components/ui/Skeleton';
import {
  getTransactions, getCategories, getMonthlyMetrics, addTransaction, deleteTransaction,
} from '@/lib/supabase';
import { formatCurrency, getCategoryColor, getCategoryIcon, getCurrentMonth } from '@/lib/utils';
import type { Transaction, Category } from '@/lib/database.types';
import { Trash2 } from 'lucide-react';

export default function TransactionsPage() {
  const { toast } = useToast();
  const [txs,         setTxs]         = useState<Transaction[]>([]);
  const [cats,        setCats]         = useState<Category[]>([]);
  const [selMonth,    setSelMonth]     = useState(getCurrentMonth());
  const [selCat,      setSelCat]       = useState('');
  const [metrics,     setMetrics]      = useState({ totalSpent:0, trueBurn:0, categoryBreakdown:{} as Record<string,number> });
  const [searchOpen,  setSearchOpen]   = useState(false);
  const [entryOpen,   setEntryOpen]    = useState(false);
  const [loading,     setLoading]      = useState(true);
  const [deletingId,  setDeletingId]   = useState<string|null>(null);

  const months = Array.from({ length: 6 }, (_, i) =>
    format(subMonths(new Date(), i), 'yyyy-MM')
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, catData, m] = await Promise.all([
        getTransactions({ month: selMonth, category: selCat || undefined }),
        getCategories(),
        getMonthlyMetrics(selMonth),
      ]);
      setTxs(data);
      setCats(catData);
      setMetrics(m);
    } catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [selMonth, selCat]);                     // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction({ ...data, date: format(new Date(), 'yyyy-MM-dd') });
    toast('Expense saved ✓');
    await load();
    setEntryOpen(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteTransaction(id); toast('Deleted', 'info'); await load(); }
    catch { toast('Delete failed', 'error'); }
    finally { setDeletingId(null); }
  };

  // Group by date
  const grouped = txs.reduce((acc, tx) => {
    (acc[tx.date] ??= []).push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Top 5 categories by spend
  const topCats = Object.entries(metrics.categoryBreakdown)
    .sort(([,a],[,b]) => b - a).slice(0, 5);

  return (
    <main className="min-h-dvh bg-finance-mesh pb-28 safe-pt">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl font-extrabold text-white">Transactions</h1>
        <p className="text-white/35 text-sm mt-0.5">Your complete spending history</p>
      </header>

      <div className="px-4 space-y-4 mt-2">

        {/* Month selector pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {months.map(m => {
            const active = m === selMonth;
            const label  = format(new Date(m + '-01'), 'MMM yy');
            return (
              <button key={m} onClick={() => setSelMonth(m)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={active
                  ? { background:'rgba(0,245,212,0.13)', color:'#00f5d4', border:'1px solid rgba(0,245,212,0.28)' }
                  : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.38)', border:'1px solid rgba(255,255,255,0.07)' }
                }>{label}</button>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="glass-sm rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/35 text-xs">Total Spent</p>
            <p className="font-mono text-base font-bold text-white">{formatCurrency(metrics.totalSpent)}</p>
          </div>
          <div className="text-center">
            <p className="text-white/35 text-xs">Entries</p>
            <p className="font-mono text-base font-bold text-white">{txs.length}</p>
          </div>
          <div className="text-right">
            <p className="text-white/35 text-xs">True Burn</p>
            <p className="font-mono text-base font-bold text-[#ff006e]">{formatCurrency(metrics.trueBurn)}</p>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelCat('')}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={selCat === ''
              ? { background:'rgba(0,245,212,0.13)', color:'#00f5d4', border:'1px solid rgba(0,245,212,0.28)' }
              : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.38)', border:'1px solid rgba(255,255,255,0.07)' }
            }>All</button>
          {cats.map(c => (
            <button key={c.id} onClick={() => setSelCat(c.name === selCat ? '' : c.name)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              style={selCat === c.name
                ? { background:`${c.color}1a`, color:c.color, border:`1px solid ${c.color}38` }
                : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.38)', border:'1px solid rgba(255,255,255,0.07)' }
              }>
              <span>{c.icon}</span><span>{c.name.split('/')[0]}</span>
            </button>
          ))}
        </div>

        {/* Category breakdown bars */}
        {topCats.length > 0 && !selCat && (
          <div className="glass rounded-2xl p-4">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
              Top Categories
            </p>
            <div className="space-y-2.5">
              {topCats.map(([name, total]) => {
                const pct   = metrics.totalSpent > 0 ? (total / metrics.totalSpent) * 100 : 0;
                const color = getCategoryColor(name);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCategoryIcon(name)}</span>
                        <span className="text-white/60 text-xs">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/25 text-xs">{pct.toFixed(0)}%</span>
                        <span className="font-mono text-xs font-semibold text-white/75">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transaction list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_,i) => <TxSkeleton key={i} />)}
          </div>
        ) : dates.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-white/38 text-sm">No transactions for this period</p>
          </div>
        ) : (
          dates.map(date => {
            const items    = grouped[date];
            const dayTotal = items.reduce((s, t) => s + Number(t.amount), 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-white/35 text-xs font-semibold uppercase tracking-wider">
                    {format(new Date(date), 'EEEE, dd MMM')}
                  </p>
                  <p className="text-white/25 text-xs font-mono">{formatCurrency(dayTotal)}</p>
                </div>
                <div className="space-y-2">
                  {items.map(tx => {
                    const color     = getCategoryColor(tx.category_name);
                    const icon      = getCategoryIcon(tx.category_name);
                    const isDeleting = deletingId === tx.id;
                    return (
                      <div key={tx.id}
                        className="glass glass-hover rounded-2xl px-4 py-3 flex items-center gap-3 group transition-opacity"
                        style={{ opacity: isDeleting ? 0.4 : 1 }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background:`${color}18` }}>{icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-white/88 text-sm font-semibold truncate">{tx.category_name}</p>
                            {tx.is_setup_cost && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffb703]/10 text-[#ffb703] border border-[#ffb703]/22">setup</span>
                            )}
                            {tx.is_wealth_building && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/22">wealth</span>
                            )}
                          </div>
                          <p className="text-white/28 text-xs mt-0.5 truncate">
                            {tx.payment_method}{tx.note ? ` · ${tx.note}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="font-mono font-semibold text-sm" style={{ color }}>
                            {formatCurrency(Number(tx.amount))}
                          </p>
                          <button onClick={() => handleDelete(tx.id)} disabled={!!deletingId}
                            className="opacity-0 group-hover:opacity-100 text-white/18 hover:text-[#ff006e] transition-all p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav onQuickAdd={() => setEntryOpen(true)} />
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      {entryOpen && (
        <QuickEntry categories={cats} onSubmit={handleAdd} onClose={() => setEntryOpen(false)} />
      )}
    </main>
  );
}
