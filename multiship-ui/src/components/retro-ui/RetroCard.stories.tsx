import type { Meta, StoryObj } from '@storybook/react';
import { RetroCard } from './RetroCard';

const meta: Meta<typeof RetroCard> = {
  component: RetroCard,
  title: 'Retro UI/RetroCard',
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
type Story = StoryObj<typeof RetroCard>;

export const Default: Story = {
  args: {
    title: 'Game Stats',
    children: (
      <div className="space-y-2">
        <p>Ships Remaining: 5</p>
        <p>Hits: 12</p>
        <p>Misses: 8</p>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    children: (
      <p>This is a card without a title. Perfect for simple content blocks.</p>
    ),
  },
};

export const Highlight: Story = {
  args: {
    title: 'Your Turn!',
    variant: 'highlight',
    children: <p>Select a cell on your opponent's grid to attack.</p>,
  },
};

export const Danger: Story = {
  args: {
    title: 'Warning!',
    variant: 'danger',
    children: <p>Your battleship has been hit!</p>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <RetroCard title="Default" variant="default">
        <p>Default card style</p>
      </RetroCard>
      <RetroCard title="Highlight" variant="highlight">
        <p>Highlighted card</p>
      </RetroCard>
      <RetroCard title="Danger" variant="danger">
        <p>Danger card</p>
      </RetroCard>
    </div>
  ),
};
