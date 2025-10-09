import { Spinner, Stack, Text } from '@chakra-ui/react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <Stack gap={4} align="center" justify="center" py={20}>
      <Spinner size="xl" color="brand.primary" />
      <Text color="text.muted">{message}</Text>
    </Stack>
  );
}
