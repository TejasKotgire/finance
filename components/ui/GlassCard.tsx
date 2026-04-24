import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  onClick?: () => void;
  noPad?: boolean;
}

export function GlassCard({ children, className, accentColor, onClick, noPad }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass relative overflow-hidden',
        !noPad && 'p-4',
        onClick && 'cursor-pointer glass-hover active:scale-[0.985] transition-transform',
        className
      )}
      style={accentColor ? {
        background: `linear-gradient(135deg,${accentColor}0b 0%,rgba(13,21,32,0.75) 100%)`,
        borderColor: `${accentColor}22`,
      } : undefined}
    >
      {accentColor && (
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ background: accentColor }} />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
