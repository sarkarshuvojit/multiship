import type { Meta, StoryObj } from '@storybook/react';
import { RetroInput } from './RetroInput';

const meta: Meta<typeof RetroInput> = {
  component: RetroInput,
  title: 'Retro UI/RetroInput',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-[#1a1a1a] p-8 min-w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RetroInput>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your name...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Admiral_Destroyer',
    placeholder: 'Enter your name...',
  },
};

export const WithError: Story = {
  args: {
    value: 'ab',
    placeholder: 'Enter your name...',
    error: 'Name must be at least 3 characters',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Disabled input',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
    value: 'secretpassword',
  },
};
