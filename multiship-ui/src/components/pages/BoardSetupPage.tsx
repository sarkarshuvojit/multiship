import { RetroBadge } from '@/components/retro-ui/RetroBadge';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroShipPlacementGrid, type PlacementShip } from '@/components/game/RetroShipPlacementGrid';
import type { CellState } from '@/components/game/RetroGridCell';

export interface BoardSetupPageProps {
  ships: PlacementShip[];
  selectedShipId?: string;
  grid: CellState[][];
  onShipSelect?: (id: string) => void;
  onShipPlace?: (x: number, y: number) => void;
  onRotate?: () => void;
  onReset?: () => void;
  onRandomize?: () => void;
  onReady?: () => void;
  statusText?: string;
  isReady?: boolean;
  timeRemaining?: string;
}

export function BoardSetupPage({
  ships,
  selectedShipId,
  grid,
  onShipSelect,
  onShipPlace,
  onRotate,
  onReset,
  onRandomize,
  onReady,
  statusText,
  isReady = false,
  timeRemaining,
}: BoardSetupPageProps) {
  const allPlaced = ships.every((ship) => ship.isPlaced);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <RetroCard title="Board Setup" variant="highlight">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300">{statusText ?? 'Deploy your fleet before the timer expires.'}</p>
              <div className="mt-2 flex items-center gap-3">
                <RetroBadge label={allPlaced ? 'Fleet Ready' : 'Placing Ships'} variant={allPlaced ? 'success' : 'warning'} />
                {timeRemaining && <RetroBadge label={`Timer ${timeRemaining}`} variant="info" />}
              </div>
            </div>
            <RetroButton onClick={onReady} disabled={!allPlaced}>
              {isReady ? 'Locked In' : 'Ready'}
            </RetroButton>
          </div>
        </RetroCard>

        <RetroShipPlacementGrid
          grid={grid}
          ships={ships}
          selectedShipId={selectedShipId}
          onShipSelect={onShipSelect}
          onShipPlace={onShipPlace}
          onRotate={onRotate}
          onReset={onReset}
          onRandomize={onRandomize}
        />

        <RetroCard title="Deployment Tips">
          <ul className="text-sm text-gray-300 space-y-2">
            <li>Spread ships to avoid chain hits.</li>
            <li>Rotate to fit tight spaces.</li>
            <li>Lock in only when every ship is placed.</li>
          </ul>
        </RetroCard>
      </div>
    </div>
  );
}
