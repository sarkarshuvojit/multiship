import type { Meta, StoryObj } from '@storybook/react';
import { GameplayPage } from './GameplayPage';
import type { CellState } from '@/components/game/RetroGridCell';

const meta: Meta<typeof GameplayPage> = {
  component: GameplayPage,
  title: 'Pages/GameplayPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GameplayPage>;

const createGrid = () =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 'empty' as CellState)
  );

const playerBoard = (() => {
  const grid = createGrid();
  grid[2][2] = 'ship';
  grid[2][3] = 'ship';
  grid[2][4] = 'ship';
  grid[6][6] = 'hit';
  grid[7][6] = 'miss';
  return grid;
})();

const opponents = [
  {
    id: 'o1',
    name: 'Admiral Flux',
    shipsRemaining: 3,
    cells: (() => {
      const grid = createGrid();
      grid[3][3] = 'hit';
      grid[4][4] = 'miss';
      return grid;
    })(),
  },
  {
    id: 'o2',
    name: 'Commander Lyra',
    shipsRemaining: 2,
    isEliminated: false,
    cells: (() => {
      const grid = createGrid();
      grid[1][8] = 'miss';
      return grid;
    })(),
  },
];

export const MyTurn: Story = {
  args: {
    playerBoard,
    opponents,
    selectedOpponentId: 'o1',
    currentTurn: 'You',
    isMyTurn: true,
    gameLog: [
      { id: '1', message: 'You hit D4', type: 'hit', timestamp: '00:12' },
      { id: '2', message: 'Flux misses B7', type: 'miss', timestamp: '00:14' },
      { id: '3', message: 'Your turn begins', type: 'turn', timestamp: '00:15' },
    ],
    myStatus: {
      shipsRemaining: 4,
      hits: 6,
      misses: 3,
    },
  },
};

export const OpponentTurn: Story = {
  args: {
    playerBoard,
    opponents,
    selectedOpponentId: 'o2',
    currentTurn: 'Admiral Flux',
    isMyTurn: false,
    gameLog: [
      { id: '1', message: 'Flux is aiming...', type: 'turn', timestamp: '00:20' },
    ],
    myStatus: {
      shipsRemaining: 2,
      hits: 7,
      misses: 5,
    },
  },
};
