import { Fragment, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { ShipSprite } from './ShipSprite';
import type { ServerCellState, ShipState } from '@/types/multiship.types';

const COLS = 'ABCDEFGHIJ';
const N = 10;

function shipKey(s: ShipState) {
  return `${s.x},${s.y},${s.direction},${s.length}`;
}

/** Recover a ship from a straight run of preview cells. */
function shipFromCells(cells: [number, number][]): ShipState | null {
  if (!cells.length) return null;
  const xs = cells.map((c) => c[0]);
  const ys = cells.map((c) => c[1]);
  const horizontal = cells.length > 1 && new Set(ys).size === 1;
  return { x: Math.min(...xs), y: Math.min(...ys), direction: horizontal ? 'HORIZONTAL' : 'VERTICAL', length: cells.length };
}

function gridArea(s: ShipState) {
  const h = s.direction === 'HORIZONTAL';
  return {
    gridColumn: `${s.x + 2} / span ${h ? s.length : 1}`,
    gridRow: `${s.y + 2} / span ${h ? 1 : s.length}`,
  };
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
  const sunkKeys = new Set(sunkShips?.map(shipKey));
  const afloat = ships?.filter((s) => !sunkKeys.has(shipKey(s))) ?? [];
  const previewShip = preview ? shipFromCells(preview.cells) : null;
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
            style={{ gridColumn: x + 2, gridRow: 1 }}
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
              style={{ gridColumn: 1, gridRow: y + 2 }}
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
                  style={{ gridColumn: x + 2, gridRow: y + 2 }}
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
                  {/* Placement preview */}
                  {inPreview && (
                    <span
                      className={cn(
                        'absolute inset-0 rounded-[22%]',
                        preview?.valid ? 'bg-accent/15' : 'bg-hit/15',
                      )}
                    />
                  )}

                  {/* Shot markers */}
                  {shot === 'MISS' && (
                    <span className="absolute inset-0 z-[2] grid place-items-center">
                      <span className="size-[22%] rounded-full bg-miss/80" />
                    </span>
                  )}
                  {shot === 'HIT' && (
                    <span className={cn('absolute inset-0 z-[2] grid place-items-center', isLast && 'animate-boom')}>
                      <span className="size-[46%] rounded-full bg-hit shadow-[0_0_12px_2px_rgb(251_113_133/0.7)]" />
                      <span className="absolute size-[20%] rounded-full bg-white/90" />
                    </span>
                  )}

                  {/* Impact ripple on the most recent shot */}
                  {isLast && (
                    <span
                      key={lastShot.seq}
                      className={cn(
                        'pointer-events-none absolute inset-0 z-[2] rounded-full animate-splash',
                        lastShot.hit ? 'ring-2 ring-hit' : 'ring-2 ring-accent/70',
                      )}
                    />
                  )}
                </button>
              );
            })}
          </Fragment>
        ))}

        {/* Ships drawn as whole sprites spanning their cells, above the water. */}
        {afloat.map((s) => (
          <ShipSprite
            key={`own-${shipKey(s)}`}
            length={s.length}
            direction={s.direction}
            style={gridArea(s)}
            className="pointer-events-none relative z-[1] size-full drop-shadow-[0_3px_4px_rgb(0_0_0/0.45)]"
          />
        ))}
        {sunkShips?.map((s) => (
          <ShipSprite
            key={`sunk-${shipKey(s)}`}
            length={s.length}
            direction={s.direction}
            variant="sunk"
            style={gridArea(s)}
            className="pointer-events-none relative z-[1] size-full"
          />
        ))}
        {previewShip && (
          <ShipSprite
            length={previewShip.length}
            direction={previewShip.direction}
            variant={preview?.valid ? 'ghost' : 'invalid'}
            style={gridArea(previewShip)}
            className="pointer-events-none relative z-[1] size-full"
          />
        )}
      </div>
    </div>
  );
}
