'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, X, TrendingDown } from 'lucide-react';
import { searchTransactions } from '@/lib/supabase';
import { formatCurrency, getCategoryIcon, getCategoryColor } from '@/lib/utils';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/database.types';

interface Props { open: boolean; onClose: () => void; }

export function CommandSearch({ open, onClose }: Props) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try { setResults(await searchTransactions(q)); }
    catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  useEffect(() => { if (!open) { setQuery(''); setResults([]); } }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const total = results.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg animate-slide-up">
        <Command shouldFilter={false}>
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
            <Search className="w-4 h-4 text-[#00f5d4] flex-shrink-0" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search past spends… e.g. face wash, amazon"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/25"
            />
            {loading
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-[#00f5d4] rounded-full animate-spin flex-shrink-0" />
              : <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
            }
          </div>

          <Command.List>
            {/* Empty state */}
            {query.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">⌘</p>
                <p className="text-white/35 text-sm">Search any transaction</p>
                <p className="text-white/20 text-xs mt-1">by name, category, or note</p>
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <Command.Empty>
                <div className="py-10 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-white/35 text-sm">No results for "{query}"</p>
                </div>
              </Command.Empty>
            )}

            {results.length > 0 && (
              <Command.Group>
                {/* Results header */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-white/30 text-xs uppercase tracking-widest font-semibold">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-white/30 text-xs font-mono">
                    {formatCurrency(total)} total
                  </span>
                </div>

                {results.map(tx => {
                  const color = getCategoryColor(tx.category_name);
                  const icon  = getCategoryIcon(tx.category_name);
                  return (
                    <Command.Item
                      key={tx.id}
                      value={tx.id}
                      className="flex items-center gap-3 px-4 py-3 mx-1 mb-0.5 rounded-xl cursor-default"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${color}15` }}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium">{tx.category_name}</p>
                        <p className="text-white/30 text-xs truncate mt-0.5">
                          {format(new Date(tx.date), 'dd MMM yyyy')}
                          {' · '}{tx.payment_method}
                          {tx.note ? ` · ${tx.note}` : ''}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold flex-shrink-0"
                        style={{ color }}>{formatCurrency(Number(tx.amount))}</p>
                    </Command.Item>
                  );
                })}

                {/* Total row */}
                {results.length > 1 && (
                  <div className="mx-1 my-2 px-4 py-3 rounded-xl flex items-center justify-between"
                    style={{ background:'rgba(0,245,212,0.05)', border:'1px solid rgba(0,245,212,0.12)' }}>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#00f5d4]" />
                      <span className="text-white/50 text-sm">Total for "{query}"</span>
                    </div>
                    <span className="font-mono font-bold text-[#00f5d4]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                )}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-3">
            <kbd className="text-white/20 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">ESC</kbd>
            <span className="text-white/20 text-xs">to close</span>
            <span className="text-white/10 mx-1">·</span>
            <kbd className="text-white/20 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">↑↓</kbd>
            <span className="text-white/20 text-xs">navigate</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
