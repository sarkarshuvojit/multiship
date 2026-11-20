import { Button } from '@/components/retroui/Button';
import { cn } from '@/lib/utils';

export interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function RetroModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: RetroModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-[#1a1a1a] border-4 border-[#39FF14]',
          'shadow-[8px_8px_0px_0px_rgba(57,255,20,1)]',
          'p-6 max-w-lg w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 text-[#FF0000] hover:text-white border-current"
        >
          ×
        </Button>

        {title && (
          <h2 className="text-[#39FF14] text-2xl font-bold uppercase tracking-wider mb-4 pr-8">
            {title}
          </h2>
        )}

        <div className="text-white">{children}</div>
      </div>
    </div>
  );
}
