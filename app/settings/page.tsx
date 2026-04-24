'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Wallet, ShoppingCart, Target, TrendingUp } from 'lucide-react';
import { BottomNav }  from '@/components/ui/BottomNav';
import { useToast }   from '@/components/ui/Toast';
import { getBudget, upsertBudget } from '@/lib/supabase';
import {
  formatCurrency, getCurrentMonth,
  DEFAULT_INCOME, DEFAULT_WANTS_BUDGET, DEFAULT_NEEDS_BUDGET, DEFAULT_SAVINGS_TARGET,
} from '@/lib/utils';
import { format } from 'date-fns';

export default function SettingsPage() {
  const router   = useRouter();
  const { toast } = useToast();
  const month    = getCurrentMonth();

  const [income,   setIncome]   = useState(DEFAULT_INCOME);
  const [wants,    setWants]    = useState(DEFAULT_WANTS_BUDGET);
  const [needs,    setNeeds]    = useState(DEFAULT_NEEDS_BUDGET);
  const [savings,  setSavings]  = useState(DEFAULT_SAVINGS_TARGET);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    getBudget(month).then(b => {
      if (!b) return;
      setIncome(b.monthly_income);
      setWants(b.wants_budget);
      setNeeds(b.needs_budget);
      setSavings(b.savings_target);
    });
  }, [month]);

  const allocated = wants + needs + savings;
  const surplus   = income - allocated;
  const balanced  = Math.abs(surplus) < 200;

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertBudget({ month, monthly_income:income, wants_budget:wants, needs_budget:needs, savings_target:savings });
      setSaved(true);
      toast('Budget saved ✓');
      setTimeout(() => setSaved(false), 2000);
    } catch { toast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const Slider = ({
    label, sub, value, onChange, icon, color,
  }: {
    label:string; sub:string; value:number;
    onChange:(v:number)=>void; icon:React.ReactNode; color:string;
  }) => (
    <div className="glass rounded-2xl p-4" style={{ borderColor:`${color}20` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:`${color}15` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-white/80 text-sm font-semibold">{label}</p>
          <p className="text-white/30 text-xs">{sub}</p>
        </div>
        <p className="font-mono text-sm font-bold" style={{ color }}>{formatCurrency(value)}</p>
      </div>
      <input type="range" min={0} max={income} step={500} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none outline-none"
        style={{
          background:`linear-gradient(to right,${color} ${(value/income)*100}%,rgba(255,255,255,0.07) ${(value/income)*100}%)`,
          accentColor: color,
        }} />
      <div className="flex justify-between mt-1">
        <span className="text-white/18 text-[10px]">₹0</span>
        <span className="text-white/18 text-[10px]">{formatCurrency(income, true)}</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-dvh bg-finance-mesh pb-28 safe-pt">
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft className="w-4 h-4 text-white/55" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">Budget Setup</h1>
            <p className="text-white/35 text-xs mt-0.5">Configure your monthly targets</p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-4 mt-3">

        {/* Income input */}
        <div className="glass rounded-2xl p-4" style={{ borderColor:'rgba(255,183,3,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffb703]/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#ffb703]" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold">Monthly Income</p>
              <p className="text-white/30 text-xs">Your take-home salary</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 font-mono">₹</span>
            <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg
                         outline-none focus:border-[#ffb703]/40 transition-colors" />
          </div>
        </div>

        <Slider label="Needs Budget" sub="Rent, food, transport" value={needs} onChange={setNeeds}
          icon={<ShoppingCart className="w-4 h-4" />} color="#00b4d8" />
        <Slider label="Wants Budget" sub="Gaming, shopping, eating out" value={wants} onChange={setWants}
          icon={<Target className="w-4 h-4" />} color="#7b2fff" />
        <Slider label="Savings Target" sub="SIP + family remittance" value={savings} onChange={setSavings}
          icon={<TrendingUp className="w-4 h-4" />} color="#06d6a0" />

        {/* Summary */}
        <div className="glass rounded-2xl p-4"
          style={{ borderColor: balanced ? 'rgba(6,214,160,0.18)' : 'rgba(255,0,110,0.18)' }}>
          <p className="text-white/38 text-xs font-semibold uppercase tracking-wider mb-3">
            Allocation Summary
          </p>
          {[
            { l:'Income',  v:income,  c:'#ffb703', prefix:'+' },
            { l:'Needs',   v:needs,   c:'#00b4d8', prefix:'−' },
            { l:'Wants',   v:wants,   c:'#7b2fff', prefix:'−' },
            { l:'Savings', v:savings, c:'#06d6a0', prefix:'−' },
          ].map(({ l, v, c, prefix }) => (
            <div key={l} className="flex justify-between items-center mb-2">
              <span className="text-white/42 text-sm">{l}</span>
              <span className="font-mono text-sm" style={{ color:c }}>{prefix} {formatCurrency(v)}</span>
            </div>
          ))}
          <div className="border-t border-white/[0.07] pt-2 flex justify-between items-center">
            <span className="text-white/60 text-sm font-semibold">Unallocated</span>
            <span className="font-mono text-sm font-bold"
              style={{ color: balanced ? '#06d6a0' : surplus < 0 ? '#ff006e' : '#ffb703' }}>
              {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}
            </span>
          </div>
          {!balanced && surplus < 0 && (
            <p className="text-[#ff006e]/65 text-xs mt-2 text-center">
              ⚠️ You've allocated {formatCurrency(-surplus)} more than your income
            </p>
          )}
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-[52px] rounded-2xl font-display text-lg font-bold disabled:opacity-38 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: saved ? 'linear-gradient(135deg,#06d6a0,#00b4d8)' : 'linear-gradient(135deg,#00f5d4,#00b4d8)',
            color:'#030507', boxShadow:'0 0 28px rgba(0,245,212,0.28)',
          }}>
          {saving
            ? <div className="w-5 h-5 border-2 border-black/22 border-t-black rounded-full animate-spin" />
            : saved ? '✓ Saved!' : <><Save className="w-5 h-5" /> Save Budget</>
          }
        </button>

        {/* App info */}
        <div className="glass rounded-2xl p-4">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-3">App Info</p>
          <div className="space-y-1.5 text-xs text-white/25">
            <p>Version: 1.0.0</p>
            <p>Stack: Next.js 15 · Supabase · Tailwind CSS</p>
            <p>PWA: Workbox offline-first cache</p>
            <p className="text-[#00f5d4]/40 mt-2 font-semibold">FinFlow — Personal Finance OS</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
