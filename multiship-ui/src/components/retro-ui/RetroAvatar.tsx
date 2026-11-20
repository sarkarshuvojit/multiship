import { Avatar } from '@/components/retroui/Avatar';
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
    <Avatar
      onClick={onClick}
      className={cn(
        'border-2 border-black bg-[#2d2d2d]',
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-green-400',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <Avatar.Image src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <Avatar.Fallback className="text-[#39FF14] font-bold">
          {initials}
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}
