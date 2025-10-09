'use client';

import { Box, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ColorModeButton } from '@/components/ui/color-mode';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Flex minH="100vh" bg="surface.base">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="surface.elevated"
        borderRight="1px"
        borderColor="border.default"
        p={6}
      >
        <Stack gap={8}>
          <Heading size="md" color="brand.primary">
            PromptOps
          </Heading>

          <Stack gap={2}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Box
                    px={4}
                    py={2}
                    borderRadius="md"
                    bg={isActive ? 'brand.primary' : 'transparent'}
                    color={isActive ? 'surface.elevated' : 'text.primary'}
                    _hover={{
                      bg: isActive ? 'brand.primary' : 'surface.base',
                    }}
                    cursor="pointer"
                  >
                    <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                      {item.label}
                    </Text>
                  </Box>
                </Link>
              );
            })}
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Flex flex={1} direction="column">
        {/* Header */}
        <Flex
          h="60px"
          px={6}
          align="center"
          justify="space-between"
          borderBottom="1px"
          borderColor="border.default"
          bg="surface.elevated"
        >
          <Heading size="sm">Dashboard</Heading>
          <ColorModeButton />
        </Flex>

        {/* Content Area */}
        <Box flex={1} p={6}>
          <Container maxW="container.xl">
            {children}
          </Container>
        </Box>
      </Flex>
    </Flex>
  );
}
