import {
  pgTable,
  uuid,
  boolean,
  text,
  jsonb,
  timestamp,
  pgPolicy,
  pgRole,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { promptExecutions } from './executions';

// Database roles
const authenticatedRole = pgRole('authenticated');

/**
 * Feedback
 * User ratings and comments on prompt executions
 * rating: thumbs up/down (boolean) for simplicity in MVP
 * user_context: session_id, device_type, custom_metadata
 */
export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    executionId: uuid('execution_id')
      .notNull()
      .references(() => promptExecutions.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Feedback data
    rating: boolean('rating').notNull(), // true = thumbs up, false = thumbs down
    commentText: text('comment_text'),
    userContextJsonb: jsonb('user_context_jsonb').$type<{
      sessionId?: string;
      deviceType?: string;
      customMetadata?: Record<string, string | number | boolean | null>;
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Indexes
    index('feedback_execution_id_idx').on(table.executionId),
    index('feedback_tenant_id_idx').on(table.tenantId),
    index('feedback_created_at_idx').on(table.createdAt),

    // RLS Policies - tenant_id filter
    pgPolicy('feedback_select', {
      for: 'select',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('feedback_insert', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('feedback_update', {
      for: 'update',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
      withCheck: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('feedback_delete', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`tenant_id::text = current_setting('app.current_tenant_id', true)`,
    }),
  ],
).enableRLS();
