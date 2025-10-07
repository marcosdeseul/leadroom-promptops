# PromptOps Backend Architecture

LLM Prompt Optimizer with user feedback - MVP focused on simplicity and speed.

## Request path (MVP)

Next.js (local) → NestJS+Fastify (local) → Supabase (local PostgreSQL + RLS/Auth)

**v2+**: Add Zuplo (API gateway) → Cloud Run deployment

## Core principles

- **Multi-tenancy**: RLS on all tables, strict tenant isolation
- **BYOK**: Tenant LLM keys stored in Supabase Vault, waterfall priority
- **Synchronous**: No background jobs in MVP (add Upstash Workflows v2+)
- **Credits**: Track token usage + optimization runs, auto-stop when depleted
- **Streaming**: Real-time token streaming for better UX

---

# Stack

## NestJS + Fastify (local dev)

- Fastify adapter for performance
- Local development on custom ports (see CLAUDE.md)
- Swagger/OpenAPI for API documentation
- Tenant context middleware: extract `tenant_id` from auth/headers

## Supabase (DB, Auth, secrets)

- **Database Design**: Drizzle ORM as single source of truth
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

- **RLS**: All multi-tenant tables gated by `tenant_id = current_setting('request.headers')::json->>'x-tenant-id'`
  - Policies auto-generated based on schema structure
  - Works seamlessly with Supabase auth and headers
- **Vault**: Store tenant LLM API keys encrypted; fetch server-side only. Never to the client.
- **Pooling**: Drizzle + postgres-js with `prepare: false` for the pooler

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
DRIZZLE_DATABASE_URL=postgresql://drizzle_readonly:drizzle_readonly_local_dev@localhost:55322/postgres

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

# PromptOps Data Model

All tables defined in Drizzle schema with TypeScript, not raw SQL. Migrations auto-generated.

## Core Tables

### Tenant & Auth
```typescript
// tenants(id, name, plan, stripe_customer_id, created_at, updated_at)
// RLS: Users can only see their own tenant
```

### Prompts & Versioning
```typescript
// prompts(id, tenant_id, name, description, is_public, created_at, updated_at)
// - Template prompts with variable support ({{variable_name}})
// - Tenant-isolated with optional public/shared marketplace (is_public flag)
// RLS: tenant_id filter + public prompts readable by all

// prompt_versions(id, prompt_id, version_number, content, metadata_jsonb, parent_version_id, created_at)
// - Full version history with diffs
// - parent_version_id enables branching
// - metadata: optimization_type, model_specific_variants, performance_notes
// RLS: Through parent prompt's tenant_id
```

### Execution & Feedback
```typescript
// prompt_executions(id, tenant_id, prompt_id, version_id, llm_provider_id, model, input_variables_jsonb, response_text, response_metadata_jsonb, token_usage_jsonb, cost_usd, latency_ms, created_at)
// - Tracks every prompt execution
// - response_metadata: status, finish_reason, streaming_enabled
// - token_usage: prompt_tokens, completion_tokens, total_tokens
// - Retention policy applied based on tenant plan
// RLS: tenant_id filter

// feedback(id, execution_id, tenant_id, rating, comment_text, user_context_jsonb, created_at)
// - rating: thumbs up/down (boolean) or numeric score
// - user_context: session_id, device_type, custom_metadata
// RLS: tenant_id filter
```

### LLM Providers & BYOK
```typescript
// llm_providers(id, name, base_url, is_active)
// - OpenAI, Anthropic, OpenRouter configs
// - is_active flag for provider availability
// RLS: Public read access

// tenant_llm_keys(id, tenant_id, provider_id, vault_secret_id, priority, is_active, rate_limit_config_jsonb, created_at, updated_at)
// - BYOK: encrypted keys stored in Supabase Vault
// - priority: waterfall order (1 = highest priority)
// - rate_limit_config: per-provider limits (rpm, tpm)
// - Waterfall logic: Try priority 1 → 2 → 3 until success
// RLS: tenant_id filter
```

