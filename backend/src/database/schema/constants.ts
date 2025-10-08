import { pgRole } from 'drizzle-orm/pg-core';

/**
 * Database Roles
 * Shared role definitions for RLS policies across all schemas
 */

/**
 * Authenticated user role
 * Used in RLS policies to enforce tenant isolation
 */
export const authenticatedRole = pgRole('authenticated');
