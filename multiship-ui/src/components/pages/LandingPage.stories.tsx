import type { Meta, StoryObj } from '@storybook/react';
import { LandingPage } from './LandingPage';

const meta: Meta<typeof LandingPage> = {
  component: LandingPage,
  title: 'Pages/LandingPage',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {
  args: {},
};

export const AlternateTagline: Story = {
  args: {
    subtitle: 'Coordinate with allies. Annihilate with precision.',
  },
};
