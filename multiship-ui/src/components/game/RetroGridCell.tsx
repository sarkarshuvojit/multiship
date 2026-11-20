import { cn } from '@/lib/utils';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'hover';

export interface RetroGridCellProps {
  state: CellState;
  coordinates: { x: number; y: number };
  onClick?: () => void;
  disabled?: boolean;
  showShip?: boolean;
  className?: string;
}

const stateStyles: Record<CellState, string> = {
  empty: 'bg-[#1a1a1a] hover:bg-[#2d2d2d]',
  ship: 'bg-[#4a4a4a]',
  hit: 'bg-[#FF0000]',
  miss: 'bg-[#00FFFF]/30',
  hover: 'bg-[#39FF14]/50',
};

export function RetroGridCell({
  state,
  coordinates,
  onClick,
  disabled = false,
  showShip = true,
  className,
}: RetroGridCellProps) {
  const displayState = state === 'ship' && !showShip ? 'empty' : state;

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'hit' || state === 'miss'}
      className={cn(
        'w-8 h-8 border border-gray-700 transition-colors',
        'flex items-center justify-center text-xs font-bold',
        'disabled:cursor-not-allowed',
        !disabled && state === 'empty' && 'cursor-crosshair',
        stateStyles[displayState],
        className
      )}
      title={`${String.fromCharCode(65 + coordinates.x)}${coordinates.y + 1}`}
    >
      {state === 'hit' && (
        <span className="text-white text-lg">💥</span>
      )}
      {state === 'miss' && (
        <span className="text-[#00FFFF] text-lg">•</span>
      )}
      {state === 'ship' && showShip && (
        <span className="text-[#39FF14]">■</span>
      )}
    </button>
  );
}