### Credits & Usage
```typescript
// credit_transactions(id, tenant_id, amount, transaction_type, reference_id, reference_type, metadata_jsonb, created_at)
// - Real-time credit tracking
// - transaction_type: 'token_usage' | 'optimization_run' | 'purchase' | 'refund'
// - reference: execution_id or optimization_job_id
// - Auto-stop when balance depleted
// RLS: tenant_id filter

// tenant_credit_balance(tenant_id, balance, last_updated_at)
// - Materialized view or cached balance
// - Updated on every transaction
// RLS: tenant_id filter
```

### Optimization (Manual Trigger in MVP)
```typescript
// optimization_suggestions(id, prompt_id, current_version_id, suggested_content, optimization_type, rationale_text, metrics_improvement_jsonb, created_at)
// - LLM-powered prompt rewriting suggestions
// - optimization_type: 'clarity' | 'performance' | 'cost' | 'semantic'
// - metrics_improvement: expected satisfaction_boost, cost_reduction, etc.
// - Manual trigger: tenant requests optimization
// RLS: Through parent prompt's tenant_id

// optimization_acceptances(id, suggestion_id, accepted_at, new_version_id)
// - Track which suggestions were accepted
// - Creates new prompt version when accepted
// RLS: Through parent suggestion's tenant_id
```

### Retention Policies
```typescript
// retention_policies(tenant_id, execution_retention_days, feedback_retention_days, created_at, updated_at)
// - Configurable per tenant based on plan
// - Free: 7 days, Pro: 90 days, Enterprise: custom
// RLS: tenant_id filter
```

### Webhooks
```typescript
// webhook_configs(id, tenant_id, url, secret, events_array, is_active, created_at, updated_at)
// - events: ['new_version', 'feedback_threshold', 'performance_degradation', 'cost_alert']
// RLS: tenant_id filter

// webhook_deliveries(id, config_id, event_type, payload_jsonb, status, response_code, error_text, delivered_at)
// - Delivery tracking and retry logic
// RLS: Through parent config's tenant_id
```

**RLS Pattern Example**:
```sql
-- Auto-generated by enhancement script
create policy tenant_isolation on prompts
for all using (tenant_id = auth.jwt()->>'tenant_id' OR is_public = true);

create policy tenant_isolation on prompt_executions
for all using (tenant_id = auth.jwt()->>'tenant_id');
```

---

# API Endpoints

## Prompt Management

```typescript
POST   /prompts                    // Create prompt with template variables
GET    /prompts                    // List tenant prompts (+ public marketplace)
GET    /prompts/:id                // Get prompt details
PUT    /prompts/:id                // Update prompt
DELETE /prompts/:id                // Soft delete prompt
POST   /prompts/:id/versions       // Create new version (manual or optimization)
GET    /prompts/:id/versions       // List version history with diffs
GET    /prompts/:id/versions/:vid  // Get specific version
POST   /prompts/:id/branch         // Branch from version (creates copy)
GET    /prompts/:id/compare?v1=X&v2=Y  // Compare versions with metrics
```

## Execution

```typescript
POST   /prompts/:id/execute        // Execute prompt with variable substitution
                                   // Body: { variables, model?, stream? }
                                   // Response: LLM response + metadata (tokens, cost, version)
                                   // Supports streaming via SSE
GET    /executions/:id             // Get execution details
GET    /executions                 // List executions (filtered by prompt_id, date range)
```

## Feedback

```typescript
POST   /executions/:id/feedback    // Submit feedback (thumbs up/down + comment)
                                   // Body: { rating, comment?, user_context? }
GET    /prompts/:id/feedback       // Aggregate feedback for prompt
GET    /prompts/:id/feedback/stats // Stats: satisfaction %, avg rating, comment themes
```

## Optimization

```typescript
POST   /prompts/:id/optimize       // Request optimization (manual trigger)
                                   // Returns: suggestion_id, suggested_content, rationale
GET    /prompts/:id/suggestions    // List optimization suggestions
POST   /suggestions/:id/accept     // Accept suggestion (creates new version)
POST   /suggestions/:id/reject     // Reject suggestion
```

## Analytics

