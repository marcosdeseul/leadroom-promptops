'use client';

import { Box, Card, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoginForm } from '@/components/forms/LoginForm';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth';
import type { LoginInput } from '@/lib/validators/auth';
import { toaster } from '@/components/ui/toaster';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      setAuth(response.user, response.token);
      toaster.create({
        title: 'Login successful',
        type: 'success',
      });
      router.push('/dashboard');
    } catch (error) {
      toaster.create({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="full">
      <Card.Root>
        <Card.Header>
          <Heading size="lg">Login</Heading>
          <Text color="text.muted">Sign in to your account</Text>
        </Card.Header>
        <Card.Body>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </Card.Body>
        <Card.Footer>
          <Text fontSize="sm" color="text.muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--chakra-colors-brand-primary)' }}>
              Sign up
            </Link>
          </Text>
        </Card.Footer>
      </Card.Root>
    </Box>
  );
}
