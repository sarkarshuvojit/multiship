import type { Meta, StoryObj } from '@storybook/react';
import { RetroGridCell } from './RetroGridCell';

const meta: Meta<typeof RetroGridCell> = {
  component: RetroGridCell,
  title: 'Game/RetroGridCell',
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
type Story = StoryObj<typeof RetroGridCell>;

export const Empty: Story = {
  args: {
    state: 'empty',
    coordinates: { x: 0, y: 0 },
  },
};

export const Ship: Story = {
  args: {
    state: 'ship',
    coordinates: { x: 0, y: 0 },
  },
};

export const Hit: Story = {
  args: {
    state: 'hit',
    coordinates: { x: 0, y: 0 },
  },
};

export const Miss: Story = {
  args: {
    state: 'miss',
    coordinates: { x: 0, y: 0 },
  },
};

export const HiddenShip: Story = {
  args: {
    state: 'ship',
    coordinates: { x: 0, y: 0 },
    showShip: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="text-center">
        <RetroGridCell state="empty" coordinates={{ x: 0, y: 0 }} />
        <p className="text-white text-xs mt-1">Empty</p>
      </div>
      <div className="text-center">
        <RetroGridCell state="ship" coordinates={{ x: 1, y: 0 }} />
        <p className="text-white text-xs mt-1">Ship</p>
      </div>
      <div className="text-center">
        <RetroGridCell state="hit" coordinates={{ x: 2, y: 0 }} />
        <p className="text-white text-xs mt-1">Hit</p>
      </div>
      <div className="text-center">
        <RetroGridCell state="miss" coordinates={{ x: 3, y: 0 }} />
        <p className="text-white text-xs mt-1">Miss</p>
      </div>
    </div>
  ),
};
