# Database Architecture

Multi-tenant PostgreSQL database with Row Level Security (RLS) enforced through Drizzle ORM TypeScript schemas.

## Overview

**Stack**:
- PostgreSQL 15+ (via Supabase)
- Drizzle ORM with TypeScript schema definitions
- Row Level Security (RLS) for multi-tenant isolation
- JSONB for flexible metadata storage

**Key Principles**:
- Multi-tenancy: ALL tables have `tenant_id` with RLS policies
- Type Safety: JSONB fields use TypeScript types (`$type<T>()`)
- Declarative Configuration: RLS policies defined inline with `pgPolicy()`
- Schema-First Migrations: TypeScript schema → SQL generation → Supabase

**Database Location**: Local Supabase instance (MVP), cloud Supabase (production)

---

## Tables

### Tenants (Root)

**Purpose**: Multi-tenant isolation root - all data scoped to tenant

**Schema**: `backend/src/database/schema/tenants.ts:16-61`

**Columns**:
- `id` (uuid, PK): Tenant identifier
- `name` (text): Tenant display name
- `plan` (enum): Subscription tier (free, pro, enterprise)
- `stripeCustomerId` (text): Stripe customer reference
- `createdAt`, `updatedAt` (timestamp): Audit timestamps

**Indexes**:
- `tenants_stripe_customer_id_idx` on `stripeCustomerId`

**RLS Pattern**: Root tenant isolation (see RLS Patterns section)

**Special Case**: Uses `id` instead of `tenant_id` for RLS because `tenants.id` IS the tenant_id

---

### Prompts & Prompt Versions

**Purpose**: Template prompts with variable support and full version history

**Schema**: 
- Prompts: `backend/src/database/schema/prompts.ts:23-68`
- Versions: `backend/src/database/schema/prompts.ts:75-158`

**Prompts Table**:
- `id` (uuid, PK): Prompt identifier
- `tenantId` (uuid, FK): Owner tenant
- `name`, `description` (text): Prompt metadata
- `isPublic` (boolean): Public marketplace sharing

**Prompt Versions Table**:
- `id` (uuid, PK): Version identifier
- `promptId` (uuid, FK): Parent prompt
- `versionNumber` (integer): Incremental version
- `content` (text): Prompt template with `{{variable}}` support
- `metadataJsonb` (jsonb): Optimization type, model variants, notes
- `parentVersionId` (uuid, self-FK): Version branching support

**Indexes**:
- Prompts: `prompts_tenant_id_idx`, `prompts_is_public_idx`
- Versions: `prompt_versions_prompt_id_idx`, `prompt_versions_version_number_idx`, `prompt_versions_parent_version_id_idx`
- **Composite**: `prompt_versions_prompt_version_idx` on (prompt_id, version_number) for "Get version N of prompt X" queries

**RLS Patterns**:
- Prompts: Tenant isolation with public sharing (see RLS Patterns section)
- Versions: Nested through parent prompt (see RLS Patterns section)

**Version Branching**: `parentVersionId` enables experimental version forks

---

### Prompt Executions

**Purpose**: Track every prompt execution with token usage, cost, and performance metrics

**Schema**: `backend/src/database/schema/executions.ts:23-96`

