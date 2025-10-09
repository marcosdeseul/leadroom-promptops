# Leadroom PromptOps - Frontend

Multi-tenant LLM Prompt Optimizer frontend built with Next.js 15 and Chakra UI v3.

## ✅ Status: Issue #13 Complete

### Completed Features
- ✅ Next.js 15 with App Router initialized
- ✅ TypeScript configured with strict mode and path aliases
- ✅ **Chakra UI v3** fully configured with v3 API (`createSystem`, `defineConfig`)
- ✅ Semantic tokens theme for light/dark mode
- ✅ TanStack Query v5 setup with providers and SSR hydration
- ✅ All core dependencies installed (Zustand, RHF, Zod, Lucide, Recharts)
- ✅ Configuration files (Next.js, ESLint, Prettier, tsconfig)
- ✅ **Auth pages** (`/login`, `/signup`) with forms
- ✅ **Dashboard layout** with sidebar navigation and route highlighting
- ✅ **LoginForm** with React Hook Form + Zod validation
- ✅ **Loading component** and **Error Boundary**
- ✅ **TanStack Query** example implementation
- ✅ **Dark mode toggle** with ColorModeButton
- ✅ **All builds passing** (typecheck, lint, build)
- ✅ **Dev server starts** on port 5300

## Quick Start

```bash
# Start development server
npm run dev

# Open browser
http://localhost:5300

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build for production
npm run build
```

## Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Chakra UI v3 with semantic tokens
- **Data**: TanStack Query v5
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, signup)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── dashboard/          # Dashboard routes
│   │   ├── page.tsx
│   │   └── layout.tsx      # With navigation sidebar
│   ├── layout.tsx          # Root layout with providers
│   ├── providers.tsx       # Chakra, TanStack Query, ErrorBoundary
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Chakra UI snippets + custom
│   │   ├── provider.tsx    # Chakra Provider (from snippet)
│   │   ├── color-mode.tsx  # Dark mode components
│   │   ├── field.tsx       # Form field (from snippet)
│   │   ├── toaster.tsx     # Toast notifications
│   │   ├── loading.tsx     # Loading spinner
│   │   └── error-boundary.tsx  # Error boundary
│   └── forms/
│       └── LoginForm.tsx   # RHF + Zod form example
├── lib/
│   ├── api/                # TanStack Query
│   │   ├── client.ts       # API client with fetch wrapper
│   │   ├── auth.ts         # Auth API calls
│   │   └── queries.ts      # TanStack Query hooks
│   ├── validators/
│   │   └── auth.ts         # Zod schemas
│   └── stores/
│       └── auth.ts         # Zustand auth store
└── styles/
    ├── theme.ts            # Chakra UI v3 theme
    └── globals.css         # Global styles
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5301
NEXT_PUBLIC_APP_URL=http://localhost:5300
```

## Theme Tokens

Semantic tokens configured for light/dark mode:
- `brand.primary`, `brand.secondary`
- `surface.elevated`, `surface.base`
- `text.primary`, `text.muted`
- `border.default`
- `feedback.positive`, `feedback.negative`

## Routes

- `/` - Home page
- `/login` - Login page with form validation
- `/signup` - Signup page (placeholder)
- `/dashboard` - Dashboard with navigation sidebar

## Acceptance Criteria (All Met)

- ✅ `npm run dev` starts Next.js on port 5300
- ✅ Chakra UI theme working with light/dark mode toggle
- ✅ Base routing structure in place (`/login`, `/dashboard`)
- ✅ TanStack Query configured for API calls with SSR
- ✅ Example form with RHF + Zod validation working
- ✅ Navigation component with route highlighting
- ✅ All linting and type-checking passing
- ✅ Semantic tokens applied (no hardcoded hex colors in components)

## Next Steps

Issue #13 is complete. Ready for backend integration and feature development.
