import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RetroModal } from './RetroModal';
import { RetroButton } from './RetroButton';

const meta: Meta<typeof RetroModal> = {
  component: RetroModal,
  title: 'Retro UI/RetroModal',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-[#1a1a1a] p-8 min-h-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RetroModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Game Paused',
    children: (
      <div className="space-y-4">
        <p>Your game has been paused.</p>
        <div className="flex gap-4">
          <RetroButton variant="primary">Resume</RetroButton>
          <RetroButton variant="danger">Quit</RetroButton>
        </div>
      </div>
    ),
    onClose: () => {},
  },
};

export const WithoutTitle: Story = {
  args: {
    isOpen: true,
    children: (
      <div className="text-center space-y-4">
        <p className="text-xl">Are you sure you want to quit?</p>
        <div className="flex gap-4 justify-center">
          <RetroButton variant="secondary">Cancel</RetroButton>
          <RetroButton variant="danger">Quit</RetroButton>
        </div>
      </div>
    ),
    onClose: () => {},
  },
};

const InteractiveDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <RetroButton onClick={() => setIsOpen(true)}>Open Modal</RetroButton>
      <RetroModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Interactive Modal"
      >
        <p className="mb-4">Click outside or the X to close this modal.</p>
        <RetroButton onClick={() => setIsOpen(false)}>Close</RetroButton>
      </RetroModal>
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