**Columns**:
- `id` (uuid, PK): Execution identifier
- `tenantId`, `promptId`, `versionId` (uuid, FK): Relationships
- `llmProviderId` (uuid): Provider reference (FK added in Issue #5)
- `model` (text): LLM model identifier (gpt-4, claude-3-opus)
- `inputVariablesJsonb` (jsonb): Variable substitutions (type: `JsonValue`)
- `responseText` (text): LLM response
- `responseMetadataJsonb` (jsonb): Status, finish reason, streaming flag
- `tokenUsageJsonb` (jsonb): Prompt/completion/total tokens
- `costUsd` (numeric): Execution cost
- `latencyMs` (integer): Response time

**Indexes**: `prompt_executions_tenant_id_idx`, `prompt_executions_prompt_id_idx`, `prompt_executions_version_id_idx`, `prompt_executions_created_at_idx`, `prompt_executions_llm_provider_id_idx`

**RLS Pattern**: Standard tenant isolation (see RLS Patterns section)

**Retention Policy**: Applied based on tenant plan (implementation in future issue)

---

### Feedback

**Purpose**: User ratings and comments on prompt executions

**Schema**: `backend/src/database/schema/feedback.ts:23-80`

**Columns**:
- `id` (uuid, PK): Feedback identifier
- `executionId`, `tenantId` (uuid, FK): Relationships
- `rating` (boolean): true = thumbs up, false = thumbs down
- `commentText` (text): Optional user comment
- `userContextJsonb` (jsonb): Session ID, device type, custom metadata (type: `JsonValue`)

**Indexes**: 
- `feedback_execution_id_idx`, `feedback_tenant_id_idx`, `feedback_created_at_idx`
- **Analytics**: `feedback_rating_idx` on `rating` for thumbs up/down count queries

**RLS Pattern**: Standard tenant isolation (see RLS Patterns section)

---

## RLS Patterns

All tables use PostgreSQL Row Level Security with policies defined inline via Drizzle's `pgPolicy()`.

### Standard Tenant Isolation

**Pattern**: `tenant_id::text = current_setting('app.current_tenant_id', true)`

**Used in**: prompts, prompt_executions, feedback

**How it works**:
1. Backend middleware sets session variable: `SET LOCAL app.current_tenant_id = ${tenantId}`
2. RLS policies automatically filter queries by current tenant
3. Type coercion (`::text`) matches session variable (text) with UUID column

**Example** (feedback.ts:58-78):
```typescript
pgPolicy('feedback_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
})
```

**CRUD Operations**: All policies (select, insert, update, delete) use same pattern for consistency

---

### Root Tenant Pattern

**Pattern**: `id::text = current_setting('app.current_tenant_id', true)`

**Used in**: tenants table only

**Special Case**: Uses `id` instead of `tenant_id` because `tenants.id` IS the tenant_id

**Example** (tenants.ts:39-59):
```typescript
pgPolicy('tenants_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`id::text = current_setting('app.current_tenant_id', true)`,
})
```

**Why Different**: Prevents circular reference where tenants would need `tenant_id` to reference itself

---

### Nested RLS Pattern

**Pattern**: EXISTS subquery checking parent table's tenant_id

**Used in**: prompt_versions (inherits isolation from parent prompts table)

**How it works**:
1. Subquery checks if parent prompt exists AND matches tenant OR is public
2. SELECT allows public prompts, INSERT/UPDATE/DELETE require ownership
3. Nested isolation ensures child records follow parent access rules

**Example** (prompts.ts:116-156):
```typescript
pgPolicy('prompt_versions_select', {
  for: 'select',
  to: authenticatedRole,
  using: sql`EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_versions.prompt_id 
    AND (prompts.tenant_id::text = current_setting('app.current_tenant_id', true) OR prompts.is_public = true)
  )`,
})
```

**Public Sharing Consideration**: SELECT allows public prompts, but write operations require tenant ownership to prevent unauthorized modifications

---

### Security Considerations

**Session Variable Validation**:
- `current_setting('app.current_tenant_id', true)` uses "missing_ok" flag (second parameter)
- Returns NULL if variable not set (fails RLS check)
- Prevents unauthorized access if middleware fails

**Type Coercion**:
- `tenant_id::text` converts UUID to text for comparison
- Session variables are always text type in PostgreSQL
- Ensures type-safe comparison without implicit conversions

**SQL Injection Prevention**:
- Drizzle's `sql` template tag parameterizes queries
- Session variable set via prepared statements in middleware
- RLS policies compiled into PostgreSQL query plan (not dynamic SQL)

**Authenticated Role**:
- Shared constant: `backend/src/database/schema/constants.ts:11`
- All policies target this role for consistency
- Supabase authentication maps users to this role

---

## JSONB Patterns

### Shared Types

**Location**: `backend/src/database/schema/types.ts`

**JsonPrimitive** (lines 5-6):
```typescript
export type JsonPrimitive = string | number | boolean | null;
```

**JsonValue** (lines 8-11):
```typescript
export type JsonValue = Record<string, JsonPrimitive>;
```
- Use for: User-provided key-value data (prompt variables, custom metadata)
- Example: `inputVariablesJsonb` in executions table

**JsonMetadata** (lines 13-16):
```typescript
export type JsonMetadata = Record<string, JsonPrimitive | undefined>;
```
- Use for: Structured metadata with optional fields
- Example: `metadataJsonb` in prompt_versions table

### Type Safety Guidelines

**Always use `.$type<T>()`** on JSONB columns:
```typescript
// ✅ GOOD - Type-safe with shared type
inputVariablesJsonb: jsonb('input_variables_jsonb').$type<JsonValue>(),

// ❌ BAD - No type safety
inputVariablesJsonb: jsonb('input_variables_jsonb'),

// ❌ BAD - Inline type duplication
inputVariablesJsonb: jsonb('input_variables_jsonb').$type<Record<string, string>>(),
```

**Structured Metadata** (optional fields):
```typescript
responseMetadataJsonb: jsonb('response_metadata_jsonb').$type<{
  status?: string;
  finishReason?: string;
  streamingEnabled?: boolean;
}>(),
```

**Schema Evolution**:
- Add optional fields to types without breaking existing data
- Use TypeScript optional properties (`?`) for new fields
- JSONB allows missing keys without schema migration

---

## Migration Workflow

**5-Step Process** for schema changes:

### 1. Define Schema in TypeScript

Edit Drizzle schema files in `backend/src/database/schema/`:
```typescript
export const myTable = pgTable('my_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  // ...
}, (table) => [
  pgPolicy('my_table_select', {
    for: 'select',
    to: authenticatedRole,
    using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
  }),
]).enableRLS();
```

