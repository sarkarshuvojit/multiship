import type { CSSProperties } from 'react';
import type { ShipDirection } from '@/types/multiship.types';

export type ShipVariant = 'own' | 'sunk' | 'ghost' | 'invalid' | 'muted';

interface Palette {
  hull: string;
  edge: string;
  deck: string;
  detail: string;
  turret: string;
  shine: string;
  opacity?: number;
}

const PALETTES: Record<ShipVariant, Palette> = {
  own: {
    hull: 'var(--color-ship)',
    edge: 'var(--color-ship-edge)',
    deck: '#5d7099',
    detail: '#2a3654',
    turret: '#36456a',
    shine: 'rgb(255 255 255 / 0.22)',
  },
  sunk: {
    hull: '#3b1a27',
    edge: 'var(--color-hit)',
    deck: '#4a2131',
    detail: '#220d16',
    turret: '#2c111c',
    shine: 'rgb(251 113 133 / 0.18)',
    opacity: 0.9,
  },
  ghost: {
    hull: 'rgb(34 211 238 / 0.28)',
    edge: 'var(--color-accent)',
    deck: 'rgb(34 211 238 / 0.18)',
    detail: 'rgb(34 211 238 / 0.55)',
    turret: 'rgb(34 211 238 / 0.4)',
    shine: 'rgb(255 255 255 / 0.25)',
  },
  invalid: {
    hull: 'rgb(251 113 133 / 0.25)',
    edge: 'var(--color-hit)',
    deck: 'rgb(251 113 133 / 0.15)',
    detail: 'rgb(251 113 133 / 0.55)',
    turret: 'rgb(251 113 133 / 0.4)',
    shine: 'rgb(255 255 255 / 0.2)',
  },
  muted: {
    hull: 'rgb(255 255 255 / 0.08)',
    edge: 'rgb(255 255 255 / 0.22)',
    deck: 'rgb(255 255 255 / 0.05)',
    detail: 'rgb(255 255 255 / 0.18)',
    turret: 'rgb(255 255 255 / 0.14)',
    shine: 'transparent',
  },
};

/** Top-down hull with a pointed bow on the right (+x) and a rounded stern. */
function hullPath(w: number, top: number, bot: number, inset = 0) {
  const s = 6 + inset;
  const e = w - 5 - inset * 1.6;
  const t = top + inset;
  const b = bot - inset;
  const r = Math.min(14, (b - t) / 2);
  const bow = Math.min(72, w * 0.32);
  return [
    `M ${s + r} ${t}`,
    `L ${e - bow} ${t}`,
    `Q ${e - bow * 0.3} ${t} ${e} 50`,
    `Q ${e - bow * 0.3} ${b} ${e - bow} ${b}`,
    `L ${s + r} ${b}`,
    `Q ${s} ${b} ${s} ${b - r}`,
    `L ${s} ${t + r}`,
    `Q ${s} ${t} ${s + r} ${t}`,
    'Z',
  ].join(' ');
}

function Turret({ cx, aft, r = 11, p }: { cx: number; aft?: boolean; r?: number; p: Palette }) {
  const len = r * 2.1;
  return (
    <g>
      <rect
        x={aft ? cx - len : cx}
        y={50 - r * 0.42}
        width={len}
        height={r * 0.32}
        rx={1.5}
        fill={p.detail}
      />
      <rect
        x={aft ? cx - len : cx}
        y={50 + r * 0.1}
        width={len}
        height={r * 0.32}
        rx={1.5}
        fill={p.detail}
      />
      <circle cx={cx} cy={50} r={r} fill={p.turret} stroke={p.edge} strokeOpacity={0.55} strokeWidth={1.5} />
      <circle cx={cx - r * 0.25} cy={50 - r * 0.3} r={r * 0.35} fill={p.shine} />
    </g>
  );
}

function Funnel({ cx, r = 7, p }: { cx: number; r?: number; p: Palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={50} rx={r * 1.15} ry={r} fill={p.detail} stroke={p.edge} strokeOpacity={0.5} strokeWidth={1.2} />
      <ellipse cx={cx} cy={50} rx={r * 0.6} ry={r * 0.5} fill="rgb(0 0 0 / 0.45)" />
    </g>
  );
}

