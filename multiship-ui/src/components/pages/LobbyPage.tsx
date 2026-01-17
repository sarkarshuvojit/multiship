import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroInput } from '@/components/retro-ui/RetroInput';
import { RetroBadge } from '@/components/retro-ui/RetroBadge';

export interface LobbyPageProps {
  roomCode?: string;
  onRoomCodeChange?: (value: string) => void;
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
  onQuickMatch?: () => void;
  error?: string;
}

export function LobbyPage({
  roomCode,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onQuickMatch,
  error,
}: LobbyPageProps) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-6 py-12">
      <div className="grid gap-6 w-full max-w-4xl lg:grid-cols-2">
        <RetroCard title="Create Battle">
          <p className="text-sm text-gray-300 mb-6">Spin up a new room and invite allies.</p>
          <RetroButton onClick={onCreateRoom} size="lg">
            Create Room
          </RetroButton>
        </RetroCard>

        <RetroCard title="Join Battle" variant="highlight">
          <p className="text-sm text-gray-300 mb-4">Enter a room code to deploy.</p>
          <RetroInput
            value={roomCode}
            onChange={onRoomCodeChange}
            placeholder="ROOM CODE"
            error={error}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <RetroButton variant="secondary" onClick={onJoinRoom}>
              Join Room
            </RetroButton>
            <RetroButton variant="ghost" onClick={onQuickMatch}>
              Quick Match
            </RetroButton>
          </div>
          {error && (
            <div className="mt-4">
              <RetroBadge label={error} variant="error" />
            </div>
          )}
        </RetroCard>
      </div>
    </div>
  );
}
