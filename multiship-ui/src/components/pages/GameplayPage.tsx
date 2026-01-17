import { RetroGameGrid } from '@/components/game/RetroGameGrid';
import { RetroOpponentGrid } from '@/components/game/RetroOpponentGrid';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroBadge } from '@/components/retro-ui/RetroBadge';
import { RetroGameLog, type GameLogEvent } from '@/components/layout/RetroGameLog';
import { RetroPlayerCard } from '@/components/layout/RetroPlayerCard';
import { RetroTurnIndicator } from '@/components/layout/RetroTurnIndicator';
import type { CellState } from '@/components/game/RetroGridCell';

export interface OpponentBoard {
  id: string;
  name: string;
  cells: CellState[][];
  shipsRemaining: number;
  isEliminated?: boolean;
}

export interface PlayerStatus {
  shipsRemaining: number;
  hits: number;
  misses: number;
}

export interface GameplayPageProps {
  playerBoard: CellState[][];
  opponents: OpponentBoard[];
  selectedOpponentId?: string;
  onOpponentSelect?: (id: string) => void;
  onAttack?: (x: number, y: number) => void;
  currentTurn: string;
  isMyTurn?: boolean;
  gameLog: GameLogEvent[];
  myStatus: PlayerStatus;
}

export function GameplayPage({
  playerBoard,
  opponents,
  selectedOpponentId,
  onOpponentSelect,
  onAttack,
  currentTurn,
  isMyTurn = false,
  gameLog,
  myStatus,
}: GameplayPageProps) {
  const selectedOpponent = opponents.find((opponent) => opponent.id === selectedOpponentId) || opponents[0];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <RetroTurnIndicator currentPlayer={currentTurn} isMyTurn={isMyTurn} timeRemaining="00:22" />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <RetroCard title="Enemy Fleet">
              <div className="flex flex-wrap gap-2 mb-4">
                {opponents.map((opponent) => (
                  <RetroButton
                    key={opponent.id}
                    variant={opponent.id === selectedOpponent?.id ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onOpponentSelect?.(opponent.id)}
                  >
                    {opponent.name}
                  </RetroButton>
                ))}
              </div>
              {selectedOpponent ? (
                <RetroOpponentGrid
                  playerName={selectedOpponent.name}
                  cells={selectedOpponent.cells}
                  onAttack={onAttack}
                  disabled={!isMyTurn || selectedOpponent.isEliminated}
                  isActive={isMyTurn}
                />
              ) : (
                <p className="text-gray-400">No opponents detected.</p>
              )}
            </RetroCard>

            <RetroCard title="Your Fleet">
              <div className="flex flex-wrap gap-3 mb-4">
                <RetroBadge label={`Ships: ${myStatus.shipsRemaining}`} variant="success" />
                <RetroBadge label={`Hits: ${myStatus.hits}`} variant="info" />
                <RetroBadge label={`Misses: ${myStatus.misses}`} variant="warning" />
              </div>
              <RetroGameGrid cells={playerBoard} showShips isPlayerBoard />
            </RetroCard>
          </div>

          <div className="space-y-6">
            <RetroCard title="Opponents">
              <div className="space-y-3">
                {opponents.map((opponent) => (
                  <RetroPlayerCard
                    key={opponent.id}
                    name={opponent.name}
                    shipsRemaining={opponent.shipsRemaining}
                    isCurrentTurn={currentTurn === opponent.name}
                    isEliminated={opponent.isEliminated}
                  />
                ))}
              </div>
            </RetroCard>

            <RetroGameLog events={gameLog} />
          </div>
        </div>
      </div>
    </div>
  );
}
