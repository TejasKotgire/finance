'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfYear } from 'date-fns';
import { Heart, Plus, X } from 'lucide-react';
import { BottomNav }        from '@/components/ui/BottomNav';
import { CommandSearch }    from '@/components/ui/CommandSearch';
import { useToast }         from '@/components/ui/Toast';
import { getRemittances, addRemittance } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Remittance } from '@/lib/database.types';

const RECIPIENTS = ['Family', 'Mom', 'Dad', 'Parents'] as const;
const METHODS    = ['Bank Transfer', 'UPI', 'Cash'] as const;

export default function RemittancePage() {
  const { toast }   = useToast();
  const [items, setItems]     = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [search,  setSearch]  = useState(false);

  // form
  const [amount,    setAmount]    = useState('');
  const [date,      setDate]      = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipient, setRecipient] = useState<string>('Family');
  const [method,    setMethod]    = useState<string>('Bank Transfer');
  const [note,      setNote]      = useState('');
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getRemittances()); }
    catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);                             // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Stats
  const total     = items.reduce((s, r) => s + Number(r.amount), 0);
  const yearStart = startOfYear(new Date());
  const thisYear  = items.filter(r => new Date(r.date) >= yearStart)
                         .reduce((s,r) => s + Number(r.amount), 0);
  const curMonth  = format(new Date(), 'yyyy-MM');
  const thisMonth = items.filter(r => r.date.startsWith(curMonth))
                         .reduce((s,r) => s + Number(r.amount), 0);
  const monthSet  = new Set(items.map(r => r.date.slice(0,7))).size;
  const avg       = monthSet > 0 ? total / monthSet : 0;

  // Group by month
  const grouped = items.reduce((acc, r) => {
    const k = r.date.slice(0,7);
    (acc[k] ??= []).push(r);
    return acc;
  }, {} as Record<string, Remittance[]>);
  const sortedMonths = Object.keys(grouped).sort((a,b) => b.localeCompare(a));

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      await addRemittance({ amount: parseFloat(amount), date, recipient, note: note||undefined, payment_method: method });
      toast(`₹${amount} sent to ${recipient} ✓`);
      await load();
      setAddOpen(false);
      setAmount(''); setNote('');
    } catch { toast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <main className="min-h-dvh bg-finance-mesh pb-28 safe-pt">
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#06d6a0]" fill="#06d6a0" />
              <h1 className="font-display text-2xl font-extrabold text-white">Family Safety Net</h1>
            </div>
            <p className="text-white/35 text-sm mt-0.5">
              Money sent home — your most important investment
            </p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background:'rgba(6,214,160,0.12)', border:'1px solid rgba(6,214,160,0.25)' }}>
            <Plus className="w-5 h-5 text-[#06d6a0]" />
          </button>
        </div>
      </header>

      <div className="px-4 space-y-4 mt-3">

        {/* Hero card */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(6,214,160,0.11) 0%,rgba(13,21,32,0.82) 100%)', borderColor:'rgba(6,214,160,0.22)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15 blur-3xl"
            style={{ background:'#06d6a0' }} />
          <div className="relative">
            <p className="text-[#06d6a0]/65 text-xs font-semibold uppercase tracking-widest mb-1">
              Total sent home
            </p>
            <p className="font-display text-4xl font-extrabold"
              style={{ color:'#06d6a0', textShadow:'0 0 28px rgba(6,214,160,0.4)' }}>
              {formatCurrency(total)}
            </p>
            <p className="text-white/28 text-sm mt-2">{items.length} transfers recorded</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'This Month', val:thisMonth, color:'#ffb703' },
            { label:'This Year',  val:thisYear,  color:'#00b4d8' },
            { label:'Avg/Month',  val:avg,        color:'#7b2fff' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <p className="text-white/28 text-[11px] mb-1">{label}</p>
              <p className="font-mono text-sm font-bold" style={{ color }}>
                {formatCurrency(val, true)}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#06d6a0] rounded-full animate-spin mx-auto" />
          </div>
        ) : sortedMonths.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Heart className="w-10 h-10 text-[#06d6a0]/25 mx-auto mb-3" />
            <p className="text-white/35 text-sm">No remittances recorded yet</p>
            <p className="text-white/20 text-xs mt-1">Tap + to log your first transfer home</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMonths.map(month => {
              const list       = grouped[month];
              const monthTotal = list.reduce((s,r) => s + Number(r.amount), 0);
              return (
                <div key={month}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                      {format(new Date(month + '-01'), 'MMMM yyyy')}
                    </p>
                    <p className="text-[#06d6a0] text-xs font-mono font-semibold">
                      {formatCurrency(monthTotal)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {list.map(r => (
                      <div key={r.id}
                        className="glass glass-hover rounded-2xl px-4 py-3 flex items-center gap-3"
                        style={{ borderColor:'rgba(6,214,160,0.14)' }}>
                        <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-5 h-5 text-[#06d6a0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/88 text-sm font-semibold">{r.recipient}</p>
                          <p className="text-white/28 text-xs mt-0.5">
                            {format(new Date(r.date), 'dd MMM')} · {r.payment_method}
                            {r.note ? ` · ${r.note}` : ''}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-bold text-[#06d6a0] flex-shrink-0">
                          {formatCurrency(Number(r.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add sheet ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/78 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <div className="relative mt-auto rounded-t-[28px] overflow-hidden"
            style={{ background:'rgba(8,13,18,0.99)', borderTop:'1px solid rgba(6,214,160,0.18)' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/18" />
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">Log Transfer Home</h2>
                <button onClick={() => setAddOpen(false)}>
                  <X className="w-5 h-5 text-white/35" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Amount */}
                <div>
                  <label className="text-white/38 text-xs block mb-1">Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono
                               outline-none focus:border-[#06d6a0]/40 transition-colors placeholder-white/20" />
                </div>

                {/* Date */}
                <div>
                  <label className="text-white/38 text-xs block mb-1">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                               outline-none focus:border-[#06d6a0]/40 transition-colors" />
                </div>

                {/* Recipient */}
                <div>
                  <label className="text-white/38 text-xs block mb-1">Recipient</label>
                  <div className="flex gap-2 flex-wrap">
                    {RECIPIENTS.map(r => (
                      <button key={r} onClick={() => setRecipient(r)}
                        className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={recipient === r
                          ? { background:'rgba(6,214,160,0.14)', color:'#06d6a0', border:'1px solid rgba(6,214,160,0.28)' }
                          : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.42)', border:'1px solid rgba(255,255,255,0.08)' }
                        }>{r}</button>
                    ))}
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label className="text-white/38 text-xs block mb-1">Method</label>
                  <div className="flex gap-2">
                    {METHODS.map(m => (
                      <button key={m} onClick={() => setMethod(m)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={method === m
                          ? { background:'rgba(6,214,160,0.14)', color:'#06d6a0', border:'1px solid rgba(6,214,160,0.28)' }
                          : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.42)', border:'1px solid rgba(255,255,255,0.08)' }
                        }>{m}</button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-white/38 text-xs block mb-1">Note (optional)</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Monthly support, festival gift…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                               outline-none focus:border-[#06d6a0]/40 transition-colors placeholder-white/18" />
                </div>

                <button onClick={handleSave} disabled={saving || !amount}
                  className="w-full h-[52px] rounded-2xl font-display text-lg font-bold disabled:opacity-35 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background:'linear-gradient(135deg,#06d6a0,#00b4d8)', color:'#030507', boxShadow:'0 0 28px rgba(6,214,160,0.3)' }}>
                  {saving
                    ? <div className="w-5 h-5 border-2 border-black/22 border-t-black rounded-full animate-spin" />
                    : <><Heart className="w-5 h-5" fill="currentColor" /> Log Transfer</>
                  }
                </button>
              </div>
            </div>
            <div style={{ paddingBottom:'env(safe-area-inset-bottom)' }} />
          </div>
        </div>
      )}

      <BottomNav onQuickAdd={() => setAddOpen(true)} />
      <CommandSearch open={search} onClose={() => setSearch(false)} />
    </main>
  );
}
