import { RetroBadge } from '@/components/retro-ui/RetroBadge';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';
import { RetroInput } from '@/components/retro-ui/RetroInput';
import { RetroAvatar } from '@/components/retro-ui/RetroAvatar';

export interface SignupAvatarOption {
  id: string;
  label: string;
  src?: string;
}

export interface SignupPageProps {
  avatars: SignupAvatarOption[];
  selectedAvatarId?: string;
  username?: string;
  onUsernameChange?: (value: string) => void;
  onAvatarSelect?: (id: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  error?: string;
  liveUsers?: number;
}

export function SignupPage({
  avatars,
  selectedAvatarId,
  username,
  onUsernameChange,
  onAvatarSelect,
  onSubmit,
  isLoading = false,
  error,
  liveUsers,
}: SignupPageProps) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-6 py-12">
      <RetroCard title="Pilot Registration" className="w-full max-w-3xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300">Enter your call sign and select an avatar.</p>
              {liveUsers !== undefined && (
                <div className="mt-2">
                  <RetroBadge label={`${liveUsers} pilots online`} variant="info" />
                </div>
              )}
            </div>
            {error && <RetroBadge label={error} variant="error" />}
          </div>

          <RetroInput
            value={username}
            onChange={onUsernameChange}
            placeholder="Call sign"
            error={error}
          />

          <div>
            <p className="text-xs uppercase tracking-widest text-[#00FFFF] mb-3">Choose Avatar</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {avatars.map((avatar) => (
                <RetroAvatar
                  key={avatar.id}
                  src={avatar.src}
                  alt={avatar.label}
                  fallback={avatar.label}
                  selected={avatar.id === selectedAvatarId}
                  onClick={() => onAvatarSelect?.(avatar.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-end">
            <RetroButton variant="ghost">Spectate</RetroButton>
            <RetroButton onClick={onSubmit} loading={isLoading}>
              Launch
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  );
}
