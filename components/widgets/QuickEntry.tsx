'use client';

import { useState } from 'react';
import { X, Delete, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/database.types';

type Step = 'amount' | 'category' | 'confirm';

interface Props {
  categories: Category[];
  onSubmit: (data: {
    amount: number; category_name: string; payment_method: string;
    note?: string; is_setup_cost?: boolean; is_wealth_building?: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

const PAY = ['UPI', 'Cash', 'Card'] as const;
const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','DEL'];

export function QuickEntry({ categories, onSubmit, onClose }: Props) {
  const [step, setStep]     = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [cat, setCat]       = useState<Category | null>(null);
  const [pay, setPay]       = useState('UPI');
  const [note, setNote]     = useState('');
  const [setup, setSetup]   = useState(false);
  const [busy, setBusy]     = useState(false);

  const display = amount
    ? Number(amount).toLocaleString('en-IN')
    : '0';

  const press = (k: string) => {
    if (k === 'DEL') { setAmount(p => p.slice(0,-1)); return; }
    if (k === '.' && amount.includes('.')) return;
    if (amount.length >= 8) return;
    setAmount(p => p + k);
  };

  const handleSubmit = async () => {
    if (!cat || !amount) return;
    setBusy(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        category_name: cat.name,
        payment_method: pay,
        note: note || undefined,
        is_setup_cost: setup,
        is_wealth_building: cat.is_wealth_building,
      });
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/78 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto rounded-t-[28px] overflow-hidden"
        style={{ background:'rgba(8,13,18,0.99)', borderTop:'1px solid rgba(255,255,255,0.09)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/18" />
        </div>

        <div className="px-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-white">
              {step === 'amount' && 'Log Expense'}
              {step === 'category' && 'Pick Category'}
              {step === 'confirm' && 'Confirm Entry'}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 glass rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* ── STEP 1 ── Amount + numpad */}
          {step === 'amount' && (
            <>
              {/* Display */}
              <div className="text-center py-5">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl text-white/25 font-bold">₹</span>
                  <span className="font-display text-6xl font-bold text-white">{display}</span>
                </div>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {KEYS.map(k => (
                  <button key={k} onClick={() => press(k)}
                    className={cn(
                      'h-[54px] rounded-2xl font-display text-xl font-semibold transition-all active:scale-95',
                      k === 'DEL' ? 'bg-white/5 text-white/35' : 'bg-white/[0.07] text-white hover:bg-white/[0.11]'
                    )}>
                    {k === 'DEL' ? <Delete className="w-5 h-5 mx-auto text-white/38" /> : k}
                  </button>
                ))}
              </div>

              {/* Payment method */}
              <div className="flex gap-2 mb-4">
                {PAY.map(m => (
                  <button key={m} onClick={() => setPay(m)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={pay === m
                      ? { background:'rgba(0,245,212,0.14)', color:'#00f5d4', border:'1px solid rgba(0,245,212,0.28)' }
                      : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.07)' }
                    }>{m}</button>
                ))}
              </div>

              <button onClick={() => amount && parseFloat(amount) > 0 && setStep('category')}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full h-[52px] rounded-2xl font-display text-lg font-bold disabled:opacity-28 active:scale-[0.98] transition-all"
                style={{ background:'linear-gradient(135deg,#00f5d4,#00b4d8)', color:'#030507', boxShadow:'0 0 28px rgba(0,245,212,0.3)' }}>
                Next →
              </button>
            </>
          )}

          {/* ── STEP 2 ── Category picker */}
          {step === 'category' && (
            <>
              <div className="text-center mb-3">
                <p className="font-display text-3xl font-bold text-white">₹{display}</p>
                <p className="text-white/35 text-sm mt-0.5">via {pay}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 max-h-52 overflow-y-auto">
                {categories.map(c => (
                  <button key={c.id}
                    onClick={() => { setCat(c); setStep('confirm'); }}
                    className="p-3 rounded-2xl glass glass-hover flex flex-col items-center gap-1.5 transition-all active:scale-95"
                    style={{ borderColor:`${c.color}28` }}>
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-white/65 text-[11px] text-center leading-tight line-clamp-2">
                      {c.name.split('/')[0]}
                    </span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep('amount')}
                className="w-full h-12 rounded-2xl glass text-white/55 font-semibold">
                ← Back
              </button>
            </>
          )}

          {/* ── STEP 3 ── Confirm */}
          {step === 'confirm' && cat && (
            <>
              {/* Summary */}
              <div className="p-4 rounded-2xl glass mb-3" style={{ borderColor:`${cat.color}28` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background:`${cat.color}15` }}>{cat.icon}</div>
                  <div className="flex-1">
                    <p className="text-white/45 text-xs">{cat.name}</p>
                    <p className="font-display text-2xl font-bold text-white">₹{display}</p>
                  </div>
                  <span className="glass-sm px-2.5 py-1 rounded-lg text-xs text-white/45">{pay}</span>
                </div>

                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20
                             border border-white/10 outline-none focus:border-[#00f5d4]/30 transition-colors" />

                <button onClick={() => setSetup(s => !s)}
                  className="mt-2.5 w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all text-left"
                  style={setup
                    ? { background:'rgba(255,183,3,0.1)', color:'#ffb703', border:'1px solid rgba(255,183,3,0.25)' }
                    : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.08)' }
                  }>
                  <span className="w-4 text-center">{setup ? '✓' : '○'}</span>
                  <span>One-time setup cost (excluded from True Burn)</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('category')}
                  className="flex-1 h-[52px] rounded-2xl glass text-white/55 font-semibold">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={busy}
                  className="flex-[2] h-[52px] rounded-2xl font-display text-lg font-bold disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  style={{ background:'linear-gradient(135deg,#06d6a0,#00b4d8)', color:'#030507', boxShadow:'0 0 28px rgba(6,214,160,0.3)' }}>
                  {busy
                    ? <div className="w-5 h-5 border-2 border-black/25 border-t-black rounded-full animate-spin" />
                    : <><Check className="w-5 h-5" /> Save</>
                  }
                </button>
              </div>
            </>
          )}
        </div>

        {/* iOS safe area */}
        <div style={{ paddingBottom:'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
