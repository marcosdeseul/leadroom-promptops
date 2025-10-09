import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';
import { Button } from './button';
import {
  LuInbox,
  LuSearch,
  LuFileText,
  LuCircleAlert,
  LuFolder,
  LuPlus,
} from 'react-icons/lu';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'Icon element to display',
    },
    title: {
      control: 'text',
      description: 'Empty state title',
    },
    description: {
      control: 'text',
      description: 'Empty state description',
    },
    action: {
      description: 'Action button or element',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// No data available
export const NoData: Story = {
  args: {
    icon: <LuInbox />,
    title: 'No data available',
    description: 'There is currently no data to display. Check back later.',
  },
};

// No search results
export const NoSearchResults: Story = {
  args: {
    icon: <LuSearch />,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria to find what you are looking for.',
  },
};

// Empty folder
export const EmptyFolder: Story = {
  args: {
    icon: <LuFolder />,
    title: 'This folder is empty',
    description: 'Add files to this folder to get started.',
    action: (
      <Button>
        <LuPlus />
        Add Files
      </Button>
    ),
  },
};

// No documents
export const NoDocuments: Story = {
  args: {
    icon: <LuFileText />,
    title: 'No documents yet',
    description: 'Create your first document to begin working on your project.',
    action: (
      <Button colorPalette="blue">
        <LuPlus />
        Create Document
      </Button>
    ),
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    icon: <LuCircleAlert />,
    title: 'Something went wrong',
    description: 'We encountered an error loading your data. Please try again.',
    action: (
      <Button variant="outline">Try Again</Button>
    ),
  },
};

// With multiple actions
export const MultipleActions: Story = {
  args: {
    icon: <LuInbox />,
    title: 'Get started',
    description: 'Welcome! Choose an option below to begin.',
    action: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="outline">Learn More</Button>
        <Button>Get Started</Button>
      </div>
    ),
  },
};

// Minimal (no icon, no action)
export const Minimal: Story = {
  args: {
    title: 'Nothing here',
    description: 'This list is currently empty.',
  },
};

// Title only
export const TitleOnly: Story = {
  args: {
    title: 'No items found',
  },
};

// With action, no description
export const WithActionNoDescription: Story = {
  args: {
    icon: <LuPlus />,
    title: 'Add your first item',
    action: <Button>Add Item</Button>,
  },
};

// Large empty state
export const Large: Story = {
  args: {
    icon: <LuInbox />,
    title: "Your inbox is empty",
    description: "You have no new messages. When you receive messages, they will appear here. Take a break and enjoy your clear inbox!",
    action: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Button variant="outline">View Archive</Button>
        <Button>Compose Message</Button>
      </div>
    ),
  },
};
