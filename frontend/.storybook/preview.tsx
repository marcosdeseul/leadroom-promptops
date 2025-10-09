import type { Preview } from '@storybook/nextjs';
import React from 'react';
import { Provider } from '../components/ui/provider';
import { ColorModeProvider } from '../components/ui/color-mode';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      context: 'body',
      config: {
        rules: [
          {
            // Disable autocomplete rule for demo purposes
            id: 'autocomplete-valid',
            enabled: false,
          },
        ],
      },
      options: {},
    },
  },
  decorators: [
    (Story) => (
      <ColorModeProvider>
        <Provider>
          <Story />
        </Provider>
      </ColorModeProvider>
    ),
  ],
};

export default preview;
