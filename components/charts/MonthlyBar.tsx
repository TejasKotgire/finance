'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs backdrop-blur-xl"
      style={{ background:'rgba(8,13,18,0.95)', border:'1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-white/35 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="font-mono font-semibold text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

interface Datum { month: string; total: number; trueBurn: number; }
interface Props  { data: Datum[]; }

export function MonthlyBar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={148}>
      <BarChart data={data} margin={{ top:4, right:0, left:0, bottom:0 }} barGap={2}>
        <XAxis dataKey="month" axisLine={false} tickLine={false}
          tick={{ fill:'rgba(255,255,255,0.28)', fontSize:10, fontFamily:'var(--font-mono)' }} />
        <YAxis hide />
        <Tooltip content={<Tip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="total"    name="Total"     radius={[4,4,0,0]} fill="rgba(0,180,216,0.28)" />
        <Bar dataKey="trueBurn" name="True Burn" radius={[4,4,0,0]} fill="#ff006e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
