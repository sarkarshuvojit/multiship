import { cn } from '@/lib/utils';

export interface RetroAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  fallback?: string;
}

const sizeStyles = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
};

export function RetroAvatar({
  src,
  alt = 'Avatar',
  size = 'md',
  selected = false,
  onClick,
  className,
  fallback,
}: RetroAvatarProps) {
  const initials = fallback || alt?.charAt(0).toUpperCase() || '?';

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-4 border-black bg-[#2d2d2d] flex items-center justify-center overflow-hidden',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        onClick && 'cursor-pointer hover:border-[#00FFFF] transition-colors',
        selected && 'border-[#39FF14] shadow-[4px_4px_0px_0px_rgba(57,255,20,1)]',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[#39FF14] font-bold">{initials}</span>
      )}
    </div>
  );
}
