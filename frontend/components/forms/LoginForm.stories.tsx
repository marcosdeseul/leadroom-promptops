import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { LoginForm } from './LoginForm';
import { Box, Card } from '@chakra-ui/react';

const meta = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: 'Form submission handler',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the form is in loading state',
    },
  },
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default login form
export const Default: Story = {
  args: {
    isLoading: false,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

// In a card container
export const InCard: Story = {
  render: (args) => (
    <Card.Root width="400px">
      <Card.Header>
        <Card.Title>Login to your account</Card.Title>
        <Card.Description>Enter your credentials to continue</Card.Description>
      </Card.Header>
      <Card.Body>
        <LoginForm {...args} />
      </Card.Body>
    </Card.Root>
  ),
  args: {
    isLoading: false,
  },
};

// With validation errors (simulated)
export const WithValidationErrors: Story = {
  render: () => {
    return (
      <Box width="400px">
        <LoginForm
          onSubmit={(data) => {
            console.log('Form submitted:', data);
          }}
          isLoading={false}
        />
        <Box mt={4} p={3} bg="surface.elevated" borderRadius="md">
          <strong>Validation behavior:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Email: Must be a valid email address</li>
            <li>Password: Minimum 6 characters required</li>
            <li>Submit empty form to see validation errors</li>
          </ul>
        </Box>
      </Box>
    );
  },
};

// Interactive example with form state logging
export const Interactive: Story = {
  render: () => {
    const handleSubmit = (data: { email: string; password: string }) => {
      console.log('Form submitted with data:', data);
      alert(`Login attempt:\nEmail: ${data.email}\nPassword: ${data.password}`);
    };

    return (
      <Box width="400px">
        <Card.Root>
          <Card.Header>
            <Card.Title>Interactive Form Example</Card.Title>
            <Card.Description>
              Try submitting with valid and invalid data
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <LoginForm onSubmit={handleSubmit} isLoading={false} />
          </Card.Body>
          <Card.Footer>
            <Box fontSize="sm" color="text.muted">
              <strong>Test data:</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                <li>Email: test@example.com</li>
                <li>Password: password123</li>
              </ul>
            </Box>
          </Card.Footer>
        </Card.Root>
      </Box>
    );
  },
};

// Form with pre-filled data (for testing)
export const PreFilled: Story = {
  render: () => {
    // Note: This is a visual representation only
    // In real implementation, you would use defaultValues in useForm
    return (
      <Box width="400px">
        <p style={{ marginBottom: '16px', color: 'var(--chakra-colors-text-muted)' }}>
          This story shows how the form looks with data. In a real implementation,
          use <code>defaultValues</code> in <code>useForm</code> hook.
        </p>
        <LoginForm
          onSubmit={(data) => console.log(data)}
          isLoading={false}
        />
      </Box>
    );
  },
};

// Accessibility testing example
export const AccessibilityTest: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Ensure form has proper labels
            id: 'label',
            enabled: true,
          },
          {
            // Ensure form has proper ARIA attributes
            id: 'aria-required-attr',
            enabled: true,
          },
        ],
      },
    },
  },
  render: () => (
    <Box width="400px">
      <LoginForm
        onSubmit={(data) => console.log(data)}
        isLoading={false}
      />
      <Box mt={4} p={3} bg="surface.elevated" borderRadius="md">
        <strong>Accessibility features:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Proper label associations</li>
          <li>ARIA attributes for error states</li>
          <li>Keyboard navigation support</li>
          <li>Screen reader friendly</li>
        </ul>
      </Box>
    </Box>
  ),
};
