import { cn } from '@/lib/utils';

export interface RetroLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function RetroLayout({
  children,
  header,
  footer,
  showHeader = true,
  showFooter = true,
  className,
}: RetroLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-[#0b0b0b] text-white',
        'bg-[radial-gradient(circle_at_top,#1a1a1a_0%,#0b0b0b_55%)]',
        className
      )}
    >
      <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        {showHeader && (
          <header className="mb-6">
            {header || (
              <div className="border-4 border-[#39FF14] shadow-[6px_6px_0px_0px_rgba(57,255,20,1)] p-4 bg-[#111]">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                  Multiship
                </h1>
                <p className="text-sm text-gray-300">Neo-brutal battleship command deck</p>
              </div>
            )}
          </header>
        )}

        <main className="min-h-[60vh]">{children}</main>

        {showFooter && (
          <footer className="mt-8 border-t-2 border-[#2d2d2d] pt-4 text-xs text-gray-400 flex items-center justify-between">
            {footer || (
              <>
                <span>Build v0.4.2</span>
                <span className="text-[#00FFFF] uppercase tracking-widest">Retro Fleet Command</span>
              </>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
