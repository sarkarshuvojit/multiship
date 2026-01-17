import { cn } from '@/lib/utils';

export interface RetroButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-[#39FF14] text-black border-black hover:bg-[#32e012]',
  secondary: 'bg-[#00FFFF] text-black border-black hover:bg-[#00e0e0]',
  danger: 'bg-[#FF0000] text-white border-black hover:bg-[#e00000]',
  ghost: 'bg-transparent text-white border-white hover:bg-white hover:text-black',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-5 py-2 text-base',
  lg: 'px-8 py-3 text-lg',
};

export function RetroButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
}: RetroButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'font-bold border-4 uppercase tracking-wider',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        'transition-all duration-100',
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-flex gap-1">
            <span className="w-2 h-2 bg-current animate-bounce [animation-delay:-0.2s]" />
            <span className="w-2 h-2 bg-current animate-bounce [animation-delay:-0.1s]" />
            <span className="w-2 h-2 bg-current animate-bounce" />
          </span>
        )}
        <span>{children}</span>
      </span>
    </button>
  );
}
