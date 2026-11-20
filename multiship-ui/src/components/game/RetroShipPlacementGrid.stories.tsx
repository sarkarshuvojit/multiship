import type { Meta, StoryObj } from '@storybook/react';
import { RetroShipPlacementGrid, type PlacementShip } from './RetroShipPlacementGrid';
import type { CellState } from './RetroGridCell';

const meta: Meta<typeof RetroShipPlacementGrid> = {
  component: RetroShipPlacementGrid,
  title: 'Game/RetroShipPlacementGrid',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-[#0b0b0b] p-8 min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RetroShipPlacementGrid>;

const createGrid = () =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 'empty' as CellState)
  );

const ships: PlacementShip[] = [
  { id: 's1', length: 4, orientation: 'horizontal', name: 'Battleship' },
  { id: 's2', length: 3, orientation: 'vertical', name: 'Cruiser' },
  { id: 's3', length: 2, orientation: 'horizontal', name: 'Destroyer' },
  { id: 's4', length: 1, orientation: 'horizontal', name: 'Submarine', isPlaced: true },
];

export const Default: Story = {
  args: {
    grid: createGrid(),
    ships,
    selectedShipId: 's1',
  },
};

export const WithPlacedShips: Story = {
  args: {
    grid: (() => {
      const grid = createGrid();
      grid[2][2] = 'ship';
      grid[2][3] = 'ship';
      grid[2][4] = 'ship';
      grid[2][5] = 'ship';
      grid[5][1] = 'ship';
      grid[6][1] = 'ship';
      grid[7][1] = 'ship';
      return grid;
    })(),
    ships: ships.map((ship) => ({ ...ship, isPlaced: ship.id !== 's3' })),
    selectedShipId: 's3',
  },
};

export const HoverPreview: Story = {
  args: {
    grid: (() => {
      const grid = createGrid();
      grid[4][4] = 'hover';
      grid[4][5] = 'hover';
      grid[4][6] = 'hover';
      return grid;
    })(),
    ships,
    selectedShipId: 's2',
  },
};
