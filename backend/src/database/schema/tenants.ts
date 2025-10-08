import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgPolicy,
  pgRole,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Database roles
const authenticatedRole = pgRole('authenticated');

/**
 * Tenants
 * Multi-tenant isolation root - all data is scoped to a tenant
 */
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    plan: text('plan', {
      enum: ['free', 'pro', 'enterprise'],
    })
      .default('free')
      .notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Indexes
    index('tenants_stripe_customer_id_idx').on(table.stripeCustomerId),

    // RLS Policies - Users can only see their own tenant
    pgPolicy('tenants_select', {
      for: 'select',
      to: authenticatedRole,
      using: sql`id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('tenants_insert', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('tenants_update', {
      for: 'update',
      to: authenticatedRole,
      using: sql`id::text = current_setting('app.current_tenant_id', true)`,
      withCheck: sql`id::text = current_setting('app.current_tenant_id', true)`,
    }),
    pgPolicy('tenants_delete', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`id::text = current_setting('app.current_tenant_id', true)`,
    }),
  ],
).enableRLS();
