'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryColor, formatCurrency } from '@/lib/utils';

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="px-3 py-2 rounded-xl text-xs backdrop-blur-xl"
      style={{ background:'rgba(8,13,18,0.95)', border:`1px solid ${item.payload.fill}35` }}>
      <p className="text-white/50 mb-0.5">{item.name}</p>
      <p className="font-mono font-semibold" style={{ color: item.payload.fill }}>{formatCurrency(item.value)}</p>
      <p className="text-white/28">{item.payload.pct?.toFixed(1)}%</p>
    </div>
  );
};

const Legend = ({ payload }: any) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 px-1">
    {payload?.slice(0,8).map((e: any) => (
      <div key={e.value} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
        <span className="text-white/42 text-[11px] truncate">{e.value}</span>
      </div>
    ))}
  </div>
);

interface Props { data: Record<string, number>; total: number; }

export function CategoryPie({ data, total }: Props) {
  const slices = Object.entries(data)
    .sort(([,a],[,b]) => b - a)
    .map(([name, value]) => ({ name, value, fill: getCategoryColor(name), pct: total > 0 ? (value/total)*100 : 0 }));

  if (!slices.length) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={slices} cx="50%" cy="44%" innerRadius={52} outerRadius={76}
          paddingAngle={2} dataKey="value" stroke="none">
          {slices.map((s,i) => <Cell key={i} fill={s.fill} />)}
        </Pie>
        <Tooltip content={<Tip />} />
        {/* @ts-ignore */}
        <Legend payload={slices.map(s => ({ value: s.name, color: s.fill }))} content={<Legend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
