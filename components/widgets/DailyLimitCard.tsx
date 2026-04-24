'use client';

import { Zap, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props { spendableToday: number; remainingBudget: number; daysRemaining: number; }

export function DailyLimitCard({ spendableToday, remainingBudget, daysRemaining }: Props) {
  const color = spendableToday < 200 ? '#ff006e' : spendableToday < 500 ? '#ffb703' : '#00f5d4';
  return (
    <div className="glass p-4 rounded-2xl relative overflow-hidden"
      style={{ background:`linear-gradient(135deg,${color}0e 0%,rgba(13,21,32,0.72) 100%)`, borderColor:`${color}28` }}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-18 blur-2xl" style={{ background: color }} />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-white/45 text-[11px] font-semibold uppercase tracking-wider">Today</span>
        </div>
        <p className="font-display text-2xl font-bold mt-1"
          style={{ color, textShadow:`0 0 18px ${color}55` }}>
          {formatCurrency(spendableToday, true)}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Calendar className="w-2.5 h-2.5 text-white/28" />
          <p className="text-white/35 text-[11px] font-mono">{daysRemaining}d left</p>
        </div>
      </div>
    </div>
  );
}
