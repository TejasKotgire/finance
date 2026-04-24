'use client';

import { useState } from 'react';
import { Flame, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props { trueBurn: number; totalSpent: number; setupCosts: number; }

export function TrueBurnCard({ trueBurn, totalSpent, setupCosts }: Props) {
  const [info, setInfo] = useState(false);
  return (
    <div className="glass p-4 rounded-2xl relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,rgba(255,0,110,0.09) 0%,rgba(13,21,32,0.72) 100%)', borderColor:'rgba(255,0,110,0.2)' }}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-18 blur-2xl" style={{ background:'#ff006e' }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#ff006e]" />
            <span className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">True Burn</span>
          </div>
          <button onClick={() => setInfo(!info)} className="text-white/20 hover:text-white/50 transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </div>
        <p className="font-display text-2xl font-bold text-white mt-1">{formatCurrency(trueBurn, true)}</p>
        {setupCosts > 0 && (
          <p className="text-white/35 text-[11px] mt-0.5 font-mono">−{formatCurrency(setupCosts, true)} setup</p>
        )}
        {info && (
          <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/45 text-[11px] leading-relaxed">
              True Burn = Total ({formatCurrency(totalSpent, true)}) minus one-time setup costs ({formatCurrency(setupCosts, true)}).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
