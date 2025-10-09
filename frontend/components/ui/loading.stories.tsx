import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from './loading';
import { Spinner, Skeleton, SkeletonText, Stack, Box } from '@chakra-ui/react';

const meta = {
  title: 'UI/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default loading spinner
export const DefaultSpinner: Story = {
  args: {
    message: 'Loading...',
  },
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="xs" />
        <div>XS</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="sm" />
        <div>SM</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" />
        <div>MD</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="lg" />
        <div>LG</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="xl" />
        <div>XL</div>
      </div>
    </div>
  ),
};

// Spinner with custom color
export const ColoredSpinner: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Spinner color="brand.primary" size="lg" />
      <Spinner color="feedback.positive" size="lg" />
      <Spinner color="feedback.negative" size="lg" />
    </div>
  ),
};

// Skeleton loader for text
export const SkeletonTextLoader: Story = {
  render: () => (
    <Box width="400px">
      <SkeletonText noOfLines={4} gap={4} />
    </Box>
  ),
};

// Skeleton for single line
export const SingleLineSkeleton: Story = {
  render: () => (
    <Box width="300px">
      <Skeleton height="20px" />
    </Box>
  ),
};

// Skeleton for card layout
export const CardSkeleton: Story = {
  render: () => (
    <Box width="400px" p={4} borderWidth="1px" borderRadius="md">
      <Stack gap={4}>
        <Skeleton height="150px" />
        <SkeletonText noOfLines={3} gap={3} />
        <Skeleton height="40px" width="120px" />
      </Stack>
    </Box>
  ),
};

// Skeleton for list items
export const ListSkeleton: Story = {
  render: () => (
    <Box width="400px">
      <Stack gap={3}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} p={3} borderWidth="1px" borderRadius="md">
            <Stack direction="row" gap={3} align="center">
              <Skeleton boxSize="40px" borderRadius="full" />
              <Stack flex={1} gap={2}>
                <Skeleton height="16px" width="60%" />
                <Skeleton height="12px" width="40%" />
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  ),
};

// Full page loading
export const FullPageLoading: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        gap: '1rem',
      }}
    >
      <Spinner size="xl" color="brand.primary" />
      <div style={{ fontSize: '18px', color: 'var(--chakra-colors-text-muted)' }}>
        Loading...
      </div>
    </div>
  ),
};

// Inline loading
export const InlineLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Spinner size="sm" />
      <span>Processing your request...</span>
    </div>
  ),
};
