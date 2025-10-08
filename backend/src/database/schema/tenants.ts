import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgPolicy,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole } from './constants';

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

    /**
     * RLS Policies - Root Tenant Isolation
     * Pattern: id::text = current_setting('app.current_tenant_id', true)
     * Note: Uses 'id' instead of 'tenant_id' because tenants.id IS the tenant_id
     */
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
