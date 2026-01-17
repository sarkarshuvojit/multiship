import type { Meta, StoryObj } from '@storybook/react';
import { RetroShipPiece } from './RetroShipPiece';

const meta: Meta<typeof RetroShipPiece> = {
  component: RetroShipPiece,
  title: 'Game/RetroShipPiece',
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
type Story = StoryObj<typeof RetroShipPiece>;

export const Battleship: Story = {
  args: {
    length: 4,
  },
};

export const Cruiser: Story = {
  args: {
    length: 3,
  },
};

export const Destroyer: Story = {
  args: {
    length: 2,
  },
};

export const Submarine: Story = {
  args: {
    length: 1,
  },
};

export const Selected: Story = {
  args: {
    length: 3,
    isSelected: true,
  },
};

export const Placed: Story = {
  args: {
    length: 3,
    isPlaced: true,
  },
};

export const Vertical: Story = {
  args: {
    length: 3,
    orientation: 'vertical',
    isSelected: true,
  },
};

export const AllShips: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RetroShipPiece length={4} />
      <RetroShipPiece length={3} />
      <RetroShipPiece length={3} isSelected />
      <RetroShipPiece length={2} />
      <RetroShipPiece length={2} isPlaced />
      <RetroShipPiece length={2} />
      <RetroShipPiece length={1} />
      <RetroShipPiece length={1} />
      <RetroShipPiece length={1} />
      <RetroShipPiece length={1} />
    </div>
  ),
};

export const ShipInventory: Story = {
  render: () => (
    <div className="border-4 border-gray-600 p-4 bg-[#2d2d2d]">
      <h3 className="text-[#39FF14] font-bold uppercase mb-4">Your Fleet</h3>
      <div className="flex flex-col gap-2">
        <RetroShipPiece length={4} isPlaced />
        <RetroShipPiece length={3} isPlaced />
        <RetroShipPiece length={3} isSelected />
        <RetroShipPiece length={2} />
        <RetroShipPiece length={2} />
        <RetroShipPiece length={2} />
        <RetroShipPiece length={1} />
        <RetroShipPiece length={1} />
        <RetroShipPiece length={1} />
        <RetroShipPiece length={1} />
      </div>
    </div>
  ),
};
