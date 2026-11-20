import type { Meta, StoryObj } from '@storybook/react';
import { RetroLayout } from './RetroLayout';
import { RetroHeader } from './RetroHeader';

const meta: Meta<typeof RetroLayout> = {
  component: RetroLayout,
  title: 'Layout/RetroLayout',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RetroLayout>;

export const Default: Story = {
  args: {
    header: <RetroHeader playerName="Nova" roomCode="B-19" />,
    children: (
      <div className="border-4 border-[#444] bg-[#111] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold uppercase text-[#39FF14] mb-2">Deck Overview</h2>
        <p className="text-gray-300">Retro layout framing example content.</p>
      </div>
    ),
  },
};

export const NoFooter: Story = {
  args: {
    showFooter: false,
    children: (
      <div className="border-4 border-[#00FFFF] bg-[#0f0f0f] p-6 shadow-[6px_6px_0px_0px_rgba(0,255,255,1)]">
        <p className="text-white">Footer hidden for cinematic screens.</p>
      </div>
    ),
  },
};
