'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';

interface Props {
  value: string;        // 'yyyy-MM'
  onChange: (m: string) => void;
  maxMonth?: string;
}

export function MonthSelector({ value, onChange, maxMonth }: Props) {
  const cur  = parseISO(value + '-01');
  const max  = parseISO((maxMonth ?? format(new Date(), 'yyyy-MM')) + '-01');
  const canFwd = cur < max;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(format(subMonths(cur, 1), 'yyyy-MM'))}
        className="w-8 h-8 glass rounded-xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <ChevronLeft className="w-4 h-4 text-white/55" />
      </button>
      <p className="flex-1 text-center font-display font-semibold text-white text-sm">
        {format(cur, 'MMMM yyyy')}
      </p>
      <button
        onClick={() => canFwd && onChange(format(addMonths(cur, 1), 'yyyy-MM'))}
        disabled={!canFwd}
        className="w-8 h-8 glass rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
      >
        <ChevronRight className="w-4 h-4 text-white/55" />
      </button>
    </div>
  );
}
