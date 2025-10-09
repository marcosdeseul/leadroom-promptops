'use client';

import React from 'react';
import { Box, Button, Card, Heading, Stack, Text } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
          <Card.Root maxW="500px">
            <Card.Header>
              <Heading size="lg" color="feedback.negative">
                Something went wrong
              </Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                <Text color="text.muted">
                  We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
                </Text>
                {this.state.error && (
                  <Box
                    p={4}
                    bg="surface.base"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor="feedback.negative"
                  >
                    <Text fontSize="sm" fontFamily="mono" color="text.muted">
                      {this.state.error.message}
                    </Text>
                  </Box>
                )}
              </Stack>
            </Card.Body>
            <Card.Footer>
              <Button
                onClick={() => window.location.reload()}
                colorPalette="blue"
                w="full"
              >
                Refresh Page
              </Button>
            </Card.Footer>
          </Card.Root>
        </Box>
      );
    }

    return this.props.children;
  }
}
