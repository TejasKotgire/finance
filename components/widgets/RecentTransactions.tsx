'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { getCategoryIcon, getCategoryColor, formatCurrency } from '@/lib/utils';
import { deleteTransaction } from '@/lib/supabase';
import type { Transaction } from '@/lib/database.types';

interface Props { transactions: Transaction[]; onRefresh: () => void; }

export function RecentTransactions({ transactions, onRefresh }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteTransaction(id); onRefresh(); }
    catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-4xl mb-2">💸</p>
        <p className="text-white/38 text-sm">No transactions yet this month</p>
        <p className="text-white/20 text-xs mt-1">Tap + to log your first expense</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => {
        const color = getCategoryColor(tx.category_name);
        const icon  = getCategoryIcon(tx.category_name);
        const isDeleting = deletingId === tx.id;
        return (
          <div key={tx.id}
            className="glass glass-hover rounded-2xl px-4 py-3 flex items-center gap-3 group transition-opacity"
            style={{ opacity: isDeleting ? 0.4 : 1, animationDelay:`${i*0.04}s` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background:`${color}18` }}>{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-white/90 text-sm font-semibold truncate">{tx.category_name}</p>
                {tx.is_setup_cost && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffb703]/10 text-[#ffb703] border border-[#ffb703]/25">setup</span>
                )}
                {tx.is_wealth_building && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/25">wealth</span>
                )}
              </div>
              <p className="text-white/28 text-xs mt-0.5 truncate">
                {format(new Date(tx.date), 'dd MMM')} · {tx.payment_method}
                {tx.note ? ` · ${tx.note}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="font-mono font-semibold text-sm" style={{ color }}>{formatCurrency(Number(tx.amount))}</p>
              <button onClick={() => handleDelete(tx.id)} disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 text-white/18 hover:text-[#ff006e] transition-all p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
