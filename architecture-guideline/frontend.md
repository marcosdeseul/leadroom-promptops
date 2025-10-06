Perfect—let’s lock a clean, Claude-friendly frontend stack you can scale without drowning in boilerplate. I’m optimizing for: minimal code, strong defaults, great DX for LLM agents (Claude Code via MCP), and zero yak-shaving.

# App framework & routing

- Next.js (App Router, Next 15+) as the single front-end app for product UI + blog (MDX). It gives you file-based routing, server components, ISR, Metadata API, and first-class SEO hooks (robots/sitemap/JSON-LD) out of the box. ([Next.js][1])

# UI system (lowest code, highest leverage)

- Chakra UI (primary UI layer) — fastest way to ship a consistent SaaS UI with a small API surface. It plays well with App Router and ships semantic tokens so you can re-skin by intent (“surface”, “text.muted”) without refactoring components. Use `@chakra-ui/next-js` for App Router glue. ([chakra-ui.com][2])
- LLM/MCP enablement: Install Chakra’s MCP server and drop `llms.txt` for Chakra into the repo so Claude stops reinventing components and follows house patterns. These two drastically improve code consistency when AI authors UI. ([Next.js][3])
- Optional “headless escape hatch”: If you ever need ultra-custom widgets, pair Chakra with Radix Primitives (accessible, unstyled) or pull specific shadcn/ui components (Radix-based) instead of inventing from scratch. ([Next-Intl][4])

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
