import { cn } from '@/lib/utils';
import { RetroAvatar } from '@/components/retro-ui/RetroAvatar';
import { RetroBadge } from '@/components/retro-ui/RetroBadge';

export interface RetroPlayerCardProps {
  name: string;
  avatar?: string;
  shipsRemaining: number;
  isCurrentTurn?: boolean;
  isEliminated?: boolean;
}

export function RetroPlayerCard({
  name,
  avatar,
  shipsRemaining,
  isCurrentTurn = false,
  isEliminated = false,
}: RetroPlayerCardProps) {
  return (
    <div
      className={cn(
        'border-4 p-4 flex items-center gap-4 bg-[#1a1a1a]',
        isEliminated
          ? 'border-[#FF0000] opacity-60'
          : 'border-[#444] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        isCurrentTurn && 'border-[#39FF14] shadow-[6px_6px_0px_0px_rgba(57,255,20,1)]'
      )}
    >
      <RetroAvatar src={avatar} alt={name} size="md" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold uppercase tracking-wider">
            {name}
          </h3>
          {isCurrentTurn && <RetroBadge label="Current Turn" variant="success" />}
          {isEliminated && <RetroBadge label="Eliminated" variant="error" />}
        </div>
        <p className="text-xs text-gray-300">Ships remaining: {shipsRemaining}</p>
      </div>
    </div>
  );
}
