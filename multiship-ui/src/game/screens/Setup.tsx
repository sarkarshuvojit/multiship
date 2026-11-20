import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { gameActions } from '@/features/game/game-slice';
import { SUBMIT_BOARD } from '@/ws/actions';
import { FLEET, canPlace, randomFleet, shipAt, shipCells, type Placements } from '@/lib/fleet';
import { cn } from '@/lib/utils';
import type { RoomView, ShipDirection, ShipState } from '@/types/multiship.types';
import { Board } from '../Board';
import { ShipSprite } from '../ShipSprite';
import { Avatar, Button, Chip, Panel } from '../ui';
import { sfx } from '@/lib/sfx';

interface Held {
  id: string;
  direction: ShipDirection;
  origin?: ShipState;
}

export function Setup({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const { boardSubmitted, pending } = useAppSelector((s) => s.game);
  const [placements, setPlacements] = useState<Placements>(() => randomFleet());
  const [held, setHeld] = useState<Held | null>(null);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const locked = boardSubmitted;

  const heldDef = held && FLEET.find((d) => d.id === held.id);

  // The held ship snaps inside the grid so it can always be dropped near the cursor.
  const candidate: ShipState | null = useMemo(() => {
    if (!held || !heldDef || !hover) return null;
    const [hx, hy] = hover;
    const horizontal = held.direction === 'HORIZONTAL';
    return {
      x: horizontal ? Math.min(hx, 10 - heldDef.length) : hx,
      y: horizontal ? hy : Math.min(hy, 10 - heldDef.length),
      direction: held.direction,
      length: heldDef.length,
    };
  }, [held, heldDef, hover]);

  const candidateValid = candidate ? canPlace(candidate, Object.values(placements)) : false;
  const allPlaced = FLEET.every((d) => placements[d.id]) && !held;

  const pickUp = (id: string) => {
    if (locked) return;
    const origin = placements[id];
    const rest = { ...placements };
    delete rest[id];
    setPlacements(rest);
    setHeld({ id, direction: origin?.direction ?? 'HORIZONTAL', origin });
    sfx.click();
  };

  const rotate = useCallback(() => {
    setHeld((h) => (h ? { ...h, direction: h.direction === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL' } : h));
  }, []);

  const cancel = useCallback(() => {
    if (held?.origin) {
      const { id, origin } = held;
      setPlacements((p) => ({ ...p, [id]: origin }));
    }
    setHeld(null);
  }, [held]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') rotate();
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotate, cancel]);

  const onCellClick = (x: number, y: number) => {
    if (locked) return;
    if (held) {
      if (candidate && candidateValid) {
        const next = { ...placements, [held.id]: candidate };
        setPlacements(next);
        sfx.click();
        // Flow straight into the next unplaced ship, if any.
        const nextId = FLEET.find((d) => !next[d.id])?.id;
        setHeld(nextId ? { id: nextId, direction: held.direction } : null);
      }
      return;
    }
    const id = shipAt(placements, x, y);
    if (id) pickUp(id);
  };

  const ready = () => {
    if (!allPlaced || pending) return;
    const fleet = FLEET.map((d) => placements[d.id]);
    dispatch(gameActions.boardSubmitRequested(fleet));
    dispatch(SUBMIT_BOARD({ roomId: room.roomId, ships: fleet }));
  };

  const waitingOn = room.players.filter((p) => p.status !== 'BOARD_READY' && p.sessionId !== me);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {locked ? 'Fleet locked in' : 'Deploy your fleet'}
          </h1>
          <p className="mt-1 text-slate-400">
            {locked
              ? waitingOn.length
                ? `Waiting for ${waitingOn.map((p) => p.name).join(' & ')}…`
                : 'Everyone is ready — battle stations!'
              : 'Already placed for you. Tap a ship to move it, or just hit Ready.'}
          </p>
        </div>
        <div className="flex -space-x-1.5">
          {room.players.map((p) => (
            <span key={p.sessionId} className="relative" title={`${p.name}: ${p.status === 'BOARD_READY' ? 'ready' : 'placing'}`}>
              <Avatar emoji={p.avatar} size="sm" className="ring-2 ring-abyss" />
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-abyss',
                  p.status === 'BOARD_READY' ? 'bg-ok' : 'bg-gold animate-pulse',
                )}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Panel className="flex justify-center p-4 sm:p-6">
          <Board
            size="lg"
            ships={Object.values(placements)}
            editable={!locked}
            preview={candidate ? { cells: shipCells(candidate), valid: candidateValid } : undefined}
            onCellClick={onCellClick}
            onCellHover={setHover}
            onRotate={rotate}
            dimmed={false}
          />
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Your ships</h2>
              {held ? (
                <Chip tone="accent">Placing {heldDef?.name}</Chip>
              ) : (
                <Chip tone={allPlaced ? 'ok' : 'gold'}>
                  {Object.keys(placements).length}/{FLEET.length} placed
                </Chip>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FLEET.map((d) => {
                const placed = Boolean(placements[d.id]);
                const isHeld = held?.id === d.id;
                return (
                  <button
                    key={d.id}
                    disabled={locked}
                    onClick={() => (isHeld ? cancel() : pickUp(d.id))}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition',
                      isHeld ? 'bg-accent/15 ring-1 ring-accent' : 'bg-deep ring-1 ring-line hover:ring-accent/40',
                      locked && 'cursor-default hover:ring-line',
                    )}
                  >
                    <ShipSprite
                      length={d.length}
                      variant={placed || isHeld ? (isHeld ? 'ghost' : 'own') : 'muted'}
                      className="h-3.5 shrink-0"
                      style={{ width: d.length * 14 }}
                    />
                    <span className={cn('truncate', placed ? 'text-slate-300' : 'text-slate-500')}>{d.name}</span>
                  </button>
                );
              })}
            </div>
            {!locked && (
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => { setHeld(null); setPlacements(randomFleet()); sfx.click(); }}>
                  🎲 Shuffle
                </Button>
                <Button variant="secondary" size="sm" onClick={rotate} disabled={!held} title="Rotate (R)">
                  ⟳ Rotate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPlacements({});
                    setHeld({ id: FLEET[0].id, direction: 'HORIZONTAL' });
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </Panel>

          {!locked ? (
            <Button size="lg" className="w-full" disabled={!allPlaced} loading={pending} onClick={ready}>
              {allPlaced ? 'Ready for battle' : `Place ${FLEET.length - Object.keys(placements).length} more`}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-ok/10 py-4 text-sm font-semibold text-ok ring-1 ring-ok/30">
              ✓ Ready — {waitingOn.length ? 'waiting for others' : 'starting…'}
            </div>
          )}

          {!locked && (
            <p className="hidden text-center text-xs text-slate-500 sm:block">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">R</kbd> or right-click to rotate ·{' '}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Esc</kbd> to cancel
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
