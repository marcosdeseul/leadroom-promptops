Perfect—let’s lock a clean, Claude-friendly frontend stack you can scale without drowning in boilerplate. I’m optimizing for: minimal code, strong defaults, great DX for LLM agents (Claude Code via MCP), and zero yak-shaving.

# App framework & routing

- Next.js (App Router, Next 15+) as the single front-end app for product UI + blog (MDX). It gives you file-based routing, server components, ISR, Metadata API, and first-class SEO hooks (robots/sitemap/JSON-LD) out of the box. ([Next.js][1])

# UI system (lowest code, highest leverage)

- **Chakra UI v3** (primary UI layer) — fastest way to ship a consistent SaaS UI with a small API surface. V3 uses a new theming system with `createSystem` and `defineConfig` for semantic tokens. Install with `@chakra-ui/react` and `@emotion/react` only. ([chakra-ui.com][2])
- **IMPORTANT**: V3 API changes:
  - Theme: Use `createSystem(defaultConfig, defineConfig({...}))` instead of `extendTheme`
  - Provider: Use snippet-generated `<Provider>` component, not `ChakraProvider`
  - Components: Use Chakra CLI snippets (`npx @chakra-ui/cli snippet add`) for v3-compatible components
  - No `@chakra-ui/next-js` package needed in v3
- LLM/MCP enablement: Install Chakra's MCP server for v3 component patterns. ([Next.js][3])
- Optional "headless escape hatch": If you ever need ultra-custom widgets, pair Chakra with Radix Primitives (accessible, unstyled) or pull specific shadcn/ui components (Radix-based) instead of inventing from scratch. ([Next-Intl][4])

# Forms & validation (tight, type-safe)

- React Hook Form + Zod with the `@hookform/resolvers` Zod resolver. This combo minimizes re-renders, keeps schemas in TS, and gives Claude a single pattern to replicate. ([React Hook Form][5])

# Data/state (don’t overthink it)

- TanStack Query for all server state (fetch/cache/invalidate, SSR hydration). This removes home-rolled fetch glue and gives predictable patterns for Claude to reuse.
- Zustand for small client-only UI state (drawers, filters, wizards). Bear-minimal API, almost no boilerplate. ([TanStack][6])

# Icons & charts

- lucide-react for a consistent icon set Claude can drop anywhere. ([Sentry Docs][7])
- Recharts for dashboards—component-first, React-native, easy for Claude to compose (and it’s what shadcn’s chart wrappers sit on). ([Recharts][8])

# Analytics & product telemetry (marketing ↔ app stitched)

- PostHog (primary): enable cross-subdomain tracking so the user journey flows from the Framer landing to the app subdomain without losing identity; use Groups for tenant-level analytics. ([posthog.com][9])
- GA4 (secondary): set up cross-domain measurement for attribution, especially if marketing and app live on different subdomains or domains. ([Google Help][10])
- Sentry: error + performance traces + session replay for “why did this break and who felt it?”. Next.js SDK has first-class support. ([Sentry Docs][11])

# Internationalization (if you need multi-locale soon)

- next-intl with App Router for localized routes, metadata, and formatting—clean API that Claude can cookie-cut. ([Next-Intl][4])

# Testing (keep it pragmatic)

- Playwright for E2E smoke + happy paths; Jest + React Testing Library for units where it pays. Next has guides for both. ([Next.js][12])

---

## Minimal “Claude-proof” project conventions

### Directory layout (App Router)

```
app/
  (marketing)/            # optional public pages if you ever move them in-app
  dashboard/
  api/                    # route handlers
  layout.tsx
  page.tsx
lib/
  api/                    # fetchers used by TanStack Query
  validators/             # zod schemas
  stores/                 # zustand slices
  analytics/              # posthog/ga loaders
components/
  ui/                     # Chakra wrappers (Button, Card variants)
  forms/                  # RHF-controlled inputs
  charts/                 # Recharts composites
styles/                   # theme tokens, global styles
i18n/                     # next-intl config/messages (if used)
```

- API routes live in App Router Route Handlers (no extra server). ([Next.js][13])

