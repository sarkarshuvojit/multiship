import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

import { listeners, type Listener, type ToastItem, type ToastTone } from './toast-bus';

const toneStyles: Record<ToastTone, string> = {
  info: 'bg-panel-2 text-slate-100 ring-line',
  hit: 'bg-hit-strong/20 text-hit ring-hit/40',
  ok: 'bg-ok/15 text-ok ring-ok/40',
  error: 'bg-hit-strong/90 text-white ring-hit',
  gold: 'bg-gold/15 text-gold ring-gold/40',
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast: Listener = (t) => {
      setItems((prev) => [...prev.slice(-3), t]);
      setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== t.id)), 2800);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto animate-rise rounded-xl px-4 py-2.5 text-sm font-semibold shadow-2xl ring-1 backdrop-blur-md',
            toneStyles[t.tone],
          )}
          onClick={() => setItems((prev) => prev.filter((p) => p.id !== t.id))}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
