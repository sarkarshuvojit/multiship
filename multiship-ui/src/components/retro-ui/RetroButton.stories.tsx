import type { Meta, StoryObj } from '@storybook/react';
import { RetroButton } from './RetroButton';

const meta: Meta<typeof RetroButton> = {
  component: RetroButton,
  title: 'Retro UI/RetroButton',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#1a1a1a] p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RetroButton>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <RetroButton variant="primary">Primary</RetroButton>
      <RetroButton variant="secondary">Secondary</RetroButton>
      <RetroButton variant="danger">Danger</RetroButton>
      <RetroButton variant="ghost">Ghost</RetroButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <RetroButton size="sm">Small</RetroButton>
      <RetroButton size="md">Medium</RetroButton>
      <RetroButton size="lg">Large</RetroButton>
    </div>
  ),
};
