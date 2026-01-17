import { cn } from '@/lib/utils';

export interface RetroBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  success: 'bg-[#39FF14] text-black border-black',
  warning: 'bg-[#FFD700] text-black border-black',
  error: 'bg-[#FF0000] text-white border-black',
  info: 'bg-[#00FFFF] text-black border-black',
};

export function RetroBadge({
  label,
  variant = 'info',
  className,
}: RetroBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider',
        'border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
