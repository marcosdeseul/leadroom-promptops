# Architecture that won’t bite you

## Request path (inbound)
Next.js (Vercel) → Zuplo (API key, plan, quota) → NestJS+Fastify (Cloud Run) → Supabase (Postgres + RLS/Auth)

## Async/outbound
Nest publishes work to Upstash Workflows/QStash with Flow Control → QStash calls your Cloud Run workflow endpoints → vendor APIs (Prospeo, Findymail, ZeroBounce) → results back to Supabase → UI updates via Realtime.

## Control planes
- Zuplo + Stripe: issue tenant API keys, enforce inbound quotas, monetize.
- Upstash: tenant/key-aware throttling for vendor calls.
- Supabase: source of truth, RLS, Vault for secrets.

---

# Golden rules for each piece

## Zuplo (front door, monetization)
- Keys and plans: one Zuplo “consumer” per tenant. Attach usage plans (RPS + monthly quota).
- Stripe: map product tiers to Zuplo plans; on payment events, auto-upgrade/downgrade plan limits.
- Context to backend: forward `X-Tenant-Id`, `X-Plan`, and `X-API-Key-Id` headers so Nest can log and enforce tenant logic.
- Docs and portal: publish OpenAPI from Nest Swagger; let tenants self-serve key rotation. No bespoke portal heroics.

## NestJS + Fastify (Cloud Run)
- Fastify: keep the adapter; turn on compression only where it matters.
- Concurrency: start at 80 per instance, bump with load tests. Set min instances for hot paths. Use VPC + Cloud NAT for a static egress IP.
- Long work: never block requests. Enqueue to Upstash and return a `runId`.
- Telemetry: OpenTelemetry with `x-correlation-id` from Zuplo; log `runId`, `tenantId`, `apiKeyId`, `vendorKeyHash`.

## Supabase (DB, Auth, secrets)
- **Database Design**: Drizzle ORM as single source of truth, migrations enhanced with Supabase features
  - Schema defined in TypeScript (`src/database/schema/`)
  - Drizzle generates base migrations → enhance with RLS/triggers → deploy
  - 100% ORM usage - no raw SQL, all queries through Drizzle

### Migration Workflow (Drizzle → Supabase)
1. **Generate Drizzle migrations**: `npm run db:generate` creates base SQL from schema changes
2. **Enhance for Supabase**: `npm run db:enhance` automatically adds:
   - PostgreSQL extensions (uuid-ossp, pgcrypto, pgjwt)
   - Auth helper functions: `auth.tenant_id()`, `auth.uid()`
   - Updated_at triggers for tables with timestamps
   - Dynamic RLS policies based on schema analysis
3. **Apply to Supabase**: `supabase db reset --local` applies enhanced migrations
4. **Push to production**: `supabase db push` after testing locally

**Key Features**:
- **Idempotent**: Can run enhancement multiple times safely
- **Smart detection**: Skips already-enhanced migrations (name matching)
- **Dynamic RLS**: Analyzes schema to generate appropriate policies:
  - Tenant-isolated tables: Filter by `tenant_id`
  - Global reference tables: Public read access
  - Junction tables: Access through parent table permissions
- **Batch processing**: Enhances all migrations in one command

- RLS: all multi-tenant tables gated by `tenant_id = current_setting('request.headers')::json->>'x-tenant-id'`.
  - Policies auto-generated based on schema structure
  - Works seamlessly with Supabase auth and headers
- Vault: store vendor API keys encrypted; fetch server-side only. Never to the client. Ever.
- Pooling: Drizzle + postgres-js with `prepare: false` for the pooler. Keep region close to Cloud Run.

## Upstash (workflows + throttling)
- Flow Control per BYO key and tenant: `key = vendor:tenant:keyHash`, set `rate/period` and `parallelism`. That’s outbound fairness solved.
- Step handlers: Cloud Run endpoints verify `Upstash-Signature`, do the I/O, write progress rows, return.
- Progress: write `workflow_progress` rows at step start/end; Next.js subscribes via Supabase Realtime. Keep an admin view that reads Upstash run logs for truth.

