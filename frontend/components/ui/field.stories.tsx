import type { Meta, StoryObj } from '@storybook/nextjs';
import { Field } from './field';
import { Input, Textarea } from '@chakra-ui/react';

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Field label text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text shown below the input',
    },
    errorText: {
      control: 'text',
      description: 'Error text shown when field has validation error',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the field has validation error',
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic field with label and input
export const Basic: Story = {
  args: {
    label: 'Email Address',
    children: <Input type="email" placeholder="Enter your email" />,
  },
};

// Field with helper text
export const WithHelperText: Story = {
  args: {
    label: 'Username',
    helperText: 'Choose a unique username for your account',
    children: <Input placeholder="username123" />,
  },
};

// Field with error state
export const WithError: Story = {
  args: {
    label: 'Password',
    errorText: 'Password must be at least 8 characters long',
    invalid: true,
    children: <Input type="password" placeholder="Enter password" />,
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Full Name',
    required: true,
    children: <Input placeholder="John Doe" />,
  },
};

// Optional field with indicator
export const Optional: Story = {
  args: {
    label: 'Middle Name',
    optionalText: '(optional)',
    children: <Input placeholder="Optional middle name" />,
  },
};

// Disabled field
export const Disabled: Story = {
  args: {
    label: 'Account ID',
    disabled: true,
    children: <Input value="ACCT-12345" disabled />,
  },
};

// Field with long helper text
export const LongHelperText: Story = {
  args: {
    label: 'API Key',
    helperText:
      'Your API key is used to authenticate requests to our service. Keep it secure and never share it publicly.',
    children: <Input type="password" placeholder="Enter API key" />,
  },
};

// Field with multiple validation errors
export const MultipleErrors: Story = {
  args: {
    label: 'Confirmation Code',
    errorText: 'Invalid code format. Must be 6 digits.',
    invalid: true,
    helperText: 'Enter the 6-digit code sent to your email',
    children: <Input placeholder="123456" maxLength={6} />,
  },
};

// Text area field
export const TextArea: Story = {
  args: {
    label: 'Description',
    helperText: 'Provide a detailed description',
    children: <Textarea rows={4} placeholder="Enter description..." />,
  },
};

// Field with custom label
export const CustomLabel: Story = {
  args: {
    label: (
      <span>
        Email <span style={{ color: 'red' }}>*</span>
      </span>
    ),
    helperText: 'We will never share your email with anyone',
    children: <Input type="email" placeholder="your.email@example.com" />,
  },
};
