import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        'brand.primary': {
          value: { base: '{colors.blue.500}', _dark: '{colors.blue.300}' },
        },
        'brand.secondary': {
          value: { base: '{colors.purple.500}', _dark: '{colors.purple.300}' },
        },
        'surface.elevated': {
          value: { base: 'white', _dark: '{colors.gray.800}' },
        },
        'surface.base': {
          value: { base: '{colors.gray.50}', _dark: '{colors.gray.900}' },
        },
        'text.primary': {
          value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' },
        },
        'text.muted': {
          value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
        },
        'border.default': {
          value: { base: '{colors.gray.200}', _dark: '{colors.gray.700}' },
        },
        'feedback.positive': {
          value: { base: '{colors.green.500}', _dark: '{colors.green.300}' },
        },
        'feedback.negative': {
          value: { base: '{colors.red.500}', _dark: '{colors.red.300}' },
        },
      },
    },
    tokens: {
      fonts: {
        heading: { value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` },
        body: { value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` },
      },
    },
  },
}));
