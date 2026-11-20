import { cn } from '@/lib/utils';
import { RetroGridCell } from './RetroGridCell';
import type { CellState } from './RetroGridCell';

export interface RetroGameGridProps {
  cells: CellState[][];
  onCellClick?: (x: number, y: number) => void;
  isPlayerBoard?: boolean;
  disabled?: boolean;
  className?: string;
  showShips?: boolean;
  title?: string;
}

const GRID_SIZE = 10;
const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function RetroGameGrid({
  cells,
  onCellClick,
  isPlayerBoard = false,
  disabled = false,
  className,
  showShips = true,
  title,
}: RetroGameGridProps) {
  return (
    <div className={cn('inline-block', className)}>
      {title && (
        <h3 className="text-[#39FF14] text-lg font-bold uppercase tracking-wider mb-2 text-center">
          {title}
        </h3>
      )}

      <div className="border-4 border-[#39FF14] shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] p-1 bg-[#0a0a0a]">
        {/* Column labels */}
        <div className="flex">
          <div className="w-6 h-6" /> {/* Empty corner */}
          {COLUMN_LABELS.map((label) => (
            <div
              key={label}
              className="w-8 h-6 flex items-center justify-center text-[#00FFFF] text-xs font-bold"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <div key={y} className="flex">
            {/* Row label */}
            <div className="w-6 h-8 flex items-center justify-center text-[#00FFFF] text-xs font-bold">
              {y + 1}
            </div>

            {/* Cells */}
            {Array.from({ length: GRID_SIZE }).map((_, x) => (
              <RetroGridCell
                key={`${x}-${y}`}
                state={cells[y]?.[x] || 'empty'}
                coordinates={{ x, y }}
                onClick={() => onCellClick?.(x, y)}
                disabled={disabled || isPlayerBoard}
                showShip={showShips || isPlayerBoard}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