### 2. Generate SQL Migration

```bash
cd backend
npm run db:generate
```

- Drizzle analyzes schema changes
- Generates SQL migration in `backend/drizzle/` with timestamp prefix
- Prompts for migration name

### 3. Copy to Supabase Migrations

```bash
npm run db:copy
```

- Copies latest migration from `backend/drizzle/` to `supabase/migrations/`
- Supabase CLI applies migrations from this directory
- Script location: `backend/scripts/copy-migrations.ts`

### 4. Apply to Local Supabase

```bash
supabase db reset --local
```

- Drops local database
- Reapplies ALL migrations in order
- Seeds database with `supabase/seed.sql`

### 5. Verify in Database

**Via Supabase Studio** (http://127.0.0.1:54323):
- Check table structure
- Verify RLS policies enabled
- Test policies with SQL Editor

**Via psql**:
```bash
docker exec -it $(docker ps -q --filter name=supabase-db) psql -U postgres
\d my_table               -- Show table structure
SELECT * FROM pg_policies WHERE tablename = 'my_table';  -- Show RLS policies
```

---

## Index Strategy

### Tenant Isolation Performance

**Rule**: ALWAYS index `tenant_id` on multi-tenant tables

**Rationale**: RLS policies filter every query by `tenant_id`, so index is critical for performance

**Example**:
```typescript
index('prompts_tenant_id_idx').on(table.tenantId),
```

### Foreign Key Performance

**Rule**: Index all foreign key columns

**Rationale**: Join queries, cascade deletes, and referential integrity checks use these columns

**Example**:
```typescript
index('feedback_execution_id_idx').on(table.executionId),
```

### Query Pattern Optimization

**Composite Indexes** for multi-column queries:
```typescript
// Common pattern: "Get version N of prompt X"
index('prompt_versions_prompt_version_idx').on(
  table.promptId,
  table.versionNumber,
),
```

**Analytics Indexes** for aggregation queries:
```typescript
// Pattern: "Count thumbs up/down" or "GROUP BY rating"
index('feedback_rating_idx').on(table.rating),
```

### Index Maintenance

- Review query logs to identify slow queries
- Use `EXPLAIN ANALYZE` to verify index usage
- Add indexes for JOIN columns and WHERE clauses
- Avoid over-indexing (each index adds write overhead)

---

## Cascade Delete Behavior

**Cascade Rules** defined via `onDelete` in foreign key references:

### Tenant Deletion
```typescript
tenantId: uuid('tenant_id')
  .notNull()
  .references(() => tenants.id, { onDelete: 'cascade' }),
```

**Impact**: Deleting tenant cascades to:
- prompts → prompt_versions (nested cascade)
- prompt_executions
- feedback

### Prompt Deletion
```typescript
promptId: uuid('prompt_id')
  .notNull()
  .references(() => prompts.id, { onDelete: 'cascade' }),
```

**Impact**: Deleting prompt cascades to:
- prompt_versions
- prompt_executions → feedback (nested cascade)

### Execution Deletion
```typescript
executionId: uuid('execution_id')
  .notNull()
  .references(() => promptExecutions.id, { onDelete: 'cascade' }),
```

**Impact**: Deleting execution cascades to:
- feedback

### Cascade Chain Example

```
Tenant Deletion
  ↓ cascade
  Prompts
    ↓ cascade (nested)
    Prompt Versions
    ↓ cascade
    Executions
      ↓ cascade (nested)
      Feedback
```

**Soft Delete Considerations**:
- Current implementation: Hard deletes with cascades
- Future enhancement: Add `deletedAt` timestamp for soft deletes
- RLS policies would need `AND deletedAt IS NULL` clause

---

## Local Development Setup

**Start Supabase**:
```bash
supabase start  # Start all services (DB, Auth, Storage, etc.)
```

**Reset Database**:
```bash
supabase db reset --local  # Drop + reapply all migrations + seed
```

**Check Status**:
```bash
supabase status  # Show service URLs and credentials
```

**Access Database**:
- Studio UI: http://127.0.0.1:54323
- PostgreSQL: postgresql://postgres:postgres@127.0.0.1:54322/postgres

**Environment**:
- Database port: 54322 (not default 5432 to avoid conflicts)
- Studio port: 54323
- Project ID: `leadroom-promptops`

---

## Production Deployment (Future)

**Migration Process**:
1. Commit migrations to git
2. CI/CD applies migrations to staging Supabase project
3. Run integration tests against staging
4. Apply migrations to production Supabase project
5. Monitor error rates and rollback if needed

**Rollback Strategy**:
- Supabase stores migration history
- Can revert to previous migration via `supabase db reset --db-url <prod-url> --version <timestamp>`
- Test rollback in staging before production

**Zero-Downtime Migrations**:
- Add columns as optional (nullable) first
- Backfill data in background
- Add NOT NULL constraint in separate migration
- Never rename columns (add new + copy data + drop old)