---

# Minimal data model (don’t overcomplicate)

- `tenants(id, name, plan, stripe_customer_id, …)`
- `tenant_api_keys(id, tenant_id, key_hash, created_at, revoked_at, quota_monthly)`
- `vendor_secrets(tenant_id, vendor, secret_id_in_vault, created_at)`  // Supabase Vault link
- `workflows(id, tenant_id, template, config_jsonb, created_at)`
- `workflow_runs(id, tenant_id, workflow_id, status, started_at, finished_at)`
- `workflow_progress(run_id, step, status, meta_jsonb, created_at)`
- `usage_counters(tenant_id, period, calls, workflows, vendor_calls, …)`  // for billing dashboards

**Note**: All tables defined in Drizzle schema with TypeScript, not raw SQL. Migrations auto-generated.

RLS sketch

```sql
-- example: workflow_runs visible only to same-tenant users
create policy tenant_isolation on workflow_runs
for select using (tenant_id = auth.jwt()->>'tenant_id');
```

---

# Migration Safety

**Problem**: Developers could accidentally use `drizzle-kit push` or `drizzle-kit migrate`, bypassing the Supabase enhancement workflow (RLS policies, auth functions, triggers).

**Solution**: Database-level permission enforcement using a read-only PostgreSQL user for Drizzle operations.

## Dual Database Configuration

The system uses **two separate database users** for different purposes:

| User | Purpose | Permissions | Used By |
|------|---------|-------------|---------|
| `drizzle_readonly` | Migration generation | SELECT only | Drizzle Kit (`drizzle-kit generate`) |
| Regular user (postgres) | Application runtime | Full CRUD | NestJS app, tests |

### Environment-Based Switching

The `DRIZZLE_USE_READONLY_FOR_MIGRATION` environment variable controls which user Drizzle Kit uses:

```yaml
DRIZZLE_USE_READONLY_FOR_MIGRATION=true (default):
  ✅ drizzle-kit generate: Works (reads schema with read-only user)
  ❌ drizzle-kit push: Fails with permission error (read-only cannot write)
  ❌ drizzle-kit migrate: Fails with permission error (read-only cannot write)

DRIZZLE_USE_READONLY_FOR_MIGRATION=false (test scenarios only):
  ✅ Uses regular user with full permissions
  ⚠️  Only for specific test scenarios (db:push:test)
```

This is **systemic prevention** at the PostgreSQL level—impossible to bypass even with direct drizzle-kit commands.

## Setup Instructions

### 1. Database Setup

The read-only user is automatically created when you run:

```bash
supabase db reset --local
```

This runs `backend/supabase/seed.sql` which creates the `drizzle_readonly` user.

### 2. Configure Environment Variable

Add to your `.env` file:

```bash
# Local Development (default password from seed.sql)
DRIZZLE_DATABASE_URL=postgresql://drizzle_readonly:drizzle_readonly_local_dev@localhost:54322/postgres

# Production (use strong password, create user manually)
DRIZZLE_DATABASE_URL=postgresql://drizzle_readonly:STRONG_PASSWORD@host:port/database
```

### 3. Verify Setup

Test that the safety mechanism works:

```bash
# This should work (reads schema only)
npm run db:generate

# This should fail with permission error (tries to write)
npx drizzle-kit push:pg
# Expected error: "permission denied for table ..."
```

## Environment-Specific Usage

The dual configuration works across all environments:

