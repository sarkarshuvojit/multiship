import type { Meta, StoryObj } from '@storybook/react';
import { RetroBadge } from './RetroBadge';

const meta: Meta<typeof RetroBadge> = {
  component: RetroBadge,
  title: 'Retro UI/RetroBadge',
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
type Story = StoryObj<typeof RetroBadge>;

export const Success: Story = {
  args: {
    label: 'Ready',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    label: 'Waiting',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    label: 'Eliminated',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    label: 'Your Turn',
    variant: 'info',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <RetroBadge label="Ready" variant="success" />
      <RetroBadge label="Waiting" variant="warning" />
      <RetroBadge label="Eliminated" variant="error" />
      <RetroBadge label="Your Turn" variant="info" />
    </div>
  ),
};
