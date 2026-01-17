import type { Meta, StoryObj } from '@storybook/react';
import { RetroHeader } from './RetroHeader';

const meta: Meta<typeof RetroHeader> = {
  component: RetroHeader,
  title: 'Layout/RetroHeader',
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

type Story = StoryObj<typeof RetroHeader>;

export const Default: Story = {
  args: {
    playerName: 'Commander Lyra',
    roomCode: 'QX-72',
  },
};

export const NoLeave: Story = {
  args: {
    playerName: 'Observer',
    roomCode: 'S9-01',
    showLeave: false,
  },
};
