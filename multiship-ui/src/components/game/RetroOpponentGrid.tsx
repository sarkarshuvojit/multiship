import { cn } from '@/lib/utils';
import { RetroGameGrid } from './RetroGameGrid';
import type { CellState } from './RetroGridCell';

export interface RetroOpponentGridProps {
  playerName: string;
  cells: CellState[][];
  onAttack?: (x: number, y: number) => void;
  disabled?: boolean;
  isActive?: boolean;
  className?: string;
}

export function RetroOpponentGrid({
  playerName,
  cells,
  onAttack,
  disabled = false,
  isActive = false,
  className,
}: RetroOpponentGridProps) {
  return (
    <div
      className={cn(
        'p-3 border-4 bg-[#0f0f0f] transition-all',
        isActive
          ? 'border-[#39FF14] shadow-[6px_6px_0px_0px_rgba(57,255,20,1)]'
          : 'border-[#444] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
    >
      <RetroGameGrid
        cells={cells}
        onCellClick={onAttack}
        showShips={false}
        disabled={disabled}
        title={playerName}
      />
    </div>
  );
}