| Environment | Drizzle Operations | Application Runtime | Test Commands |
|-------------|-------------------|--------------------|--------------------|
| **Local Dev** | `drizzle_readonly` (migration safety) | Regular user (CRUD) | N/A |
| **Local Tests (Migration)** | `drizzle_readonly` (enforce safety) | N/A | Migration safety tests |
| **Local Tests (Backend)** | Uses `DATABASE_URL` (CRUD needed) | Regular user (CRUD) | `npm test` |
| **CI Tests (Migration)** | `drizzle_readonly` (enforce safety) | N/A | Migration safety tests |
| **CI Tests (Backend)** | Uses `DATABASE_URL` (CRUD needed) | Regular user (CRUD) | `npm test` |
| **Dev/Staging/Prod** | `drizzle_readonly` (migration safety) | Regular user (CRUD) | N/A |

**Key Points**:
- Drizzle Kit **always defaults to read-only** unless explicitly overridden
- Application runtime **always uses regular user** for full CRUD access
- Test commands explicitly set `DRIZZLE_USE_READONLY_FOR_MIGRATION=false` when CRUD is needed
- Migration safety tests rely on default `true` value to enforce read-only behavior

## Migration Workflow Enforcement

**Removed Scripts**: The following scripts have been removed from `package.json` to prevent accidental use:

- ❌ `db:push` - Would bypass Supabase enhancements
- ❌ `db:migrate` - Would bypass Supabase enhancements

**Allowed Scripts**: Only these safe operations remain:

- ✅ `db:generate` - Generate migration SQL from schema changes (read-only)
- ✅ `db:enhance` - Add Supabase features to migrations (file operations only)
- ✅ `db:push:test` - Push to test database (uses separate config)
- ✅ `db:studio` - Visual database browser (read-only by default)

## Dual-Tracking System

The system maintains two independent tracking mechanisms:

| Tracker | Purpose | Location | Tracks |
|---------|---------|----------|--------|
| **Drizzle Journal** | Generation metadata | `src/database/migrations/meta/_journal.json` | When migrations were **created** |
| **Supabase Migrations** | Application tracking | Database table `supabase_migrations` | What migrations were **applied** |

**Why Both?**

- **Journal**: Required for `drizzle-kit generate` to know the next migration number and maintain generation history
- **Supabase**: Source of truth for what's actually in the database; enables `supabase db reset` and other Supabase CLI commands

**Keep journal.json in Git**: It's version-controlled metadata, not a duplicate of database state.

## Troubleshooting

### "Permission denied for table" Error

**Cause**: Read-only user is working correctly—you're trying to push/migrate.

**Solution**: Use the safe workflow:

```bash
npm run db:generate  # Generate migration SQL
npm run db:enhance   # Add Supabase enhancements
supabase db reset --local  # Apply to database
```

### "WARNING: Using DATABASE_URL instead of DRIZZLE_DATABASE_URL"

**Cause**: `DRIZZLE_DATABASE_URL` is not set in your `.env` file.

**Solution**: Follow setup instructions above to create read-only user and set the environment variable.

### Need to Push Schema Directly (Testing Only)

For test database operations where you want to bypass safety (e.g., rapid prototyping):

```bash
# Uses separate config without read-only user
npm run db:push:test
```

**Never use this for development or production databases.**

## Testing Migration Safety

The migration safety mechanism is covered by automated integration tests that run in both local and CI environments.

### Running Tests

```bash
# Run all integration tests (includes migration safety)
npm run test:integration

# Run specific migration safety test
npm test -- migration-safety.integration.spec.ts

# Run in watch mode during development
npm run test:watch -- migration-safety.integration.spec.ts
```

### What the Tests Verify

The `test/integration/migration-safety.integration.spec.ts` test suite validates:

1. **Read-Only User Creation**: Verifies user can be created with SELECT-only permissions
2. **Read Operations Work**: Confirms `SELECT` queries succeed (for `drizzle-kit generate`)
3. **Write Operations Fail**: Validates `INSERT`, `UPDATE`, `DELETE` are blocked
4. **Schema Changes Fail**: Ensures `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` are blocked
5. **Permission Enforcement**: Confirms safety cannot be bypassed via transactions

### CI Integration

Tests automatically run on every PR via GitHub Actions and validate all permission restrictions.

---

# Glue snippets you’ll actually reuse

