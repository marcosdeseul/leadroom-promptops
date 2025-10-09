'use client';

import { Card, Heading, Stack, Text } from '@chakra-ui/react';

export default function DashboardPage() {
  return (
    <Stack gap={6}>
      <Heading size="xl">Welcome to PromptOps</Heading>
      <Text color="text.muted">Multi-tenant LLM Prompt Optimizer Dashboard</Text>

      <Stack gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Quick Stats</Heading>
          </Card.Header>
          <Card.Body>
            <Text>Dashboard stats will be displayed here</Text>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Recent Activity</Heading>
          </Card.Header>
          <Card.Body>
            <Text>Recent activity feed will be shown here</Text>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Stack>
  );
}
