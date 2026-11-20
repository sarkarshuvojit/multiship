import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { LEAVE_ROOM, REMATCH, TRY_HIT } from '@/ws/actions';
import { type GameLogEvent } from '@/features/game/game-slice';
import { cn } from '@/lib/utils';
import type { PlayerView, RoomView } from '@/types/multiship.types';
import { Board } from '../Board';
import { Avatar, Button, Chip, FleetPips, Panel } from '../ui';
import { FLEET_SIZE } from '../constants';

export function Battle({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const { myShips, log, lastShot, error } = useAppSelector((s) => s.game);
  const [firing, setFiring] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const self = room.players.find((p) => p.sessionId === me);
  const opponents = room.players.filter((p) => p.sessionId !== me);
  const current = room.players.find((p) => p.sessionId === room.currentPlayer);
  const isMyTurn = room.status === 'ONGOING' && room.currentPlayer === me && !self?.eliminated;
  const finished = room.status === 'FINISHED';

  // Unlock firing once the turn moves on or the server rejects the shot.
  useEffect(() => setFiring(false), [room.currentPlayer, error]);

  const fire = (target: PlayerView, x: number, y: number) => {
    if (!isMyTurn || firing || target.eliminated) return;
    setFiring(true);
    dispatch(TRY_HIT({ roomId: room.roomId, targetSessionId: target.sessionId, x, y }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-10 sm:px-6">
      {/* Sticky turn banner */}
      <div className="sticky top-14 z-20 -mx-3 mb-4 bg-abyss/80 px-3 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <TurnBanner isMyTurn={isMyTurn} current={current} self={self} finished={finished} firing={firing} />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className={cn('grid gap-5', opponents.length > 1 && 'md:grid-cols-2')}>
          {opponents.map((p) => {
            const targetable = isMyTurn && !firing && !p.eliminated;
            const isAiming = room.currentPlayer === p.sessionId;
            return (
              <Panel
                key={p.sessionId}
                className={cn(
                  'p-4 transition-shadow duration-300 sm:p-5',
                  targetable && 'ring-accent/40 shadow-[0_0_0_1px_rgb(34_211_238/0.25),0_20px_60px_-20px_rgb(34_211_238/0.35)]',
                )}
              >
                <PlayerHeader player={p} aiming={isAiming} />
                <div className="mt-4 flex justify-center">
                  <Board
                    size={opponents.length > 1 ? 'md' : 'lg'}
                    shots={p.board}
                    sunkShips={p.sunkShips}
                    targetable={targetable}
                    dimmed={p.eliminated}
                    lastShot={lastShot?.targetId === p.sessionId ? lastShot : null}
                    onCellClick={(x, y) => fire(p, x, y)}
                  />
                </div>
              </Panel>
            );
          })}
        </div>

        <div className="space-y-5">
          {self && (
            <Panel className="p-4 sm:p-5">
              <PlayerHeader player={self} aiming={room.currentPlayer === me} you />
              <div className="mt-4 flex justify-center">
                <Board
                  size="sm"
                  ships={myShips}
                  shots={self.board}
                  sunkShips={self.sunkShips}
                  lastShot={lastShot?.targetId === me ? lastShot : null}
                  dimmed={self.eliminated}
                />
              </div>
            </Panel>
          )}
          <BattleLog log={log} />
        </div>
      </div>

      {finished &&
        (showSummary ? (
          <GameOver
            room={room}
            me={me}
            onHome={() => dispatch(LEAVE_ROOM())}
            onRematch={() => dispatch(REMATCH(room.roomId))}
            onDismiss={() => setShowSummary(false)}
          />
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-abyss/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md animate-rise">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <p className="truncate text-sm text-slate-300">
                {room.winnerId === me ? '🏆 You won' : `🌊 ${room.players.find((p) => p.sessionId === room.winnerId)?.name ?? 'Someone'} won`}
              </p>
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSummary(true)}>
                  Results
                </Button>
                <Button variant="ghost" size="sm" onClick={() => dispatch(LEAVE_ROOM())}>
                  Home
                </Button>
                <Button size="sm" onClick={() => dispatch(REMATCH(room.roomId))}>
                  Rematch
                </Button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function TurnBanner({
  isMyTurn,
  current,
  self,
  finished,
  firing,
}: {
  isMyTurn: boolean;
  current?: PlayerView;
  self?: PlayerView;
  finished: boolean;
  firing: boolean;
}) {
  if (finished) {
    return <div className="rounded-2xl bg-panel px-5 py-3 text-center font-semibold text-slate-300 ring-1 ring-line">Battle over</div>;
  }
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ring-1 transition-all duration-300 sm:px-5',
        isMyTurn ? 'bg-accent text-abyss ring-accent shadow-[0_10px_40px_-10px_rgb(34_211_238/0.7)]' : 'bg-panel text-slate-200 ring-line',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {isMyTurn ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-abyss/15 text-lg">🎯</span>
        ) : (
          <Avatar emoji={current?.avatar} size="sm" active />
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold leading-tight sm:text-xl">
            {isMyTurn ? (firing ? 'Firing…' : 'Your turn — pick a target') : `${current?.name ?? '…'} is taking aim`}
          </p>
          <p className={cn('text-xs', isMyTurn ? 'text-abyss/70' : 'text-slate-500')}>
            {self?.eliminated
              ? 'Your fleet is sunk — spectating'
              : isMyTurn
                ? 'Click any open square on an enemy board'
                : 'Hold tight, your turn is coming'}
          </p>
        </div>
      </div>
      {self && !self.eliminated && (
        <span className={cn('hidden shrink-0 text-xs font-medium sm:block', isMyTurn ? 'text-abyss/70' : 'text-slate-500')}>
          {self.shipsRemaining}/{FLEET_SIZE} ships afloat
        </span>
      )}
    </div>
  );
}

function PlayerHeader({ player, aiming, you }: { player: PlayerView; aiming: boolean; you?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar emoji={player.avatar} active={aiming && !player.eliminated} dim={player.eliminated} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">
          {you ? 'Your fleet' : player.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <FleetPips total={FLEET_SIZE} remaining={player.shipsRemaining} />
          <span className="text-[11px] text-slate-500">{player.shipsRemaining} afloat</span>
        </div>
      </div>
      {player.eliminated ? <Chip tone="hit">Sunk</Chip> : aiming && <Chip tone="accent">Aiming</Chip>}
    </div>
  );
}

const logTone: Record<string, string> = {
  hit: 'text-hit',
  sunk: 'text-gold',
  error: 'text-hit',
  turn: 'text-accent',
  miss: 'text-slate-400',
  system: 'text-slate-400',
};

function BattleLog({ log }: { log: GameLogEvent[] }) {
  const recent = log.filter((e) => e.type !== 'turn').slice(-12).reverse();
  return (
    <Panel className="p-4 sm:p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Battle log</h2>
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {recent.length === 0 && <li className="text-slate-500">No shots fired yet.</li>}
        {recent.map((e, i) => (
          <li key={e.id} className={cn('flex gap-2', i === 0 && 'animate-rise', logTone[e.type ?? 'system'])}>
            <span className="shrink-0 font-mono text-[11px] leading-5 text-slate-600">{e.timestamp?.slice(3)}</span>
            <span className="leading-5">{e.message}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function GameOver({
  room,
  me,
  onHome,
  onRematch,
  onDismiss,
}: {
  room: RoomView;
  me: string;
  onHome: () => void;
  onRematch: () => void;
  onDismiss: () => void;
}) {
  const stats = useAppSelector((s) => s.game.stats);
  const winner = room.players.find((p) => p.sessionId === room.winnerId);
  const won = room.winnerId === me;
  const shots = stats.hits + stats.misses;
  const accuracy = shots ? Math.round((stats.hits / shots) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-abyss/60 p-4 backdrop-blur-[2px] animate-in fade-in duration-300"
      onClick={onDismiss}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
      <Panel className="relative w-full p-7 text-center animate-rise">
        <button
          onClick={onDismiss}
          aria-label="View final boards"
          title="View final boards"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          ✕
        </button>
        <div className="text-6xl">{won ? '🏆' : '🌊'}</div>
        <h2 className={cn('mt-3 font-display text-3xl font-bold tracking-tight', won ? 'text-gold' : 'text-white')}>
          {won ? 'Victory!' : 'Defeated'}
        </h2>
        <p className="mt-1 text-slate-400">
          {won ? 'Last fleet afloat. Well sailed, captain.' : winner ? `${winner.name} rules the waves.` : 'The battle is over.'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            ['Hits', stats.hits],
            ['Accuracy', `${accuracy}%`],
            ['Sunk', stats.shipsSunk],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-deep py-3 ring-1 ring-line">
              <p className="font-display text-2xl font-bold text-white">{value}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Button size="lg" className="w-full" onClick={onRematch}>
            Rematch
          </Button>
          <p className="text-xs text-slate-500">Brings everyone still here back to the lobby.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onDismiss}>
              View boards
            </Button>
            <Button variant="ghost" onClick={onHome}>
              Home
            </Button>
          </div>
        </div>
      </Panel>
      </div>
    </div>
  );
}
