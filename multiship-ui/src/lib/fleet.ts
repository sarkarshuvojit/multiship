import type { ShipDirection, ShipState } from '@/types/multiship.types';

export const GRID_SIZE = 10;

export interface FleetShip {
  id: string;
  name: string;
  length: 1 | 2 | 3 | 4;
}

/** The fleet the server validates: 1×4, 2×3, 3×2, 4×1. */
export const FLEET: FleetShip[] = [
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser-1', name: 'Cruiser', length: 3 },
  { id: 'cruiser-2', name: 'Cruiser', length: 3 },
  { id: 'destroyer-1', name: 'Destroyer', length: 2 },
  { id: 'destroyer-2', name: 'Destroyer', length: 2 },
  { id: 'destroyer-3', name: 'Destroyer', length: 2 },
  { id: 'sub-1', name: 'Submarine', length: 1 },
  { id: 'sub-2', name: 'Submarine', length: 1 },
  { id: 'sub-3', name: 'Submarine', length: 1 },
  { id: 'sub-4', name: 'Submarine', length: 1 },
];

export type Placements = Record<string, ShipState>;

export function shipCells(ship: ShipState): [number, number][] {
  return Array.from({ length: ship.length }, (_, i) =>
    ship.direction === 'HORIZONTAL' ? [ship.x + i, ship.y] : [ship.x, ship.y + i],
  );
}

export function canPlace(ship: ShipState, others: ShipState[]): boolean {
  const occupied = new Set(others.flatMap(shipCells).map(([x, y]) => `${x},${y}`));
  return shipCells(ship).every(
    ([x, y]) => x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE && !occupied.has(`${x},${y}`),
  );
}

export function shipAt(placements: Placements, x: number, y: number): string | undefined {
  return Object.entries(placements).find(([, ship]) =>
    shipCells(ship).some(([sx, sy]) => sx === x && sy === y),
  )?.[0];
}

export function randomFleet(): Placements {
  // Retry from scratch on the rare dead end; a 10x10 board always fits this fleet.
  for (let attempt = 0; attempt < 100; attempt++) {
    const placements: Placements = {};
    let failed = false;
    for (const def of FLEET) {
      let placed = false;
      for (let tries = 0; tries < 200 && !placed; tries++) {
        const direction: ShipDirection = Math.random() < 0.5 ? 'HORIZONTAL' : 'VERTICAL';
        const ship: ShipState = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          direction,
          length: def.length,
        };
        if (canPlace(ship, Object.values(placements))) {
          placements[def.id] = ship;
          placed = true;
        }
      }
      if (!placed) {
        failed = true;
        break;
      }
    }
    if (!failed) return placements;
  }
  return {};
}