Publish with Flow Control (TypeScript, server-side)

```ts
await workflowsClient.trigger({
  id: "email-waterfall",
  body: { tenantId, person, vendors: {...} },
  headers: {
    "Upstash-Flow-Control-Key": `prospect:${tenantId}:${prospeoKeyHash}`,
    "Upstash-Flow-Control-Value": "rate=300;period=1m;parallelism=3"
  }
});
```

Verify Upstash signature (NestJS middleware)

```ts
const sig = req.headers["upstash-signature"];
verifySignatureOrThrow(sig as string, await getCurrentSigningKey());
```

Fastify health and readiness

```ts
app.get("/healthz", async () => ({ ok: true }));
app.get("/readyz", async () => ({ db: await pingDb() }));
```

Drizzle with RLS (pooled, server-side)

```ts
// Schema with native RLS support
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole } from 'drizzle-orm/supabase';

export const providers = pgTable('providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
}, (table) => [
  table.enableRLS(),
  pgPolicy('tenant_isolation', {
    for: 'all',
    to: authenticatedRole,
    using: sql`tenant_id = auth.jwt() ->> 'tenant_id'::uuid`
  })
]);

// Client initialization
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './database/schema';
const sql = postgres(process.env.DATABASE_URL!, { prepare: false }); // pooler-friendly
export const db = drizzle(sql, { schema });
```

Migration workflow (Drizzle-first)

```bash
# 1. Define schema in TypeScript
edit src/database/schema/providers.ts

# 2. Generate SQL migration
npm run db:generate

# 3. Enhance with Supabase features (RLS, triggers)
npm run db:enhance

# 4. Apply to database
npm run db:push
```

---

# Ops checklists

## Cloud Run
- VPC connector + Cloud NAT with reserved IP.
- `--concurrency=80` to start, `--cpu=1` or `2` based on profile, `--min-instances` for hot paths.
- Use Cloud Run Jobs for backfills and batch reprocessing.

## Zuplo
- Plans: `free`, `pro`, `enterprise` with RPS and monthly caps.
- Stripe webhooks → plan change → Zuplo plan update → email + UI banner.
- 429 with `X-RateLimit-*` headers; don’t pretend infinite.

## Upstash
- Standardize Flow Control per vendor. Keep a table of per-key limits you hydrate at publish time.
- Alert when `waitlist_size` per flow-key exceeds threshold; bump rate or parallelism or nag the customer.

## Supabase
- Network Restrictions on; allowlist Cloud NAT IP.
- Backups verified; PITR tested.
- RLS tests as part of CI.

## Observability
- Trace ID from Zuplo to Nest to Upstash steps.
- SLOs: p99 API latency, queue time, success rate per vendor, DLQ size, time-to-first-result per run.

---

# Landmines to sidestep

- Shoving vendor keys into plain text columns. Use Vault.
- Treating Upstash like compute. It orchestrates; Cloud Run does the work.
- Letting Vercel host WebSockets. Keep sockets on Cloud Run if you need them.
- Forgetting `prepare: false` on postgres-js with the pooler, then blaming the database.
- Writing raw SQL migrations when Drizzle can generate them. Keep single source of truth.
- Mixing Supabase migrations with Drizzle migrations. Use Drizzle + enhancement only.

---

# Rollout plan (two sprints, not a novella)

## Week 1
- Wire Zuplo → Cloud Run. Swagger → Zuplo portal. Stripe plans.
- Drizzle schema + RLS + Vault tables.
- Upstash workflow skeleton with one vendor, progress rows, Realtime UI.

## Week 2
- Add BYO-key onboarding UI, set per-key Flow Control.
- Add second vendor + ZeroBounce validate step.
- Usage metering → Stripe usage reporting.
- Load test: 500 RPS burst inbound, 5 RPS per BYO key outbound, prove queues shape correctly.

Ship this and you’re operating like an adult: clear plan boundaries, tenant safety, outbound throttling, and a billing switch that actually bills.
