import type { Meta, StoryObj } from '@storybook/react';
import { RetroAvatar } from './RetroAvatar';

const meta: Meta<typeof RetroAvatar> = {
  component: RetroAvatar,
  title: 'Retro UI/RetroAvatar',
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
type Story = StoryObj<typeof RetroAvatar>;

export const Default: Story = {
  args: {
    alt: 'Player',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=battleship',
    alt: 'Captain',
  },
};

export const Selected: Story = {
  args: {
    alt: 'Player',
    selected: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <RetroAvatar size="sm" alt="S" />
      <RetroAvatar size="md" alt="M" />
      <RetroAvatar size="lg" alt="L" />
    </div>
  ),
};

export const AvatarGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {['Captain', 'Admiral', 'Commander', 'Lieutenant'].map((name, i) => (
        <RetroAvatar
          key={name}
          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`}
          alt={name}
          selected={i === 0}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
};

export const Clickable: Story = {
  args: {
    alt: 'Click Me',
    onClick: () => alert('Avatar clicked!'),
  },
};
