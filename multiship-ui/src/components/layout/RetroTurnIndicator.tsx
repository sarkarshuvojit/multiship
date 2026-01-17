import { cn } from '@/lib/utils';

export interface RetroTurnIndicatorProps {
  currentPlayer: string;
  isMyTurn?: boolean;
  timeRemaining?: string;
}

export function RetroTurnIndicator({
  currentPlayer,
  isMyTurn = false,
  timeRemaining,
}: RetroTurnIndicatorProps) {
  return (
    <div
      className={cn(
        'border-4 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2',
        isMyTurn
          ? 'border-[#39FF14] bg-[#101c10] shadow-[6px_6px_0px_0px_rgba(57,255,20,1)]'
          : 'border-[#444] bg-[#111] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400">Turn Control</p>
        <p className={cn('text-lg font-bold uppercase', isMyTurn ? 'text-[#39FF14]' : 'text-white')}>
          {isMyTurn ? 'Your Turn' : `${currentPlayer}'s Turn`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {timeRemaining && (
          <span className="text-xs text-[#FFD700] font-bold uppercase">
            Time: {timeRemaining}
          </span>
        )}
        <span
          className={cn(
            'px-3 py-1 border-2 text-xs font-bold uppercase tracking-widest',
            isMyTurn ? 'border-[#39FF14] text-[#39FF14]' : 'border-[#555] text-gray-300'
          )}
        >
          {isMyTurn ? 'Engage' : 'Standby'}
        </span>
      </div>
    </div>
  );
}
