import type { Meta, StoryObj } from '@storybook/react';
import { GameOverPage } from './GameOverPage';

const meta: Meta<typeof GameOverPage> = {
  component: GameOverPage,
  title: 'Pages/GameOverPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GameOverPage>;

export const Victory: Story = {
  args: {
    isWinner: true,
    winnerName: 'Captain Nova',
    stats: {
      hits: 12,
      misses: 3,
      shipsSunk: 4,
    },
  },
};

export const Defeat: Story = {
  args: {
    isWinner: false,
    winnerName: 'Admiral Flux',
    stats: {
      hits: 6,
      misses: 7,
      shipsSunk: 2,
    },
  },
};
