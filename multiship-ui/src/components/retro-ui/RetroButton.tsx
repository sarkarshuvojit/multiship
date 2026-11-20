import { Button } from '@/components/retroui/Button';
import { cn } from '@/lib/utils';

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'default',
  ghost: 'ghost',
} as const;

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

const variantClassMap = {
  primary: '',
  secondary: '',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: '',
} as const;

export function RetroButton({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  className,
  asChild,
  ...props
}: RetroButtonProps) {
  return (
    <Button
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(variantClassMap[variant], className)}
      asChild={asChild}
      {...props}
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
    </Button>
  );
}
