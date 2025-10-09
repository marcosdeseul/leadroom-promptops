import { Box, Container, Stack } from '@chakra-ui/react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="surface.base">
      <Container maxW="container.sm" py={20}>
        <Stack gap={8} align="center">
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
