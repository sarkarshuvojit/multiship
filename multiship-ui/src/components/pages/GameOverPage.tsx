import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroBadge } from '@/components/retro-ui/RetroBadge';

export interface GameStats {
  hits: number;
  misses: number;
  shipsSunk: number;
}

export interface GameOverPageProps {
  isWinner: boolean;
  winnerName?: string;
  stats: GameStats;
  onPlayAgain?: () => void;
  onMainMenu?: () => void;
}

export function GameOverPage({
  isWinner,
  winnerName,
  stats,
  onPlayAgain,
  onMainMenu,
}: GameOverPageProps) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-6 py-12">
      <RetroCard title={isWinner ? 'Victory' : 'Defeat'} variant={isWinner ? 'highlight' : 'danger'}>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.2em] text-[#39FF14]">
              {isWinner ? 'You Won' : 'You Lost'}
            </h2>
            <p className="text-sm text-gray-300 mt-2">
              {winnerName ? `${winnerName} commands the final fleet.` : 'Battle complete.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <RetroBadge label={`Hits ${stats.hits}`} variant="success" />
            <RetroBadge label={`Misses ${stats.misses}`} variant="warning" />
            <RetroBadge label={`Ships Sunk ${stats.shipsSunk}`} variant="info" />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <RetroButton onClick={onPlayAgain}>Play Again</RetroButton>
            <RetroButton variant="ghost" onClick={onMainMenu}>
              Main Menu
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  );
}
