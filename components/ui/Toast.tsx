'use client';

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem { id: string; message: string; type: ToastType; }

const Ctx = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const dismiss = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const cfg = {
    success: { icon: <Check className="w-4 h-4 text-[#06d6a0]" />,  bg: 'rgba(6,214,160,0.12)',  border: 'rgba(6,214,160,0.25)' },
    error:   { icon: <AlertCircle className="w-4 h-4 text-[#ff006e]" />, bg: 'rgba(255,0,110,0.12)',  border: 'rgba(255,0,110,0.25)' },
    info:    { icon: <Info className="w-4 h-4 text-[#00b4d8]" />,    bg: 'rgba(0,180,216,0.12)', border: 'rgba(0,180,216,0.25)' },
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 inset-x-4 z-[200] flex flex-col gap-2 pointer-events-none max-w-sm mx-auto">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto animate-slide-up"
            style={{ background: cfg[t.type].bg, border: `1px solid ${cfg[t.type].border}`, backdropFilter: 'blur(20px)' }}
          >
            {cfg[t.type].icon}
            <p className="text-white/90 text-sm flex-1 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/25 hover:text-white/50 transition-colors ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
