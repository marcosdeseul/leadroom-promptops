import { Box, Heading, Text, Stack } from '@chakra-ui/react';
import * as React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactElement;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(props, ref) {
    const { icon, title, description, action } = props;

    return (
      <Box
        ref={ref}
        textAlign="center"
        py={10}
        px={6}
        role="status"
        aria-live="polite"
      >
        <Stack gap={4} align="center">
          {icon && (
            <Box fontSize="6xl" color="text.muted" aria-hidden="true">
              {icon}
            </Box>
          )}
          <Heading size="md" color="text.primary">
            {title}
          </Heading>
          {description && (
            <Text color="text.muted" maxW="md">
              {description}
            </Text>
          )}
          {action && <Box mt={2}>{action}</Box>}
        </Stack>
      </Box>
    );
  }
);
