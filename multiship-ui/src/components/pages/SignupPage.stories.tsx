import type { Meta, StoryObj } from '@storybook/react';
import { SignupPage } from './SignupPage';

const meta: Meta<typeof SignupPage> = {
  component: SignupPage,
  title: 'Pages/SignupPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SignupPage>;

const avatars = [
  { id: 'a1', label: 'Nova' },
  { id: 'a2', label: 'Flux' },
  { id: 'a3', label: 'Vega' },
  { id: 'a4', label: 'Rex' },
  { id: 'a5', label: 'Zed' },
  { id: 'a6', label: 'Ivy' },
];

export const Default: Story = {
  args: {
    avatars,
    selectedAvatarId: 'a2',
    username: 'Captain Flux',
    liveUsers: 12,
  },
};

export const Loading: Story = {
  args: {
    avatars,
    selectedAvatarId: 'a4',
    username: 'Commander Zed',
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    avatars,
    username: '',
    error: 'Call sign required',
  },
};
