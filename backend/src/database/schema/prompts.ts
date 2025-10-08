import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgPolicy,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { authenticatedRole } from './constants';
import type { JsonValue } from './types';

/**
 * Prompts
 * Template prompts with variable support ({{variable_name}})
 * Tenant-isolated with optional public/shared marketplace
 */
export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Indexes
    index('prompts_tenant_id_idx').on(table.tenantId),
    index('prompts_is_public_idx').on(table.isPublic),

    /**
     * RLS Policies - Tenant Isolation with Public Sharing
     * Pattern: tenant_id::text = current_setting('app.current_tenant_id', true) OR is_public = true
     * Allows users to see their own prompts plus any public prompts from other tenants
     */
    pgPolicy('prompts_select', {
      for: 'select',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true) OR is_public = true`,
    }),
    pgPolicy('prompts_insert', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('prompts_update', {
      for: 'update',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('prompts_delete', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
  ],
).enableRLS();

/**
 * Prompt Versions
 * Full version history with diffs and branching support
 * metadata: optimization_type, model_specific_variants, performance_notes
 */
export const promptVersions = pgTable(
  'prompt_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    content: text('content').notNull(),
    metadataJsonb: jsonb('metadata_jsonb').$type<{
      optimizationType?: string;
      modelSpecificVariants?: JsonValue;
      performanceNotes?: string;
    }>(),
    parentVersionId: uuid('parent_version_id'), // Self-reference for branching
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Indexes
    index('prompt_versions_prompt_id_idx').on(table.promptId),
    index('prompt_versions_version_number_idx').on(table.versionNumber),
    index('prompt_versions_parent_version_id_idx').on(table.parentVersionId),
    // Composite index for common lookup pattern: "Get version N of prompt X"
    index('prompt_versions_prompt_version_idx').on(
      table.promptId,
      table.versionNumber,
    ),

    // Self-reference for branching
    foreignKey({
      columns: [table.parentVersionId],
      foreignColumns: [table.id],
      name: 'prompt_versions_parent_version_id_fkey',
    }),

    /**
     * RLS Policies - Nested Through Parent Prompt
     * Pattern: EXISTS subquery checking parent prompt's tenant_id
     * Inherits tenant isolation from parent prompts table
     * Note: SELECT allows public prompts, but INSERT/UPDATE/DELETE require tenant ownership
     */
    pgPolicy('prompt_versions_select', {
      for: 'select',
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND (prompts.tenant_id::text = current_setting('app.current_tenant_id', true) OR prompts.is_public = true)
      )`,
    }),
    pgPolicy('prompt_versions_insert', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      )`,
    }),
    pgPolicy('prompt_versions_update', {
      for: 'update',
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      )`,
      withCheck: sql`EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      )`,
    }),
    pgPolicy('prompt_versions_delete', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM prompts 
        WHERE prompts.id = prompt_versions.prompt_id 
        AND prompts.tenant_id::text = current_setting('app.current_tenant_id', true)
      )`,
    }),
  ],
).enableRLS();