```typescript
GET    /analytics/dashboard         // Real-time tenant dashboard
                                    // Metrics: active prompts, executions today, avg satisfaction, credit balance
GET    /analytics/prompts/:id       // Per-prompt metrics
                                    // Metrics: executions, avg latency, cost, satisfaction, conversion rate
GET    /analytics/cost              // Cost analysis and projections
                                    // Breakdown by prompt, model, time period
GET    /analytics/versions/compare  // A/B test results across versions
```

## BYOK Management

```typescript
POST   /providers/keys              // Register LLM provider key (stored in Vault)
                                    // Body: { provider_id, api_key, priority?, rate_limits? }
GET    /providers/keys              // List configured keys (masked)
PUT    /providers/keys/:id/priority // Update waterfall priority
DELETE /providers/keys/:id          // Revoke key
GET    /providers                   // List available LLM providers
```

## Credits

```typescript
GET    /credits/balance             // Current credit balance
GET    /credits/transactions        // Transaction history
POST   /credits/purchase            // Purchase credits (Stripe integration v2+)
```

## Webhooks

```typescript
POST   /webhooks                    // Configure webhook
                                    // Body: { url, secret, events[] }
GET    /webhooks                    // List webhook configs
PUT    /webhooks/:id                // Update webhook
DELETE /webhooks/:id                // Delete webhook
GET    /webhooks/:id/deliveries     // Delivery logs
```

---

# LLM Provider Integration

## Unified Abstraction Layer

```typescript
// src/llm/providers/base.provider.ts
interface ILLMProvider {
  execute(prompt: string, options: ExecutionOptions): Promise<LLMResponse>;
  executeStream(prompt: string, options: ExecutionOptions): AsyncGenerator<string>;
  estimateCost(tokenUsage: TokenUsage): number;
}

// src/llm/providers/openai.provider.ts
class OpenAIProvider implements ILLMProvider { ... }

// src/llm/providers/anthropic.provider.ts
class AnthropicProvider implements ILLMProvider { ... }

// src/llm/providers/openrouter.provider.ts
class OpenRouterProvider implements ILLMProvider { ... }
```

## BYOK Waterfall Logic

```typescript
// src/llm/services/execution.service.ts
async executeWithBYOK(prompt: string, options: ExecutionOptions) {
  const tenantKeys = await getTenantKeys(tenantId, providerId, { orderBy: 'priority' });

  for (const key of tenantKeys) {
    if (!key.is_active) continue;

    // Check rate limits
    if (await isRateLimited(key.id, key.rate_limit_config)) {
      continue; // Try next key
    }

    try {
      const provider = getProvider(key.provider_id, key.vault_secret_id);
      const response = await provider.execute(prompt, options);

      // Track usage and cost
      await recordExecution({ key_id: key.id, token_usage, cost });

      return response;
    } catch (error) {
      if (isRecoverable(error)) {
        continue; // Waterfall to next key
      }
      throw error;
    }
  }

  throw new Error('All BYOK keys exhausted or rate limited');
}
```

## Streaming Support

```typescript
// SSE streaming for real-time tokens
async function* streamExecution(prompt: string, options: ExecutionOptions) {
  const provider = await getProviderWithBYOK(tenantId, options.model);

  for await (const chunk of provider.executeStream(prompt, options)) {
    yield { type: 'token', data: chunk };
  }

  yield { type: 'done', data: { tokens, cost } };
}
```

---

# Credit System

## Real-Time Tracking

```typescript
// src/credits/services/credit.service.ts
async deductCredits(tenantId: string, amount: number, reference: { type, id }) {
  const balance = await getCurrentBalance(tenantId);

  if (balance < amount) {
    throw new InsufficientCreditsError('Auto-stop: credit balance depleted');
  }

  // Atomic transaction
  await db.transaction(async (tx) => {
    // Record deduction
    await tx.insert(creditTransactions).values({
      tenant_id: tenantId,
      amount: -amount,
      transaction_type: reference.type, // 'token_usage' | 'optimization_run'
      reference_id: reference.id,
    });

    // Update balance
    await tx.update(tenantCreditBalance)
      .set({ balance: sql`balance - ${amount}`, last_updated_at: new Date() })
      .where(eq(tenantCreditBalance.tenant_id, tenantId));
  });

  // Check if balance low, send warning
  const newBalance = balance - amount;
  if (newBalance < LOW_BALANCE_THRESHOLD) {
    await sendCreditWarning(tenantId, newBalance);
  }
}
```

