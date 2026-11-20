import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-abyss hover:bg-[#67e8f9] shadow-[0_8px_30px_-8px_rgb(34_211_238/0.6)] disabled:shadow-none',
  secondary: 'bg-panel-2 text-slate-100 hover:bg-[#1d2a48] ring-1 ring-line',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
  danger: 'bg-hit-strong/15 text-hit hover:bg-hit-strong/25 ring-1 ring-hit/30',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-[15px] rounded-xl gap-2',
  lg: 'h-14 px-7 text-base rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold select-none transition-all duration-150',
        'active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-abyss',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-4 rounded-full border-2 border-current border-r-transparent animate-spin', className)}
    />
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-panel/80 ring-1 ring-line backdrop-blur-sm shadow-[0_20px_60px_-30px_rgb(0_0_0/0.8)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Avatar({
  emoji,
  size = 'md',
  active,
  dim,
  className,
}: {
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  dim?: boolean;
  className?: string;
}) {
  const s = { sm: 'size-8 text-base', md: 'size-10 text-xl', lg: 'size-16 text-3xl' }[size];
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full bg-panel-2 ring-1 ring-line',
        active && 'ring-2 ring-accent animate-pulse-ring',
        dim && 'grayscale opacity-50',
        s,
        className,
      )}
    >
      {emoji || '⚓'}
    </span>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'ok' | 'hit' | 'gold';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-white/5 text-slate-300 ring-line',
    accent: 'bg-accent/10 text-accent ring-accent/30',
    ok: 'bg-ok/10 text-ok ring-ok/30',
    hit: 'bg-hit/10 text-hit ring-hit/30',
    gold: 'bg-gold/10 text-gold ring-gold/30',
  }[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 whitespace-nowrap',
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-display font-bold tracking-tight', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">⚓</span>
      <span>Multiship</span>
    </div>
  );
}

/** Ships-left pips: one bar per ship, dimmed when sunk. */
export function FleetPips({ total, remaining, className }: { total: number; remaining: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`${remaining} of ${total} ships afloat`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-1.5 w-2 rounded-full', i < remaining ? 'bg-accent' : 'bg-white/10')} />
      ))}
    </span>
  );
}
