import { cn } from '@/lib/utils';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroGameGrid } from './RetroGameGrid';
import { RetroShipPiece } from './RetroShipPiece';
import type { CellState } from './RetroGridCell';

export interface PlacementShip {
  id: string;
  length: 1 | 2 | 3 | 4;
  orientation?: 'horizontal' | 'vertical';
  isPlaced?: boolean;
  name?: string;
}

export interface RetroShipPlacementGridProps {
  grid: CellState[][];
  ships: PlacementShip[];
  selectedShipId?: string;
  onShipSelect?: (id: string) => void;
  onShipPlace?: (x: number, y: number) => void;
  onRotate?: () => void;
  onReset?: () => void;
  onRandomize?: () => void;
  className?: string;
  title?: string;
}

export function RetroShipPlacementGrid({
  grid,
  ships,
  selectedShipId,
  onShipSelect,
  onShipPlace,
  onRotate,
  onReset,
  onRandomize,
  className,
  title = 'Deploy Fleet',
}: RetroShipPlacementGridProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-6 items-start', className)}>
      <RetroCard title={title} className="bg-[#1a1a1a]">
        <RetroGameGrid
          cells={grid}
          onCellClick={onShipPlace}
          showShips
        />
      </RetroCard>

      <RetroCard title="Ship Hangar" className="w-full lg:w-80">
        <div className="flex flex-col gap-3">
          {ships.map((ship) => (
            <RetroShipPiece
              key={ship.id}
              length={ship.length}
              orientation={ship.orientation}
              isPlaced={ship.isPlaced}
              shipName={ship.name}
              isSelected={ship.id === selectedShipId}
              onClick={() => onShipSelect?.(ship.id)}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <RetroButton variant="secondary" onClick={onRotate}>
            Rotate
          </RetroButton>
          <RetroButton variant="danger" onClick={onReset}>
            Reset
          </RetroButton>
          {onRandomize && (
            <RetroButton variant="ghost" onClick={onRandomize} className="col-span-2">
              Random Fleet
            </RetroButton>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-300 leading-relaxed">
          <p className="font-bold text-[#00FFFF] uppercase">Instructions</p>
          <p>Select a ship, then click the grid to place it. Rotate to change orientation. Click a placed ship to pick it back up.</p>
        </div>
      </RetroCard>
    </div>
  );
}
