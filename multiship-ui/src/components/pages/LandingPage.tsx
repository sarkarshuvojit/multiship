import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroCard } from '@/components/retro-ui/RetroCard';

export interface LandingPageProps {
  onStartGame?: () => void;
  title?: string;
  subtitle?: string;
  version?: string;
}

export function LandingPage({
  onStartGame,
  title = 'Multiship',
  subtitle = 'Three captains enter. One fleet survives.',
  version = 'v0.4.2',
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#070707] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b0b0b_55%)]" />
      <div className="absolute -top-32 -right-24 w-80 h-80 bg-[#39FF14]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.6em] text-[#00FFFF] mb-4">Retro Fleet Ops</p>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-[0.15em] text-[#39FF14]">
              {title}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-md">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <RetroButton size="lg" onClick={onStartGame}>
                Press Start
              </RetroButton>
              <RetroButton variant="ghost" size="lg">
                How to Play
              </RetroButton>
            </div>
          </div>

          <RetroCard title="Mission Brief" className="flex-1 w-full">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-[#39FF14]">+</span>
                Deploy your fleet across a 10x10 grid.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#39FF14]">+</span>
                Rotate ships and track enemy hits.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#39FF14]">+</span>
                Survive until you are the last commander standing.
              </li>
            </ul>

            <div className="mt-6 border-t-2 border-gray-600 pt-4 text-xs text-gray-400 flex items-center justify-between">
              <span>{version}</span>
              <span>Built for multiplayer chaos</span>
            </div>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
