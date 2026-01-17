import type { Meta, StoryObj } from '@storybook/react';
import { RetroTurnIndicator } from './RetroTurnIndicator';

const meta: Meta<typeof RetroTurnIndicator> = {
  component: RetroTurnIndicator,
  title: 'Layout/RetroTurnIndicator',
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

type Story = StoryObj<typeof RetroTurnIndicator>;

export const MyTurn: Story = {
  args: {
    currentPlayer: 'You',
    isMyTurn: true,
    timeRemaining: '00:18',
  },
};

export const OpponentTurn: Story = {
  args: {
    currentPlayer: 'Admiral Flux',
    isMyTurn: false,
    timeRemaining: '00:32',
  },
};
