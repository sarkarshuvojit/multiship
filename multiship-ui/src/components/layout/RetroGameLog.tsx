import { cn } from '@/lib/utils';

export type GameLogEventType = 'hit' | 'miss' | 'turn' | 'system' | 'error' | 'sunk';

export interface GameLogEvent {
  id: string;
  message: string;
  type?: GameLogEventType;
  timestamp?: string;
}

export interface RetroGameLogProps {
  events: GameLogEvent[];
  maxEvents?: number;
  className?: string;
}

const typeStyles: Record<GameLogEventType, string> = {
  hit: 'text-[#39FF14]',
  miss: 'text-[#00FFFF]',
  turn: 'text-[#FFD700]',
  system: 'text-gray-300',
  error: 'text-[#FF0000]',
  sunk: 'text-[#FF1493]',
};

export function RetroGameLog({
  events,
  maxEvents = 8,
  className,
}: RetroGameLogProps) {
  const visibleEvents = events.slice(-maxEvents).reverse();

  return (
    <div
      className={cn(
        'border-4 border-[#444] bg-[#111] p-4',
        'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
    >
      <div className="text-xs uppercase tracking-widest text-[#00FFFF] mb-3">
        Battle Log
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {visibleEvents.map((event) => (
          <div key={event.id} className="flex gap-2 text-xs font-mono">
            <span className="text-gray-500">{event.timestamp || '00:00'}</span>
            <span className={cn('font-semibold', typeStyles[event.type || 'system'])}>
              {event.message}
            </span>
          </div>
        ))}
        {visibleEvents.length === 0 && (
          <div className="text-gray-500 text-xs">Awaiting first strike...</div>
        )}
      </div>
    </div>
  );
}
