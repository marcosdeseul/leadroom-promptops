import type { Meta, StoryObj } from '@storybook/nextjs';
import { Alert } from './alert';
import { Button } from './button';
import { CloseButton } from '@chakra-ui/react';
import {
  LuInfo,
  LuCircleCheck,
  LuTriangleAlert,
  LuCircleX,
} from 'react-icons/lu';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Alert status type',
    },
    title: {
      control: 'text',
      description: 'Alert title',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Info alert
export const Info: Story = {
  args: {
    status: 'info',
    title: 'Information',
    children: 'This is an informational message to keep you updated.',
    icon: <LuInfo />,
  },
};

// Success alert
export const Success: Story = {
  args: {
    status: 'success',
    title: 'Success!',
    children: 'Your changes have been saved successfully.',
    icon: <LuCircleCheck />,
  },
};

// Warning alert
export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'Warning',
    children: 'Please review your input before proceeding.',
    icon: <LuTriangleAlert />,
  },
};

// Error alert
export const Error: Story = {
  args: {
    status: 'error',
    title: 'Error',
    children: 'An error occurred while processing your request.',
    icon: <LuCircleX />,
  },
};

// Alert with close button
export const WithCloseButton: Story = {
  render: () => (
    <Alert
      status="info"
      title="Dismissible Alert"
      icon={<LuInfo />}
      endElement={<CloseButton />}
    >
      You can close this alert using the close button.
    </Alert>
  ),
};

// Alert with action button
export const WithAction: Story = {
  render: () => (
    <Alert
      status="warning"
      title="Update Available"
      icon={<LuTriangleAlert />}
      endElement={
        <Button size="sm" variant="outline">
          Update Now
        </Button>
      }
    >
      A new version of the application is available.
    </Alert>
  ),
};

// Title only (no description)
export const TitleOnly: Story = {
  args: {
    status: 'success',
    title: 'Operation completed successfully',
    icon: <LuCircleCheck />,
  },
};

// Long description
export const LongDescription: Story = {
  args: {
    status: 'warning',
    title: 'Account Verification Required',
    icon: <LuTriangleAlert />,
    children:
      'Your account has not been verified yet. Please check your email for a verification link. If you did not receive the email, you can request a new one from your account settings. Verification is required to access all features.',
  },
};

// Multiple alerts
export const MultipleAlerts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Alert status="info" title="New message" icon={<LuInfo />}>
        You have 3 unread messages
      </Alert>
      <Alert status="success" title="Payment successful" icon={<LuCircleCheck />}>
        Your payment of $99.99 was processed
      </Alert>
      <Alert status="warning" title="Storage limit" icon={<LuTriangleAlert />}>
        You are using 90% of your storage quota
      </Alert>
      <Alert status="error" title="Connection failed" icon={<LuCircleX />}>
        Unable to connect to the server
      </Alert>
    </div>
  ),
};

// Subtle variant
export const Subtle: Story = {
  render: () => (
    <Alert
      status="info"
      title="Tip"
      icon={<LuInfo />}
      variant="subtle"
    >
      Use keyboard shortcuts to work faster
    </Alert>
  ),
};

// Solid variant
export const Solid: Story = {
  render: () => (
    <Alert
      status="success"
      title="Completed"
      icon={<LuCircleCheck />}
      variant="solid"
    >
      All tasks have been completed
    </Alert>
  ),
};
