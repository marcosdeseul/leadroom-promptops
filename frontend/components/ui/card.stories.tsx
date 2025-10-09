import type { Meta, StoryObj } from '@storybook/react';
import { Card, Heading, Text, Button } from '@chakra-ui/react';

const meta = {
  title: 'UI/Card',
  component: Card.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card with header, body, and footer
export const Basic: Story = {
  render: () => (
    <Card.Root width="400px">
      <Card.Header>
        <Heading size="md">Card Title</Heading>
      </Card.Header>
      <Card.Body>
        <Text>
          This is the card body. It can contain any content you want to display.
        </Text>
      </Card.Body>
      <Card.Footer>
        <Button>Action</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

// Card with only body
export const BodyOnly: Story = {
  render: () => (
    <Card.Root width="400px">
      <Card.Body>
        <Text>Simple card with just body content, no header or footer.</Text>
      </Card.Body>
    </Card.Root>
  ),
};

// Card with description
export const WithDescription: Story = {
  render: () => (
    <Card.Root width="400px">
      <Card.Header>
        <Heading size="md">Project Overview</Heading>
        <Text color="text.muted" fontSize="sm">
          View and manage your project details
        </Text>
      </Card.Header>
      <Card.Body>
        <Text>
          Your project is currently active with 5 team members and 12 tasks in
          progress.
        </Text>
      </Card.Body>
    </Card.Root>
  ),
};

// Interactive card (clickable)
export const Interactive: Story = {
  render: () => (
    <Card.Root
      width="400px"
      cursor="pointer"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Card.Body>
        <Heading size="sm" mb={2}>
          Click Me
        </Heading>
        <Text color="text.muted">
          This card is interactive and responds to hover
        </Text>
      </Card.Body>
    </Card.Root>
  ),
};

// Card with multiple actions
export const MultipleActions: Story = {
  render: () => (
    <Card.Root width="400px">
      <Card.Header>
        <Heading size="md">User Profile</Heading>
      </Card.Header>
      <Card.Body>
        <Text mb={2}>
          <strong>Email:</strong> user@example.com
        </Text>
        <Text>
          <strong>Role:</strong> Administrator
        </Text>
      </Card.Body>
      <Card.Footer gap={2}>
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

// Card with elevated surface
export const Elevated: Story = {
  render: () => (
    <Card.Root width="400px" boxShadow="xl">
      <Card.Header>
        <Heading size="md">Elevated Card</Heading>
      </Card.Header>
      <Card.Body>
        <Text>This card has an elevated appearance with a larger shadow.</Text>
      </Card.Body>
    </Card.Root>
  ),
};

// Compact card
export const Compact: Story = {
  render: () => (
    <Card.Root width="300px" p={3}>
      <Heading size="sm" mb={2}>
        Notification
      </Heading>
      <Text fontSize="sm" color="text.muted">
        You have 3 new messages
      </Text>
    </Card.Root>
  ),
};

// Card with image
export const WithImage: Story = {
  render: () => (
    <Card.Root width="400px" overflow="hidden">
      <div
        style={{
          height: '200px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />
      <Card.Body>
        <Heading size="md" mb={2}>
          Beautiful Gradient
        </Heading>
        <Text color="text.muted">
          Cards can include images or other visual elements
        </Text>
      </Card.Body>
    </Card.Root>
  ),
};