function Bridge({ x1, x2, h = 28, p }: { x1: number; x2: number; h?: number; p: Palette }) {
  return (
    <g>
      <rect x={x1} y={50 - h / 2} width={x2 - x1} height={h} rx={5} fill={p.turret} stroke={p.edge} strokeOpacity={0.5} strokeWidth={1.2} />
      <rect x={x2 - 10} y={50 - h / 2 + 4} width={5} height={h - 8} rx={1.5} fill={p.shine} />
    </g>
  );
}

function Hull({ w, top, bot, p }: { w: number; top: number; bot: number; p: Palette }) {
  return (
    <g>
      <path d={hullPath(w, top, bot)} fill={p.hull} stroke={p.edge} strokeWidth={2.2} strokeLinejoin="round" />
      <path d={hullPath(w, top, bot, 6)} fill={p.deck} />
      <path d={`M ${22} ${top + 4} L ${w - Math.min(72, w * 0.32) - 4} ${top + 4}`} stroke={p.shine} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function Details({ length, p }: { length: number; p: Palette }) {
  switch (length) {
    case 4: // Battleship: two forward turrets, one aft, big superstructure, twin funnels
      return (
        <>
          <Hull w={400} top={13} bot={87} p={p} />
          <Turret cx={72} aft r={14} p={p} />
          <Funnel cx={128} r={9} p={p} />
          <Funnel cx={160} r={9} p={p} />
          <Bridge x1={182} x2={234} h={40} p={p} />
          <Turret cx={264} r={12} p={p} />
          <Turret cx={306} r={14} p={p} />
        </>
      );
    case 3: // Cruiser: fore and aft turrets, bridge, funnel
      return (
        <>
          <Hull w={300} top={16} bot={84} p={p} />
          <Turret cx={60} aft r={13} p={p} />
          <Funnel cx={110} r={8.5} p={p} />
          <Bridge x1={130} x2={174} h={36} p={p} />
          <Turret cx={212} r={13} p={p} />
        </>
      );
    case 2: // Destroyer: lean hull, one gun, compact bridge
      return (
        <>
          <Hull w={200} top={21} bot={79} p={p} />
          <Funnel cx={50} r={7.5} p={p} />
          <Bridge x1={70} x2={108} h={30} p={p} />
          <Turret cx={136} r={11} p={p} />
        </>
      );
    default: // Submarine: capsule hull with a conning tower
      return (
        <>
          <rect x={6} y={27} width={88} height={46} rx={23} fill={p.hull} stroke={p.edge} strokeWidth={2.2} />
          <rect x={13} y={34} width={74} height={32} rx={16} fill={p.deck} />
          <rect x={36} y={40} width={30} height={20} rx={10} fill={p.turret} stroke={p.edge} strokeOpacity={0.55} strokeWidth={1.2} />
          <circle cx={59} cy={50} r={3} fill={p.shine} />
          <path d="M 8 42 L 2 37 M 8 58 L 2 63" stroke={p.edge} strokeWidth={2} strokeLinecap="round" />
        </>
      );
  }
}

export interface ShipSpriteProps {
  length: number;
  direction?: ShipDirection;
  variant?: ShipVariant;
  className?: string;
  style?: CSSProperties;
}

/** Top-down warship drawing that fills a `length`-cell span, horizontal or vertical. */
export function ShipSprite({ length, direction = 'HORIZONTAL', variant = 'own', className, style }: ShipSpriteProps) {
  const p = PALETTES[variant];
  const w = length * 100;
  const vertical = direction === 'VERTICAL';
  return (
    <svg
      viewBox={vertical ? `0 0 100 ${w}` : `0 0 ${w} 100`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ opacity: p.opacity, overflow: 'visible', ...style }}
      aria-hidden
    >
      {/* Vertical ships are the horizontal drawing turned so the bow faces down. */}
      <g transform={vertical ? 'translate(100 0) rotate(90)' : undefined}>
        <Details length={length} p={p} />
        {variant === 'sunk' && (
          <path
            d={`M ${w * 0.18} 30 L ${w * 0.32} 62 L ${w * 0.5} 38 L ${w * 0.66} 66 L ${w * 0.82} 34`}
            stroke="rgb(0 0 0 / 0.55)"
            strokeWidth={3}
            fill="none"
            strokeLinejoin="round"
          />
        )}
      </g>
    </svg>
  );
}
