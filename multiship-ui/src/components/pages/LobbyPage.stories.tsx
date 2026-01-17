import type { Meta, StoryObj } from '@storybook/react';
import { LobbyPage } from './LobbyPage';

const meta: Meta<typeof LobbyPage> = {
  component: LobbyPage,
  title: 'Pages/LobbyPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LobbyPage>;

export const Default: Story = {
  args: {
    roomCode: 'BATTLE9',
  },
};

export const ErrorState: Story = {
  args: {
    roomCode: 'INVALID',
    error: 'Room not found',
  },
};