## Cost Calculation

```typescript
// Token-based pricing per provider/model
const PRICING = {
  'openai:gpt-4': { prompt: 0.00003, completion: 0.00006 }, // per token
  'anthropic:claude-3.5-sonnet': { prompt: 0.000003, completion: 0.000015 },
  'optimization_run': 0.10, // flat fee
};

function calculateCost(provider: string, model: string, tokens: TokenUsage): number {
  const pricing = PRICING[`${provider}:${model}`];
  return (tokens.prompt_tokens * pricing.prompt) + (tokens.completion_tokens * pricing.completion);
}
```

---

# Code Snippets

## Drizzle with RLS

```ts
// Schema with native RLS support
import { pgTable, uuid, text, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole } from 'drizzle-orm/supabase';

export const prompts = pgTable('prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  isPublic: boolean('is_public').default(false),
}, (table) => [
  table.enableRLS(),
  pgPolicy('tenant_isolation', {
    for: 'all',
    to: authenticatedRole,
    using: sql`tenant_id = auth.jwt() ->> 'tenant_id'::uuid OR is_public = true`
  })
]);

// Client initialization
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './database/schema';
const client = postgres(process.env.DATABASE_URL!, { prepare: false }); // pooler-friendly
export const db = drizzle(client, { schema });
```

## Fastify Health Checks

```ts
app.get("/healthz", async () => ({ ok: true }));
app.get("/readyz", async () => ({ db: await pingDb() }));
```

## Migration Workflow

```bash
# 1. Define schema in TypeScript
edit src/database/schema/prompts.ts

# 2. Generate SQL migration
npm run db:generate

# 3. Enhance with Supabase features (RLS, triggers)
npm run db:enhance

# 4. Apply to database
supabase db reset --local
```

---

# Ops Best Practices

## Supabase
- **Vault**: Store tenant LLM keys encrypted; never expose to client
- **RLS**: Auto-generated policies for tenant isolation
- **Backups**: Verify backups, test PITR
- **RLS Tests**: Part of CI (test tenant isolation)

## Observability
- Correlation IDs across requests
- SLOs: p99 API latency, execution success rate, credit balance alerts
- Monitor: Prompt execution rate, LLM provider failures, optimization acceptance rate

## Security
- Never log LLM API keys (even hashed)
- Validate webhook signatures before processing
- Rate limit optimization requests (prevent abuse)
- Sanitize user-provided template variables

---

# Landmines to Sidestep

- **Shoving LLM keys into plain text columns**. Use Vault.
- **Forgetting `prepare: false`** on postgres-js with the pooler, then blaming the database.
- **Writing raw SQL migrations** when Drizzle can generate them. Keep single source of truth.
- **Mixing Supabase migrations with Drizzle migrations**. Use Drizzle + enhancement only.
- **Exposing tenant data across tenants**. RLS is your friend, test it.
- **Caching LLM responses without tenant context**. Can leak data across tenants.

---

# MVP Rollout (2-4 Weeks)

## Week 1-2: Core Functionality
- Drizzle schema + RLS + Vault setup
- Prompt CRUD with versioning
- BYOK: OpenAI + Anthropic key registration
- Execution engine with streaming support
- Feedback collection (async endpoint + webhooks)
- Credit tracking (real-time balance, auto-stop)

## Week 3-4: Optimization & Analytics
- LLM-powered optimization suggestions (manual trigger)
- Analytics dashboard (real-time metrics, historical trends)
- Version comparison UI
- Cost analysis and projections
- Webhook delivery system
- OpenRouter integration for unified LLM access

## Deferred to v2+
- Background jobs (Upstash Workflows)
- Zuplo API gateway
- Cloud Run deployment
- Vector search (pgvector)
- Real-time auto-optimization
- Redis/Upstash caching
- Advanced A/B testing automation
- ML-based optimization models

Ship this and you have: multi-tenant prompt management, BYOK with waterfall, feedback-driven optimization, real-time analytics, and a credit system that actually bills.
