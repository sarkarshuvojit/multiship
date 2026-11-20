import { Fragment, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { shipCells } from '@/lib/fleet';
import type { ServerCellState, ShipState } from '@/types/multiship.types';

const COLS = 'ABCDEFGHIJ';
const N = 10;

type Seg = { dir: 'H' | 'V'; first: boolean; last: boolean };

function segmentMap(ships: ShipState[] | undefined): Map<string, Seg> {
  const map = new Map<string, Seg>();
  ships?.forEach((ship) =>
    shipCells(ship).forEach(([x, y], i) =>
      map.set(`${x},${y}`, {
        dir: ship.direction === 'HORIZONTAL' ? 'H' : 'V',
        first: i === 0,
        last: i === ship.length - 1,
      }),
    ),
  );
  return map;
}

function hullRadius(seg: Seg) {
  if (seg.first && seg.last) return 'rounded-[35%]';
  if (seg.dir === 'H') return cn(seg.first && 'rounded-l-[45%]', seg.last && 'rounded-r-[45%]');
  return cn(seg.first && 'rounded-t-[45%]', seg.last && 'rounded-b-[45%]');
}

function hullInset(seg: Seg) {
  // Hull segments touch each other along the ship's axis for a continuous look.
  if (seg.dir === 'H') return cn('inset-y-[14%]', seg.first ? 'left-[12%]' : 'left-0', seg.last ? 'right-[12%]' : 'right-0');
  return cn('inset-x-[14%]', seg.first ? 'top-[12%]' : 'top-0', seg.last ? 'bottom-[12%]' : 'bottom-0');
}

export interface BoardProps {
  /** Shots fired at this board. */
  shots?: ServerCellState[][];
  /** Ships drawn in full (your own fleet / placement). */
  ships?: ShipState[];
  /** Ships revealed because they were sunk. */
  sunkShips?: ShipState[];
  preview?: { cells: [number, number][]; valid: boolean };
  /** Attack mode: open water is clickable with a crosshair. */
  targetable?: boolean;
  /** Placement mode: every cell is clickable. */
  editable?: boolean;
  lastShot?: { x: number; y: number; hit: boolean; seq: number } | null;
  dimmed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCellClick?: (x: number, y: number) => void;
  onCellHover?: (cell: [number, number] | null) => void;
  onRotate?: () => void;
}

export function Board({
  shots,
  ships,
  sunkShips,
  preview,
  targetable,
  editable,
  lastShot,
  dimmed,
  size = 'md',
  className,
  onCellClick,
  onCellHover,
  onRotate,
}: BoardProps) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const shipSegs = segmentMap(ships);
  const sunkSegs = segmentMap(sunkShips);
  const previewSet = new Set(preview?.cells.map(([x, y]) => `${x},${y}`));

  const setHoverCell = (cell: [number, number] | null) => {
    setHover(cell);
    onCellHover?.(cell);
  };

  const onContext = (e: MouseEvent) => {
    if (!onRotate) return;
    e.preventDefault();
    onRotate();
  };

  return (
    <div
      className={cn(
        'w-full select-none',
        {
          sm: 'max-w-[260px]',
          md: 'max-w-[min(400px,calc(100svh-15rem))] min-w-[240px]',
          lg: 'max-w-[min(480px,calc(100svh-13rem))] min-w-[280px]',
        }[size],
        dimmed && 'opacity-45 grayscale-[60%]',
        className,
      )}
      onMouseLeave={() => setHoverCell(null)}
      onContextMenu={onContext}
    >
      <div className="grid grid-cols-[1.1rem_repeat(10,minmax(0,1fr))] gap-[3px] sm:grid-cols-[1.4rem_repeat(10,minmax(0,1fr))]">
        <span />
        {COLS.split('').map((c, x) => (
          <span
            key={c}
            className={cn(
              'pb-1 text-center font-mono text-[10px] text-slate-500 transition-colors',
              hover?.[0] === x && (targetable || editable) && 'text-accent',
            )}
          >
            {c}
          </span>
        ))}

        {Array.from({ length: N }, (_, y) => (
          <Fragment key={y}>
            <span
              className={cn(
                'flex items-center justify-end pr-1 font-mono text-[10px] text-slate-500 transition-colors',
                hover?.[1] === y && (targetable || editable) && 'text-accent',
              )}
            >
              {y + 1}
            </span>
            {Array.from({ length: N }, (_, x) => {
              const key = `${x},${y}`;
              const shot = shots?.[y]?.[x] ?? 'HIDDEN';
              const seg = shipSegs.get(key);
              const sunk = sunkSegs.get(key);
              const inPreview = previewSet.has(key);
              const isLast = lastShot && lastShot.x === x && lastShot.y === y;
              const open = shot === 'HIDDEN';
              const clickable = (targetable && open) || editable;
              const crosshair = targetable && hover && (hover[0] === x || hover[1] === y) && !(hover[0] === x && hover[1] === y);

              return (
                <button
                  key={key}
                  type="button"
                  tabIndex={clickable ? 0 : -1}
                  aria-label={`${COLS[x]}${y + 1}${shot === 'HIT' ? ' hit' : shot === 'MISS' ? ' miss' : ''}`}
                  disabled={!clickable}
                  onMouseEnter={() => setHoverCell([x, y])}
                  onFocus={() => setHoverCell([x, y])}
                  onClick={() => clickable && onCellClick?.(x, y)}
                  className={cn(
                    'relative aspect-square rounded-[22%] bg-water transition-colors duration-100',
                    'disabled:cursor-default',
                    crosshair && 'bg-[#172848]',
                    targetable && open && 'cursor-crosshair hover:bg-accent/25 hover:ring-1 hover:ring-accent/70',
                    editable && 'cursor-pointer hover:bg-water-hover',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  )}
                >
                  {/* Ship hull (own fleet or revealed sunk ship) */}
                  {(seg || sunk) && (
                    <span
                      className={cn(
                        'absolute',
                        hullInset((seg ?? sunk)!),
                        hullRadius((seg ?? sunk)!),
                        sunk
                          ? 'bg-hit-strong/25 ring-1 ring-hit/60'
                          : 'bg-gradient-to-b from-ship-edge to-ship shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]',
                      )}
                    />
                  )}

                  {/* Placement preview */}
                  {inPreview && (
                    <span
                      className={cn(
                        'absolute inset-[10%] rounded-[30%] ring-2',
                        preview?.valid ? 'bg-accent/30 ring-accent' : 'bg-hit/25 ring-hit',
                      )}
                    />
                  )}

                  {/* Shot markers */}
                  {shot === 'MISS' && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="size-[22%] rounded-full bg-miss/80" />
                    </span>
                  )}
                  {shot === 'HIT' && (
                    <span className={cn('absolute inset-0 grid place-items-center', isLast && 'animate-boom')}>
                      <span className="size-[46%] rounded-full bg-hit shadow-[0_0_12px_2px_rgb(251_113_133/0.7)]" />
                      <span className="absolute size-[20%] rounded-full bg-white/90" />
                    </span>
                  )}

                  {/* Impact ripple on the most recent shot */}
                  {isLast && (
                    <span
                      key={lastShot.seq}
                      className={cn(
                        'pointer-events-none absolute inset-0 rounded-full animate-splash',
                        lastShot.hit ? 'ring-2 ring-hit' : 'ring-2 ring-accent/70',
                      )}
                    />
                  )}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
