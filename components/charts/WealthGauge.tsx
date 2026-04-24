'use client';

import { Target } from 'lucide-react';
import { formatCurrency, WEALTH_TARGET_PCT } from '@/lib/utils';

interface Props {
  wealthAmount: number; income: number;
  investments: number; familySupport: number; ratio: number;
}

export function WealthGauge({ wealthAmount, income, investments, familySupport, ratio }: Props) {
  const clamped = Math.min(ratio, 100);
  const onTarget = ratio >= WEALTH_TARGET_PCT;
  const accent = onTarget ? '#06d6a0' : ratio >= 30 ? '#ffb703' : '#ff006e';

  const size = 120; const sw = 9; const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);

  // 50 % target dot position
  const targetAngle = (WEALTH_TARGET_PCT / 100) * 360 - 90;
  const tr = (targetAngle * Math.PI) / 180;
  const cx = size / 2; const cy = size / 2;
  const tx = cx + r * Math.cos(tr); const ty = cy + r * Math.sin(tr);

  return (
    <div className="glass p-4 rounded-2xl"
      style={{ background:'linear-gradient(135deg,rgba(6,214,160,0.07) 0%,rgba(13,21,32,0.8) 100%)', borderColor:'rgba(6,214,160,0.15)' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <Target className="w-4 h-4 text-[#06d6a0]" />
        <span className="text-white/65 text-sm font-semibold font-display">Wealth Ratio</span>
        <span className="ml-auto text-white/30 text-xs font-mono">Target ≥{WEALTH_TARGET_PCT}%</span>
      </div>

      <div className="flex items-center gap-5">
        {/* SVG gauge */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth={sw}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 6px ${accent}80)` }} />
            {/* 50% target marker */}
            <circle cx={tx} cy={ty} r={3.5} fill="white" opacity={0.4}
              style={{ transform:'rotate(90deg)', transformOrigin:`${cx}px ${cy}px` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold" style={{ color: accent }}>
              {Math.round(ratio)}%
            </span>
            <span className="text-white/30 text-xs">ratio</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#ffb703]" />
              <span className="text-white/40 text-xs">SIP / Investments</span>
            </div>
            <p className="font-mono text-sm font-semibold text-white">{formatCurrency(investments)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#06d6a0]" />
              <span className="text-white/40 text-xs">Family Support</span>
            </div>
            <p className="font-mono text-sm font-semibold text-white">{formatCurrency(familySupport)}</p>
          </div>
          <div className="pt-2 border-t border-white/[0.07]">
            <p className="text-white/25 text-xs">Total wealth-building</p>
            <p className="font-display font-bold text-base mt-0.5" style={{ color: accent }}>
              {formatCurrency(wealthAmount)}
            </p>
          </div>
        </div>
      </div>

      {!onTarget && income > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
          <p className="text-white/35 text-xs">
            Need{' '}
            <span className="text-[#ffb703] font-semibold">
              {formatCurrency(Math.max(0, income * 0.5 - wealthAmount))}
            </span>
            {' '}more to hit 50% wealth target
          </p>
        </div>
      )}
    </div>
  );
}
