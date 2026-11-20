import { Input } from '@/components/retroui/Input';
import { cn } from '@/lib/utils';

export interface RetroInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'email' | 'password';
}

export function RetroInput({
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className,
  type = 'text',
}: RetroInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        className={cn(className)}
      />
      {error && (
        <span className="text-[#FF0000] text-sm font-bold uppercase">{error}</span>
      )}
    </div>
  );
}
