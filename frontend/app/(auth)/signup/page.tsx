'use client';

import { Box, Card, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <Box w="full">
      <Card.Root>
        <Card.Header>
          <Heading size="lg">Sign Up</Heading>
          <Text color="text.muted">Create a new account</Text>
        </Card.Header>
        <Card.Body>
          <Text>Signup form will be implemented here with RHF + Zod</Text>
        </Card.Body>
        <Card.Footer>
          <Text fontSize="sm" color="text.muted">
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--chakra-colors-brand-primary)' }}>
              Login
            </Link>
          </Text>
        </Card.Footer>
      </Card.Root>
    </Box>
  );
}
