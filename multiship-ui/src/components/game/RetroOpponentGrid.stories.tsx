import type { Meta, StoryObj } from '@storybook/react';
import { RetroOpponentGrid } from './RetroOpponentGrid';
import type { CellState } from './RetroGridCell';

const meta: Meta<typeof RetroOpponentGrid> = {
  component: RetroOpponentGrid,
  title: 'Game/RetroOpponentGrid',
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

type Story = StoryObj<typeof RetroOpponentGrid>;

const createGrid = () =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 'empty' as CellState)
  );

export const Default: Story = {
  args: {
    playerName: 'Captain Nova',
    cells: createGrid(),
  },
};

export const WithHits: Story = {
  args: {
    playerName: 'Admiral Flux',
    cells: (() => {
      const grid = createGrid();
      grid[1][1] = 'hit';
      grid[2][3] = 'miss';
      grid[4][6] = 'hit';
      return grid;
    })(),
    isActive: true,
  },
};

export const Disabled: Story = {
  args: {
    playerName: 'Spectator',
    cells: createGrid(),
    disabled: true,
  },
};
