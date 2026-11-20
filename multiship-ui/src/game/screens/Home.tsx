import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { gameActions } from '@/features/game/game-slice';
import { CREATE_ROOM, JOIN_ROOM, SIGNUP } from '@/ws/actions';
import { randomCallSign, savePrefs } from '@/lib/prefs';
import { cn } from '@/lib/utils';
import { Board } from '../Board';
import { Button, Chip, Panel } from '../ui';
import { AVATARS, normalizeCode } from '../constants';
import type { ShipState } from '@/types/multiship.types';

type Intent = { kind: 'create' } | { kind: 'join'; code: string } | null;

const DEMO_SHIPS: ShipState[] = [
  { x: 1, y: 1, direction: 'HORIZONTAL', length: 4 },
  { x: 7, y: 0, direction: 'VERTICAL', length: 3 },
  { x: 2, y: 4, direction: 'VERTICAL', length: 3 },
  { x: 5, y: 6, direction: 'HORIZONTAL', length: 2 },
  { x: 8, y: 8, direction: 'HORIZONTAL', length: 2 },
];
const DEMO_SHOTS = (() => {
  const g = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 'HIDDEN' as const)) as (
    | 'HIDDEN'
    | 'HIT'
    | 'MISS'
  )[][];
  [[1, 1], [2, 1], [7, 1], [5, 6]].forEach(([x, y]) => (g[y][x] = 'HIT'));
  [[4, 3], [6, 3], [0, 8], [9, 4], [3, 8]].forEach(([x, y]) => (g[y][x] = 'MISS'));
  return g;
})();

export function Home({ inviteCode }: { inviteCode?: string }) {
  const dispatch = useAppDispatch();
  const { connected, pending, signedUp, name: savedName, avatar: savedAvatar } = useAppSelector((s) => s.game);
  const [name, setName] = useState(() => savedName || randomCallSign());
  const [avatar, setAvatar] = useState(() => savedAvatar || AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [code, setCode] = useState('');
  const [intent, setIntent] = useState<Intent>(null);
  const [showJoin, setShowJoin] = useState(false);

  // Once (re-)signup completes, carry out what the player clicked.
  useEffect(() => {
    if (!intent || pending || !signedUp) return;
    dispatch(gameActions.roomRequested());
    if (intent.kind === 'create') dispatch(CREATE_ROOM());
    else dispatch(JOIN_ROOM({ roomCode: intent.code }));
    setIntent(null);
  }, [intent, pending, signedUp, dispatch]);

  const go = (next: Exclude<Intent, null>) => {
    const callSign = name.trim() || randomCallSign();
    setName(callSign);
    savePrefs({ name: callSign, avatar });
    setIntent(next);
    dispatch(gameActions.signupRequested({ name: callSign, avatar }));
    dispatch(SIGNUP({ email: '', name: callSign, avatar }));
  };

  const busy = pending || Boolean(intent);
  const joinCode = normalizeCode(code);
  const canJoin = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/.test(joinCode);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-16">
      <div className="hidden lg:block">
        <Chip tone="accent">2–3 players · no sign-up</Chip>
        <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
          Sink your friends.
          <br />
          <span className="text-accent">Last fleet afloat wins.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-slate-400">
          Real-time naval battle for up to three captains. Share a link, drop your fleet, take turns firing.
        </p>
        <div className="mt-10 opacity-90">
          <Board ships={DEMO_SHIPS} shots={DEMO_SHOTS} size="sm" />
        </div>
      </div>

      <Panel className="mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="lg:hidden">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Sink your friends.
          </h1>
          <p className="mt-1 text-slate-400">Naval battle for 2–3 captains.</p>
        </div>

        {inviteCode && (
          <div className="mb-6 rounded-xl bg-accent/10 p-4 ring-1 ring-accent/30 max-lg:mt-6">
            <p className="text-sm text-slate-300">You've been invited to a battle</p>
            <p className="mt-0.5 font-mono text-lg font-medium tracking-wider text-accent">{inviteCode.toUpperCase()}</p>
          </div>
        )}

        <label className="block max-lg:mt-6" htmlFor="callsign">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Your call sign</span>
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="callsign"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go(inviteCode ? { kind: 'join', code: inviteCode } : { kind: 'create' })}
            className="h-12 min-w-0 flex-1 rounded-xl bg-deep px-4 text-base font-medium text-white ring-1 ring-line outline-none transition focus:ring-2 focus:ring-accent"
            placeholder="Captain name"
          />
          <Button variant="secondary" className="h-12 w-12 px-0 text-lg" onClick={() => setName(randomCallSign())} title="Random name" aria-label="Random name">
            🎲
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={a === avatar}
              onClick={() => setAvatar(a)}
              className={cn(
                'grid h-11 place-items-center rounded-xl text-xl transition-all',
                a === avatar ? 'bg-accent/15 ring-2 ring-accent scale-105' : 'bg-deep ring-1 ring-line hover:bg-panel-2',
              )}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-7 space-y-3">
          {inviteCode ? (
            <>
              <Button size="lg" className="w-full" loading={busy} disabled={!connected} onClick={() => go({ kind: 'join', code: inviteCode })}>
                Join battle
              </Button>
              <Button variant="ghost" className="w-full" disabled={!connected || busy} onClick={() => go({ kind: 'create' })}>
                Start my own game instead
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="w-full" loading={busy && intent?.kind !== 'join'} disabled={!connected || busy} onClick={() => go({ kind: 'create' })}>
                Create game
              </Button>
              {!showJoin ? (
                <Button variant="secondary" className="w-full" disabled={!connected || busy} onClick={() => setShowJoin(true)}>
                  Join with a code
                </Button>
              ) : (
                <form
                  className="flex gap-2 animate-rise"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canJoin) go({ kind: 'join', code: joinCode });
                  }}
                >
                  <input
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(normalizeCode(e.target.value))}
                    placeholder="abc-def-ghi"
                    spellCheck={false}
                    autoCapitalize="off"
                    className="h-11 min-w-0 flex-1 rounded-xl bg-deep px-4 font-mono tracking-wider text-white ring-1 ring-line outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button type="submit" variant="secondary" disabled={!canJoin || busy} loading={busy && intent?.kind === 'join'}>
                    Join
                  </Button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span className={cn('size-1.5 rounded-full', connected ? 'bg-ok' : 'bg-gold animate-pulse')} />
          {connected ? 'Connected to server' : 'Connecting to server…'}
        </p>
      </Panel>
    </div>
  );
}
