import { RetroBadge } from '@/components/retro-ui/RetroBadge';
import { RetroButton } from '@/components/retro-ui/RetroButton';

export interface RetroHeaderProps {
  playerName?: string;
  roomCode?: string;
  onLeave?: () => void;
  showLeave?: boolean;
}

export function RetroHeader({
  playerName,
  roomCode,
  onLeave,
  showLeave = true,
}: RetroHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-4 border-[#00FFFF] bg-[#0f0f0f] p-4 shadow-[6px_6px_0px_0px_rgba(0,255,255,1)]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-[#00FFFF]">
          Multiship
        </h1>
        <p className="text-xs text-gray-300">Command Center</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {playerName && (
          <RetroBadge label={`Pilot: ${playerName}`} variant="success" />
        )}
        {roomCode && <RetroBadge label={`Room ${roomCode}`} variant="info" />}
        {showLeave && (
          <RetroButton variant="danger" size="sm" onClick={onLeave}>
            Leave
          </RetroButton>
        )}
      </div>
    </div>
  );
}