### Chakra theming rules

- Define semantic tokens first (`colors.surface`, `colors.border`, `text.muted`, `brand.primary`). Never hardcode hex in components. This enables easy re-skins and dark mode with nearly zero diffs. ([chakra-ui.com][14])
- Pull commonly reused UI into tiny wrappers (`<AppButton/>`, `<FormField/>`, `<EmptyState/>`) so Claude reuses them instead of hand-rolling.
- If design grows, export your tokens to Framer variables to keep brand parity (Framer supports CSS variables in components).

### Data patterns

- Every server call is a fetcher in `lib/api/*`, used by TanStack Query hooks (`useQuery`, `useMutation`). Claude should never `fetch` inside components. ([TanStack][15])
- Use Zod schemas beside each endpoint and in RHF resolvers for type-safe forms. ([Zod][16])

### Observability & analytics

- Load PostHog early and enable cross-subdomain cookies (marketing ➜ app). On login or identify events, call `posthog.identify(userId, props)` and `group('organization', orgId, props)` to unlock tenant analytics. ([posthog.com][9])
- For GA4 attribution across domains/subdomains, configure cross-domain in admin to keep sessions intact. ([Google Help][10])
- Wire Sentry with Next’s instrumentation hooks; keep Replay on for critical funnels. ([Sentry Docs][11])

### SEO plumbing (set-and-forget)

- Use the Metadata API for titles/desc/og tags; implement `app/robots.txt` and `app/sitemap.ts`; add JSON-LD in `layout.tsx` or per page. ([Next.js][1])

---

## Framer ↔ App: the only glue you need

You already use Framer for the landing. Do two things so journeys and attribution survive the hop:

1. Cross-domain/subdomain analytics as above (PostHog + GA4). ([posthog.com][17])
2. UTM carry-over: add a tiny middleware or client util to persist UTMs into a cookie/session on first landing page view; read it on signup/login to hydrate user/org `$set` properties in PostHog. (Mechanics are trivial; no external doc needed.)

---

## MCP + Claude Code checklist (this is what stops “unorganized code”)

- Add Chakra MCP Server to the repo and register it with Claude Code. Provide your theme tokens + component list so the agent composes, not invents. ([Next.js][3])
- Commit `llms.txt` (Chakra) and a short `/rules/agents.md` with patterns (RHF+Zod, Query fetchers, Chakra wrappers). Claude will follow them. ([Sentry][18])
- Optional: include Sentry “AI rules for code editors” to nudge correct instrumentation names (`startSpan`, `captureException`). ([Sentry Docs][11])

---

## One-time setup tasks (90-minute sprint)

1. Next + Chakra scaffold with `@chakra-ui/next-js`, create `theme.ts` with semantic tokens. ([v2.chakra-ui.com][19])
2. Install TanStack Query, Zustand, RHF, Zod; create one example form (`/settings/profile`) using the full pattern. ([TanStack][6])
3. Add Recharts and ship one KPI card + sparkline comp. ([Recharts][8])
4. Wire PostHog (cross-subdomain) + Sentry + GA4 cross-domain. ([posthog.com][9])
5. Add sitemap/robots/JSON-LD via App Router conventions. ([Next.js][20])
6. Drop in Chakra MCP + `llms.txt`; push rules for Claude. ([Next.js][3])
7. Set up Playwright smoke tests for signup→onboarding→dashboard. ([Next.js][12])

---

## Strong POV (why this works for you)

- Chakra over Tailwind-only: You’ll ship faster with fewer lines. Semantic tokens give you design-system leverage without a custom compiler. ([chakra-ui.com][14])
- TanStack Query over bespoke fetch: deletes hundreds of lines of “loading/error/cache” ceremony. ([TanStack][6])
- PostHog + Sentry: one tells you what users do, the other tells you why it broke—both with first-class Next.js support. ([posthog.com][17])

