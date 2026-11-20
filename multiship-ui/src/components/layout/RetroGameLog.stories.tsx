import type { Meta, StoryObj } from '@storybook/react';
import { RetroGameLog } from './RetroGameLog';

const meta: Meta<typeof RetroGameLog> = {
  component: RetroGameLog,
  title: 'Layout/RetroGameLog',
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

type Story = StoryObj<typeof RetroGameLog>;

export const Default: Story = {
  args: {
    events: [
      { id: '1', message: 'Lyra hits C7', type: 'hit', timestamp: '00:12' },
      { id: '2', message: 'Flux misses B4', type: 'miss', timestamp: '00:15' },
      { id: '3', message: 'Nova turn begins', type: 'turn', timestamp: '00:20' },
      { id: '4', message: 'Cruiser sunk!', type: 'sunk', timestamp: '00:21' },
      { id: '5', message: 'System sync complete', type: 'system', timestamp: '00:22' },
    ],
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};
