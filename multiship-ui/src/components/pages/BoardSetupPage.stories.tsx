import type { Meta, StoryObj } from '@storybook/react';
import { BoardSetupPage } from './BoardSetupPage';
import type { PlacementShip } from '@/components/game/RetroShipPlacementGrid';
import type { CellState } from '@/components/game/RetroGridCell';

const meta: Meta<typeof BoardSetupPage> = {
  component: BoardSetupPage,
  title: 'Pages/BoardSetupPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BoardSetupPage>;

const createGrid = () =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 'empty' as CellState)
  );

const ships: PlacementShip[] = [
  { id: 's1', length: 4, orientation: 'horizontal', name: 'Battleship', isPlaced: true },
  { id: 's2', length: 3, orientation: 'vertical', name: 'Cruiser', isPlaced: true },
  { id: 's3', length: 2, orientation: 'horizontal', name: 'Destroyer' },
  { id: 's4', length: 1, orientation: 'horizontal', name: 'Scout' },
];

export const Default: Story = {
  args: {
    ships,
    selectedShipId: 's3',
    grid: createGrid(),
    timeRemaining: '01:20',
  },
};

export const AllPlaced: Story = {
  args: {
    ships: ships.map((ship) => ({ ...ship, isPlaced: true })),
    selectedShipId: 's1',
    grid: (() => {
      const grid = createGrid();
      grid[1][1] = 'ship';
      grid[1][2] = 'ship';
      grid[1][3] = 'ship';
      grid[1][4] = 'ship';
      grid[4][6] = 'ship';
      grid[5][6] = 'ship';
      grid[6][6] = 'ship';
      return grid;
    })(),
    isReady: true,
    timeRemaining: '00:10',
  },
};