[1]: https://nextjs.org/docs/app?utm_source=chatgpt.com "Next.js Docs: App Router"
[2]: https://www.chakra-ui.com/docs/get-started/frameworks/next-app?utm_source=chatgpt.com "Using Chakra UI in Next.js (App)"
[3]: https://nextjs.org/docs/app/getting-started/images?utm_source=chatgpt.com "Getting Started: Image Optimization"
[4]: https://next-intl.dev/docs/getting-started/app-router?utm_source=chatgpt.com "Next.js App Router internationalization (i18n)"
[5]: https://react-hook-form.com/get-started?utm_source=chatgpt.com "Get Started"
[6]: https://tanstack.com/query/v5/docs/react/overview?utm_source=chatgpt.com "Overview | TanStack Query React Docs"
[7]: https://docs.sentry.io/platforms/javascript/guides/nextjs/?utm_source=chatgpt.com "Sentry for Next.js"
[8]: https://recharts.org/?utm_source=chatgpt.com "Recharts"
[9]: https://posthog.com/docs/libraries/js/config?utm_source=chatgpt.com "JavaScript Web configuration - Docs"
[10]: https://support.google.com/analytics/answer/10071811?hl=en&utm_source=chatgpt.com "[GA4] Set up cross-domain measurement - Analytics Help"
[11]: https://docs.sentry.io/platforms/javascript/guides/nextjs/ "Next.js | Sentry for Next.js"
[12]: https://nextjs.org/docs/app/guides/testing?utm_source=chatgpt.com "Guides: Testing"
[13]: https://nextjs.org/docs/14/app/building-your-application/routing/middleware?utm_source=chatgpt.com "Middleware - Routing"
[14]: https://chakra-ui.com/docs/theming/semantic-tokens?utm_source=chatgpt.com "Semantic Tokens"
[15]: https://tanstack.com/query/v5/docs/react/guides/queries?utm_source=chatgpt.com "TanStack Query React Docs"
[16]: https://zod.dev/?utm_source=chatgpt.com "Zod: Intro"
[17]: https://posthog.com/docs/libraries/js?utm_source=chatgpt.com "JavaScript Web - Docs"
[18]: https://sentry.io/for/nextjs/?utm_source=chatgpt.com "Error and Performance Monitoring for Next.js - Sentry"
[19]: https://v2.chakra-ui.com/getting-started/nextjs-app-guide?utm_source=chatgpt.com "Getting Started with Next.js (App)"
[20]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap?utm_source=chatgpt.com "Metadata Files: sitemap.xml"

---

# PromptOps UI Requirements

## Directory Structure

```
app/
  (auth)/
    login/
    signup/
  dashboard/
    page.tsx                    # Overview: active prompts, executions, credits
    prompts/
      page.tsx                  # Prompt library (tenant + public marketplace)
      [id]/
        page.tsx                # Prompt detail with version history
        execute/
          page.tsx              # Execution playground with streaming
        versions/
          page.tsx              # Version comparison UI
    analytics/
      page.tsx                  # Real-time analytics dashboard
    settings/
      page.tsx                  # BYOK key management, webhooks
  api/
    prompts/
    executions/
    feedback/
lib/
  api/
    prompts.ts                  # TanStack Query fetchers
    executions.ts
    feedback.ts
    analytics.ts
  validators/
    prompt.schemas.ts           # Zod schemas for forms
    execution.schemas.ts
  stores/
    prompt-editor.store.ts      # Zustand for editor state
components/
  prompts/
    prompt-card.tsx             # Prompt list item
    prompt-editor.tsx           # Monaco/CodeMirror editor with syntax highlighting
    version-timeline.tsx        # Visual version history
    variable-input.tsx          # Template variable form fields
  execution/
    execution-playground.tsx    # Execute prompt with streaming
    streaming-response.tsx      # SSE token streaming display
    execution-history.tsx       # Past executions list
  feedback/
    feedback-widget.tsx         # Thumbs up/down + comment
    feedback-stats.tsx          # Aggregate feedback display
  analytics/
    metrics-card.tsx            # KPI cards (executions, satisfaction, cost)
    cost-chart.tsx              # Recharts cost breakdown
    performance-chart.tsx       # Latency/token usage trends
  byok/
    provider-key-form.tsx       # RHF + Zod form for adding keys
    provider-key-list.tsx       # List with priority drag-and-drop
```

