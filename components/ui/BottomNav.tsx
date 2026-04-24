'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, List, Heart, Plus, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  onQuickAdd?: () => void;
}

const NAV = [
  { href: '/',            icon: Home,     label: 'Home',      color: '#00f5d4' },
  { href: '/transactions',icon: List,     label: 'Spends',    color: '#00b4d8' },
  { href: '/analytics',   icon: BarChart3,label: 'Insights',  color: '#7b2fff' },
  { href: '/remittance',  icon: Heart,    label: 'Family',    color: '#06d6a0' },
];

export function BottomNav({ onQuickAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40"
      style={{
        background: 'rgba(8,13,18,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {/* Left 2 */}
        {NAV.slice(0, 2).map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl min-w-[3.5rem]"
            >
              <Icon className="w-5 h-5 transition-colors"
                style={{ color: active ? color : 'rgba(255,255,255,0.32)' }} />
              <span className="text-[10px] transition-colors font-body"
                style={{ color: active ? color : 'rgba(255,255,255,0.24)' }}>
                {label}
              </span>
              {active && (
                <span className="block w-4 h-0.5 rounded-full mt-0.5"
                  style={{ background: color }} />
              )}
            </Link>
          );
        })}

        {/* FAB */}
        <button
          onClick={onQuickAdd}
          aria-label="Add expense"
          className="w-14 h-14 rounded-full flex items-center justify-center -mt-7 flex-shrink-0 active:scale-90 transition-transform"
          style={{
            background: 'linear-gradient(135deg,#00f5d4,#00b4d8)',
            boxShadow: '0 0 0 3px rgba(8,13,18,1), 0 0 28px rgba(0,245,212,0.5), 0 8px 20px rgba(0,0,0,0.55)',
          }}
        >
          <Plus className="w-7 h-7 text-[#030507]" strokeWidth={2.8} />
        </button>

        {/* Right 2 */}
        {NAV.slice(2).map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl min-w-[3.5rem]"
            >
              <Icon className="w-5 h-5 transition-colors"
                style={{ color: active ? color : 'rgba(255,255,255,0.32)' }} />
              <span className="text-[10px] transition-colors font-body"
                style={{ color: active ? color : 'rgba(255,255,255,0.24)' }}>
                {label}
              </span>
              {active && (
                <span className="block w-4 h-0.5 rounded-full mt-0.5"
                  style={{ background: color }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
