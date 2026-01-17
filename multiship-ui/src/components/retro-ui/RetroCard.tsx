import { cn } from '@/lib/utils';

export interface RetroCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'danger';
}

const variantStyles = {
  default: 'border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  highlight: 'border-[#39FF14] shadow-[6px_6px_0px_0px_rgba(57,255,20,1)]',
  danger: 'border-[#FF0000] shadow-[6px_6px_0px_0px_rgba(255,0,0,1)]',
};

export function RetroCard({
  title,
  children,
  className,
  variant = 'default',
}: RetroCardProps) {
  return (
    <div
      className={cn(
        'bg-[#2d2d2d] border-4 p-6',
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <h3 className="text-[#39FF14] text-xl font-bold uppercase tracking-wider mb-4 border-b-2 border-gray-600 pb-2">
          {title}
        </h3>
      )}
      <div className="text-white">{children}</div>
    </div>
  );
}
