# Storybook Component Library

Component library and design system documentation for Leadroom PromptOps.

## Getting Started

### Running Storybook

```bash
# Development mode
npm run storybook

# Build static Storybook
npm run build-storybook
```

Storybook will be available at [http://localhost:5400](http://localhost:5400)

## Project Structure

```
frontend/
├── .storybook/                # Storybook configuration
│   ├── main.ts               # Main configuration
│   ├── preview.tsx           # Global decorators and parameters
│   └── README.md             # This file
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── button.tsx
│   │   ├── button.stories.tsx
│   │   ├── field.tsx
│   │   ├── field.stories.tsx
│   │   └── ...
│   └── forms/                # Form components
│       ├── LoginForm.tsx
│       └── LoginForm.stories.tsx
└── docs/                     # Documentation pages
    ├── accessibility.mdx
    └── theming.mdx
```

## Creating New Stories

### Component Story Template

Create a new `.stories.tsx` file next to your component:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // or 'fullscreen' or 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    propName: {
      control: 'text', // or 'boolean', 'select', etc.
      description: 'Description of this prop',
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    propName: 'default value',
  },
};

export const Variant: Story = {
  args: {
    propName: 'variant value',
  },
};
```

### Story Naming Conventions

- **Title**: Use hierarchical structure: `Category/ComponentName`
  - `UI/Button`
  - `Forms/LoginForm`
  - `Documentation/Accessibility`

- **Story Names**: Use PascalCase and descriptive names
  - `Default`
  - `WithIcon`
  - `LoadingState`
  - `Disabled`

### Component Categories

- **UI**: Base components (Button, Field, Card, Alert, etc.)
- **Forms**: Form-related components (LoginForm, etc.)
- **Documentation**: MDX documentation pages

## Props Documentation

### Using ArgTypes

Define prop controls and documentation in the `argTypes` object:

```tsx
argTypes: {
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
    description: 'Size variant of the component',
    table: {
      defaultValue: { summary: 'md' },
    },
  },
  disabled: {
    control: 'boolean',
    description: 'Whether the component is disabled',
  },
}
```

### Control Types

- `text`: Text input
- `boolean`: Checkbox
- `number`: Number input
- `select`: Dropdown selection
- `radio`: Radio buttons
- `color`: Color picker
- `date`: Date picker
- `object`: JSON editor

## Accessibility Testing

Storybook includes the `@storybook/addon-a11y` addon for accessibility testing.

### Viewing Accessibility Results

1. Open any story in Storybook
2. Click the "Accessibility" tab in the addon panel
3. Review violations, passes, and incomplete tests

### Configuring Accessibility Tests

```tsx
export const AccessibilityExample: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## Theming

### Dark Mode Toggle

Storybook includes a dark mode toggle in the toolbar. Use it to test components in both light and dark modes.

### Using Semantic Tokens

Always use semantic tokens for colors:

```tsx
// ✅ Good
<Box bg="surface.elevated" color="text.primary">

// ❌ Bad
<Box bg="white" color="#333">
```

See `docs/theming.mdx` for complete theming documentation.

## Interactions Testing

Test user interactions using the interactions addon:

```tsx
import { fn } from '@storybook/test';

export const WithInteraction: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

## Best Practices

### 1. Keep Stories Simple

Each story should demonstrate one specific use case or variant.

### 2. Use Realistic Data

Use realistic data in your stories to better represent actual usage.

### 3. Document Props

Always document component props using `argTypes` for better developer experience.

### 4. Test Accessibility

Run accessibility tests on all stories and fix violations before merging.

### 5. Test Dark Mode

Ensure all components work correctly in both light and dark modes.

### 6. Group Related Stories

Use the hierarchical naming structure to group related components.

## Adding Documentation Pages

Create MDX files in the `docs/` directory:

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Documentation/PageTitle" />

# Page Title

Your documentation content here...
```

## Troubleshooting

### Storybook Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Components Not Showing

- Check that story files match the glob pattern in `.storybook/main.ts`
- Ensure stories use the correct `Meta` and `Story` types
- Check for TypeScript errors in the component or story file

### Dark Mode Not Working

- Verify `ColorModeProvider` is in the decorators in `.storybook/preview.tsx`
- Ensure components use semantic tokens instead of hardcoded colors

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Chakra UI v3 Documentation](https://www.chakra-ui.com/docs)
- [Accessibility Documentation](./docs/accessibility.mdx)
- [Theming Documentation](./docs/theming.mdx)
