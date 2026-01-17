import type { Meta, StoryObj } from '@storybook/react';
import { RetroPlayerCard } from './RetroPlayerCard';

const meta: Meta<typeof RetroPlayerCard> = {
  component: RetroPlayerCard,
  title: 'Layout/RetroPlayerCard',
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

type Story = StoryObj<typeof RetroPlayerCard>;

export const Default: Story = {
  args: {
    name: 'Captain Nova',
    shipsRemaining: 4,
  },
};

export const CurrentTurn: Story = {
  args: {
    name: 'Admiral Flux',
    shipsRemaining: 3,
    isCurrentTurn: true,
  },
};

export const Eliminated: Story = {
  args: {
    name: 'Commander Lyra',
    shipsRemaining: 0,
    isEliminated: true,
  },
};
