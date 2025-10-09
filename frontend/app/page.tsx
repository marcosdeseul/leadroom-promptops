'use client';

import { Button, Container, Heading, Text, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxW="container.md" py={20}>
      <Stack gap={8} align="center">
        <Heading size="2xl" color="brand.primary">
          Leadroom PromptOps
        </Heading>
        <Text fontSize="xl" color="text.muted" textAlign="center">
          Multi-tenant LLM Prompt Optimizer that evolves LLM prompts from user feedback
        </Text>
        <Stack gap={4}>
          <Button colorPalette="blue" size="lg" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
            Login
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