## Core UI Components

### Prompt Management

**Prompt Library** (`/dashboard/prompts`):
- Data table with search, filter (tenant/public, tags)
- Columns: name, version, last execution, satisfaction %, actions
- "Create Prompt" button → prompt editor modal
- Public marketplace toggle (show/hide shared prompts)

**Prompt Editor** (`components/prompts/prompt-editor.tsx`):
- Monaco Editor or CodeMirror for syntax highlighting
- Template variable detection (`{{variable_name}}`)
- Variable preview panel with example values
- Save as new version or update current
- Branch button (create variant from current version)

**Version History** (`/dashboard/prompts/[id]/versions`):
- Timeline view with version numbers
- Diff viewer (previous ↔ current)
- Performance metrics per version (satisfaction, cost, latency)
- Rollback button (creates new version from old one)
- Compare selector (select 2 versions → side-by-side comparison)

### Execution Playground

**Playground** (`/dashboard/prompts/[id]/execute`):
- Template variable form (auto-generated from `{{variables}}`)
- Model selector (dropdown: GPT-4, Claude 3.5, etc.)
- Stream toggle (enable/disable real-time tokens)
- Execute button
- Streaming response panel with token-by-token display
- Execution metadata display (tokens, cost, latency)
- Feedback widget (thumbs up/down + comment)

**Streaming Response** (`components/execution/streaming-response.tsx`):
- SSE connection to `/prompts/:id/execute?stream=true`
- Token-by-token rendering with typing animation
- Progress indicator during execution
- Copy to clipboard button
- Markdown rendering for formatted responses

### Feedback System

**Feedback Widget** (`components/feedback/feedback-widget.tsx`):
- Thumbs up/down buttons
- Optional comment textarea (expands on click)
- Submit button with loading state
- Toast notification on success

**Feedback Stats** (`components/feedback/feedback-stats.tsx`):
- Satisfaction percentage (% thumbs up)
- Total feedback count
- Recent comments list with sentiment indicators
- Filter by rating (positive/negative)

### Analytics Dashboard

**Dashboard Overview** (`/dashboard/analytics`):
- KPI cards (Recharts for sparklines):
  - Active prompts count
  - Executions today vs. yesterday
  - Average satisfaction (%)
  - Credit balance with burn rate
- Cost breakdown chart (by prompt, model, time period)
- Performance trend chart (latency, token usage over time)
- Top performing prompts table

**Prompt Analytics** (`/dashboard/prompts/[id]/analytics`):
- Execution count timeline
- Satisfaction trend
- Cost per execution
- Model comparison (if used across multiple models)
- Version performance comparison

### BYOK Management

**Provider Keys** (`/dashboard/settings`):
- Provider cards (OpenAI, Anthropic, OpenRouter)
- Add key button → modal with:
  - RHF + Zod form (provider, API key, priority, rate limits)
  - Vault encryption notice
  - Test connection button
- Key list with:
  - Masked key display (last 4 chars only)
  - Priority badge (drag-and-drop to reorder)
  - Active/inactive toggle
  - Delete button with confirmation

**Webhooks** (`/dashboard/settings/webhooks`):
- Webhook URL form
- Event checkboxes (new_version, feedback_threshold, etc.)
- Secret generation
- Delivery log table (status, timestamp, retry count)

## Forms & Validation

### Prompt Creation/Edit

```typescript
// lib/validators/prompt.schemas.ts
import { z } from 'zod';

export const promptSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(10),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// components/prompts/prompt-form.tsx
const form = useForm({
  resolver: zodResolver(promptSchema),
  defaultValues: { is_public: false },
});
```

### Execution Form

```typescript
// Dynamically generated from template variables
const executionSchema = z.object({
  variables: z.record(z.string()), // { variable_name: value }
  model: z.string(),
  stream: z.boolean().default(true),
});
```

### BYOK Key Form

