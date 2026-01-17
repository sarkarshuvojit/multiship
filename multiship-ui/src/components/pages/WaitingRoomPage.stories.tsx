import type { Meta, StoryObj } from '@storybook/react';
import { WaitingRoomPage } from './WaitingRoomPage';

const meta: Meta<typeof WaitingRoomPage> = {
  component: WaitingRoomPage,
  title: 'Pages/WaitingRoomPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof WaitingRoomPage>;

const players = [
  { id: 'p1', name: 'Captain Nova', isReady: true, isHost: true },
  { id: 'p2', name: 'Admiral Flux', isReady: false },
  { id: 'p3', name: 'Commander Lyra', isReady: true },
];

export const Empty: Story = {
  args: {
    roomCode: 'X1-77',
    players: [],
    maxPlayers: 3,
    isHost: true,
  },
};

export const PlayersJoining: Story = {
  args: {
    roomCode: 'X1-77',
    players,
    maxPlayers: 3,
    isHost: true,
  },
};

export const NotHost: Story = {
  args: {
    roomCode: 'X1-77',
    players,
    maxPlayers: 3,
    isHost: false,
  },
};
