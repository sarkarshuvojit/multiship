import { Badge } from '@/components/retroui/Badge';
import { cn } from '@/lib/utils';

export interface RetroBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  success: 'bg-green-400 text-black',
  warning: 'bg-yellow-400 text-black',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-400 text-black',
};

export function RetroBadge({
  label,
  variant = 'info',
  className,
}: RetroBadgeProps) {
  return (
    <Badge
      variant="solid"
      size="sm"
      className={cn(
        'uppercase tracking-wider border-2 border-black shadow-md',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </Badge>
  );
}
