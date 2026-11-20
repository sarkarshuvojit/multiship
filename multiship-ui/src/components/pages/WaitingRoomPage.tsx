import { RetroAvatar } from '@/components/retro-ui/RetroAvatar';
import { RetroBadge } from '@/components/retro-ui/RetroBadge';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';

export interface WaitingRoomPlayer {
  id: string;
  name: string;
  avatar?: string;
  isReady?: boolean;
  isHost?: boolean;
}

export interface WaitingRoomPageProps {
  roomCode: string;
  players: WaitingRoomPlayer[];
  maxPlayers: number;
  isHost?: boolean;
  canStart?: boolean;
  hint?: string;
  onStartGame?: () => void;
  onLeave?: () => void;
  onCopyCode?: () => void;
}

export function WaitingRoomPage({
  roomCode,
  players,
  maxPlayers,
  isHost = false,
  canStart,
  hint,
  onStartGame,
  onLeave,
  onCopyCode,
}: WaitingRoomPageProps) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <RetroCard title="Waiting Room" variant="highlight">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300">Share this room code with your crew.</p>
              <div className="mt-2 flex items-center gap-3">
                <RetroBadge label={`Room ${roomCode}`} variant="info" />
                <RetroButton variant="ghost" size="sm" onClick={onCopyCode}>
                  Copy Code
                </RetroButton>
              </div>
            </div>
            <RetroBadge
              label={`${players.length}/${maxPlayers} ready`}
              variant={players.length === maxPlayers ? 'success' : 'warning'}
            />
          </div>
        </RetroCard>

        <RetroCard title="Crew Manifest">
          <div className="grid gap-4 sm:grid-cols-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 border-2 border-[#333] p-3 bg-[#111]"
              >
                <RetroAvatar fallback={player.avatar} alt={player.name} size="sm" />
                <div className="flex-1">
                  <p className="font-bold uppercase text-sm">{player.name}</p>
                  <div className="flex gap-2 mt-1">
                    {player.isHost && <RetroBadge label="Host" variant="info" />}
                    <RetroBadge
                      label={player.isReady ? 'Ready' : 'Not Ready'}
                      variant={player.isReady ? 'success' : 'warning'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">Awaiting pilots...</p>
          )}
        </RetroCard>

        <div className="flex flex-wrap gap-4 justify-between">
          <RetroButton variant="ghost" onClick={onLeave}>
            Leave Room
          </RetroButton>
          {hint && <p className="text-xs text-gray-400 self-center">{hint}</p>}
          <RetroButton onClick={onStartGame} disabled={!isHost || canStart === false}>
            {isHost ? 'Launch Battle' : 'Waiting for Host'}
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
