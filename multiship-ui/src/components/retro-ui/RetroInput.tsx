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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'px-4 py-3 bg-[#2d2d2d] text-white font-mono text-lg',
          'border-4 border-black',
          'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          'placeholder:text-gray-500',
          'focus:outline-none focus:border-[#39FF14] focus:shadow-[4px_4px_0px_0px_rgba(57,255,20,1)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#FF0000] shadow-[4px_4px_0px_0px_rgba(255,0,0,1)]',
          className
        )}
      />
      {error && (
        <span className="text-[#FF0000] text-sm font-bold uppercase">{error}</span>
      )}
    </div>
  );
}