```typescript
const providerKeySchema = z.object({
  provider_id: z.string().uuid(),
  api_key: z.string().min(20),
  priority: z.number().int().min(1).max(99),
  rate_limits: z.object({
    requests_per_minute: z.number().int().optional(),
    tokens_per_minute: z.number().int().optional(),
  }).optional(),
});
```

## Data Fetching Patterns

### TanStack Query Hooks

```typescript
// lib/api/prompts.ts
export const usePrompts = () => {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await fetch('/api/prompts');
      return res.json();
    },
  });
};

export const useExecutePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, variables, model }: ExecutePromptInput) => {
      const res = await fetch(`/api/prompts/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ variables, model }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
    },
  });
};

// Streaming execution
export const useStreamingExecution = (promptId: string, variables: Record<string, string>) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const execute = useCallback(async () => {
    setIsStreaming(true);
    setTokens([]);

    const eventSource = new EventSource(
      `/api/prompts/${promptId}/execute?stream=true&variables=${JSON.stringify(variables)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'token') {
        setTokens((prev) => [...prev, data.data]);
      } else if (data.type === 'done') {
        setIsStreaming(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setIsStreaming(false);
      eventSource.close();
    };
  }, [promptId, variables]);

  return { tokens, isStreaming, execute };
};
```

## State Management

### Prompt Editor State (Zustand)

```typescript
// lib/stores/prompt-editor.store.ts
import { create } from 'zustand';

interface PromptEditorState {
  content: string;
  variables: string[]; // Extracted from {{variable_name}}
  isDirty: boolean;
  setContent: (content: string) => void;
  extractVariables: () => void;
  reset: () => void;
}

export const usePromptEditor = create<PromptEditorState>((set, get) => ({
  content: '',
  variables: [],
  isDirty: false,
  setContent: (content) => {
    set({ content, isDirty: true });
    get().extractVariables();
  },
  extractVariables: () => {
    const { content } = get();
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = matches.map((m) => m.replace(/\{\{|\}\}/g, ''));
    set({ variables: [...new Set(variables)] });
  },
  reset: () => set({ content: '', variables: [], isDirty: false }),
}));
```

## Theming

### PromptOps Semantic Tokens

```typescript
// styles/theme.ts
import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  semanticTokens: {
    colors: {
      'brand.primary': { default: 'blue.500', _dark: 'blue.300' },
      'brand.secondary': { default: 'purple.500', _dark: 'purple.300' },
      'surface.elevated': { default: 'white', _dark: 'gray.800' },
      'surface.base': { default: 'gray.50', _dark: 'gray.900' },
      'text.primary': { default: 'gray.900', _dark: 'gray.50' },
      'text.muted': { default: 'gray.600', _dark: 'gray.400' },
      'border.default': { default: 'gray.200', _dark: 'gray.700' },
      'feedback.positive': { default: 'green.500', _dark: 'green.300' },
      'feedback.negative': { default: 'red.500', _dark: 'red.300' },
    },
  },
});
```

## Testing

### E2E Test Scenarios (Playwright)

```typescript
// e2e/prompt-workflow.spec.ts
test('Create and execute prompt with streaming', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Create prompt
  await page.goto('/dashboard/prompts');
  await page.click('text=Create Prompt');
  await page.fill('[name="name"]', 'Test Prompt');
  await page.fill('[name="content"]', 'Hello {{name}}!');
  await page.click('text=Save');

  // Execute prompt
  await page.click('text=Execute');
  await page.fill('[name="variables.name"]', 'World');
  await page.click('text=Run');

  // Verify streaming response
  await expect(page.locator('text=Hello World!')).toBeVisible();

  // Submit feedback
  await page.click('[aria-label="Thumbs up"]');
  await expect(page.locator('text=Feedback submitted')).toBeVisible();
});
```

## Performance Optimizations

- **Code splitting**: Lazy load Monaco Editor, Recharts
- **Virtualization**: Use `@tanstack/react-virtual` for long prompt lists
- **Debounced search**: 300ms debounce on prompt search input
- **Optimistic updates**: TanStack Query optimistic updates for feedback submission
- **Streaming**: SSE for real-time token streaming (no polling)
