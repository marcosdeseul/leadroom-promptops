# PromptOps Backend

NestJS backend with Fastify, Drizzle ORM, and Supabase.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (for Supabase local)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start Supabase local:
   ```bash
   npx supabase start
   ```

   **Note**: First-time setup will download Docker images (~5-10 minutes).

4. Update `.env` with credentials from above command

5. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:cov` - Run tests with coverage
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:studio` - Open Drizzle Studio

## Health Checks

- `GET /healthz` - Liveness check
- `GET /readyz` - Readiness check (includes DB connection)

## Migration Workflow

1. Define schema in `src/database/schema/` (Drizzle TypeScript)
2. Generate migration: `npm run db:generate`
3. Copy migration from `drizzle/` to `supabase/migrations/`
4. Apply: `supabase db reset --local`

Everything is defined in Drizzle schema:
- Tables with types and constraints
- RLS policies using `pgPolicy`
- Triggers using `sql` template
- Extensions and functions

See `architecture-guideline/backend.md` for details.

## Supabase Configuration

Project ID is set to `leadroom-promptops` in `supabase/config.toml` to avoid conflicts with other local Supabase projects.

## Architecture

```
src/
├── common/           # Shared utilities
├── database/
│   ├── schema/       # Drizzle schemas (populated in #11)
│   ├── utils/        # DB helpers
│   └── db.config.ts  # Database connection config
├── health/           # Health check endpoints
│   ├── health.controller.ts
│   ├── health.service.ts
│   ├── health.module.ts
│   └── *.spec.ts     # Tests
├── app.module.ts     # Root module
└── main.ts           # Application entry (Fastify)
```

## Development

- Port: 3001 (backend), 3000 reserved for frontend
- Fastify adapter for performance
- ConfigModule global for environment variables
- Health checks for container orchestration
