'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-sm px-3 py-1.5 rounded-xl text-xs">
      <p className="text-white/40 mb-0.5">{payload[0]?.payload?.fullDate}</p>
      <p className="font-mono font-semibold text-[#00f5d4]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

interface Props { dailyBreakdown: Record<string, number>; currentMonth: string; }

export function SpendingChart({ dailyBreakdown, currentMonth }: Props) {
  const [y, m] = currentMonth.split('-').map(Number);
  const monthStart = startOfMonth(new Date(y, m - 1));
  const today = new Date();
  const monthEnd = endOfMonth(monthStart);
  const end = today < monthEnd ? today : monthEnd;

  let running = 0;
  const data = eachDayOfInterval({ start: monthStart, end }).map(day => {
    const key = format(day, 'yyyy-MM-dd');
    running += dailyBreakdown[key] ?? 0;
    return { day: format(day, 'd'), fullDate: format(day, 'dd MMM'), cumulative: running };
  });

  return (
    <div className="glass p-4 rounded-2xl"
      style={{ background:'linear-gradient(135deg,rgba(0,180,216,0.07) 0%,rgba(13,21,32,0.8) 100%)', borderColor:'rgba(0,180,216,0.15)' }}>
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart3 className="w-4 h-4 text-[#00b4d8]" />
        <span className="text-white/65 text-sm font-semibold font-display">Spending Trend</span>
        <span className="ml-auto font-mono text-xs text-white/30">This month</span>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{ top:4, right:0, left:0, bottom:0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00b4d8" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} interval={4}
            tick={{ fill:'rgba(255,255,255,0.28)', fontSize:10, fontFamily:'var(--font-mono)' }} />
          <YAxis hide />
          <Tooltip content={<Tip />} cursor={{ stroke:'rgba(255,255,255,0.08)', strokeWidth:1 }} />
          <Area type="monotone" dataKey="cumulative" stroke="#00b4d8" strokeWidth={2}
            fill="url(#areaGrad)" dot={false}
            activeDot={{ r:4, fill:'#00b4d8', strokeWidth:0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
