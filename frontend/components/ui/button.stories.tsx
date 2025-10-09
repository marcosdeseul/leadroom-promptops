import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './button';
import { LuSearch, LuTrash2, LuPlus } from 'react-icons/lu';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'subtle'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    colorPalette: {
      control: 'select',
      options: ['blue', 'red', 'green', 'purple', 'gray'],
      description: 'Color palette for the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button with solid variant
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'solid',
    colorPalette: 'blue',
  },
};

// Secondary button with outline variant
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'outline',
    colorPalette: 'blue',
  },
};

// Ghost button variant
export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

// Subtle button variant
export const Subtle: Story = {
  args: {
    children: 'Subtle Button',
    variant: 'subtle',
  },
};

// All size variants
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

// Button with left icon
export const WithLeftIcon: Story = {
  render: () => (
    <Button>
      <LuPlus />
      Add Item
    </Button>
  ),
};

// Button with right icon
export const WithRightIcon: Story = {
  render: () => (
    <Button>
      Search
      <LuSearch />
    </Button>
  ),
};

// Icon-only button
export const IconOnly: Story = {
  render: () => (
    <Button variant="ghost">
      <LuTrash2 />
    </Button>
  ),
};

// Destructive button
export const Destructive: Story = {
  args: {
    children: 'Delete',
    colorPalette: 'red',
  },
};

// Success button
export const Success: Story = {
  args: {
    children: 'Confirm',
    colorPalette: 'green',
  },
};

// Full width button
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    width: 'full',
  },
};

// Playground for interactive testing
export const Playground: Story = {
  args: {
    children: 'Playground Button',
    variant: 'solid',
    size: 'md',
    colorPalette: 'blue',
  },
};
