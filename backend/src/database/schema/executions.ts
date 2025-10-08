import {
  pgTable,
  uuid,
  text,
  jsonb,
  numeric,
  integer,
  timestamp,
  pgPolicy,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { prompts, promptVersions } from './prompts';
import { authenticatedRole } from './constants';
import type { JsonValue } from './types';

/**
 * Prompt Executions
 * Tracks every prompt execution with token usage, cost, and performance metrics
 * Retention policy applied based on tenant plan
 */
export const promptExecutions = pgTable(
  'prompt_executions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    versionId: uuid('version_id')
      .notNull()
      .references(() => promptVersions.id, { onDelete: 'cascade' }),

    // Provider info (llm_provider_id will be added in Issue #5)
    llmProviderId: uuid('llm_provider_id'), // Foreign key will be added later
    model: text('model').notNull(), // e.g., 'gpt-4', 'claude-3-opus'

    // Input and output
    inputVariablesJsonb: jsonb('input_variables_jsonb').$type<JsonValue>(),
    responseText: text('response_text').notNull(),
    responseMetadataJsonb: jsonb('response_metadata_jsonb').$type<{
      status?: string;
      finishReason?: string;
      streamingEnabled?: boolean;
    }>(),

    // Usage metrics
    tokenUsageJsonb: jsonb('token_usage_jsonb').$type<{
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>(),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }),
    latencyMs: integer('latency_ms'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Indexes for performance
    index('prompt_executions_tenant_id_idx').on(table.tenantId),
    index('prompt_executions_prompt_id_idx').on(table.promptId),
    index('prompt_executions_version_id_idx').on(table.versionId),
    index('prompt_executions_created_at_idx').on(table.createdAt),
    index('prompt_executions_llm_provider_id_idx').on(table.llmProviderId),

    /**
     * RLS Policies - Standard Tenant Isolation
     * Pattern: tenant_id::text = current_setting('app.current_tenant_id', true)
     * Ensures users can only access executions from their own tenant
     */
    pgPolicy('prompt_executions_select', {
      for: 'select',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('prompt_executions_insert', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('prompt_executions_update', {
      for: 'update',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('prompt_executions_delete', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
  ],
).enableRLS();
