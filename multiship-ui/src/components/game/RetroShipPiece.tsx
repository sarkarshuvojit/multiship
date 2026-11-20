import { cn } from '@/lib/utils';

export interface RetroShipPieceProps {
  length: 1 | 2 | 3 | 4;
  orientation?: 'horizontal' | 'vertical';
  isPlaced?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  shipName?: string;
  className?: string;
}

const shipNames: Record<number, string> = {
  4: 'Battleship',
  3: 'Cruiser',
  2: 'Destroyer',
  1: 'Submarine',
};

export function RetroShipPiece({
  length,
  orientation = 'horizontal',
  isPlaced = false,
  isSelected = false,
  onClick,
  shipName,
  className,
}: RetroShipPieceProps) {
  const name = shipName || shipNames[length];
  const isVertical = orientation === 'vertical';

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 p-2 border-2 cursor-pointer transition-all',
        'hover:border-[#00FFFF]',
        isSelected && 'border-[#39FF14] shadow-[4px_4px_0px_0px_rgba(57,255,20,1)]',
        isPlaced && 'opacity-40 cursor-not-allowed',
        !isSelected && !isPlaced && 'border-gray-600',
        className
      )}
    >
      <div
        className={cn(
          'flex gap-0.5',
          isVertical && 'flex-col'
        )}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-6 h-6 bg-[#4a4a4a] border border-gray-500',
              isSelected && 'bg-[#39FF14]/70',
              i === 0 && 'rounded-l-sm',
              i === length - 1 && 'rounded-r-sm',
              isVertical && i === 0 && 'rounded-t-sm rounded-l-none',
              isVertical && i === length - 1 && 'rounded-b-sm rounded-r-none',
            )}
          />
        ))}
      </div>

      <div className="text-left">
        <p className={cn(
          'text-sm font-bold uppercase',
          isSelected ? 'text-[#39FF14]' : 'text-white'
        )}>
          {name}
        </p>
        <p className="text-xs text-gray-400">
          {length} cells
        </p>
      </div>
    </div>
  );
}
