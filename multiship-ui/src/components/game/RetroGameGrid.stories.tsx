import type { Meta, StoryObj } from '@storybook/react';
import { RetroGameGrid } from './RetroGameGrid';
import type { CellState } from './RetroGridCell';

const meta: Meta<typeof RetroGameGrid> = {
  component: RetroGameGrid,
  title: 'Game/RetroGameGrid',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-[#1a1a1a] p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RetroGameGrid>;

// Create empty 10x10 grid
const emptyGrid: CellState[][] = Array(10).fill(null).map(() => Array(10).fill('empty'));

// Create grid with some ships
const playerGrid: CellState[][] = Array(10).fill(null).map(() => Array(10).fill('empty'));
// Battleship (length 4)
playerGrid[0][0] = 'ship';
playerGrid[0][1] = 'ship';
playerGrid[0][2] = 'ship';
playerGrid[0][3] = 'ship';
// Cruiser (length 3)
playerGrid[2][5] = 'ship';
playerGrid[3][5] = 'ship';
playerGrid[4][5] = 'ship';

// Create grid with hits and misses
const battleGrid: CellState[][] = Array(10).fill(null).map(() => Array(10).fill('empty'));
battleGrid[0][0] = 'hit';
battleGrid[0][1] = 'hit';
battleGrid[1][0] = 'miss';
battleGrid[1][1] = 'miss';
battleGrid[3][3] = 'hit';
battleGrid[4][4] = 'miss';
battleGrid[5][5] = 'miss';

export const Empty: Story = {
  args: {
    cells: emptyGrid,
    title: 'Empty Grid',
  },
};

export const PlayerBoard: Story = {
  args: {
    cells: playerGrid,
    isPlayerBoard: true,
    title: 'Your Fleet',
    showShips: true,
  },
};

export const OpponentBoard: Story = {
  args: {
    cells: battleGrid,
    isPlayerBoard: false,
    title: 'Enemy Waters',
    showShips: false,
    onCellClick: (x, y) => console.log(`Attack at ${String.fromCharCode(65 + x)}${y + 1}`),
  },
};

export const DisabledGrid: Story = {
  args: {
    cells: battleGrid,
    disabled: true,
    title: 'Waiting...',
  },
};

export const BothBoards: Story = {
  render: () => (
    <div className="flex gap-8 flex-wrap">
      <RetroGameGrid
        cells={playerGrid}
        isPlayerBoard={true}
        title="Your Fleet"
        showShips={true}
      />
      <RetroGameGrid
        cells={battleGrid}
        isPlayerBoard={false}
        title="Enemy Waters"
        showShips={false}
        onCellClick={(x, y) => console.log(`Attack at ${String.fromCharCode(65 + x)}${y + 1}`)}
      />
    </div>
  ),
};
