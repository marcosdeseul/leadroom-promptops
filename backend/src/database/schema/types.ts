/**
 * Database Schema Type Definitions
 * Shared TypeScript types for JSONB fields across schemas
 */

/**
 * Primitive JSON values that can be stored in JSONB columns
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Generic JSON object with primitive values
 * Use for user-provided key-value data like prompt variables or custom metadata
 *
 * @example
 * ```typescript
 * // Prompt execution variables
 * const variables: JsonValue = {
 *   userName: "Alice",
 *   count: 42,
 *   enabled: true,
 *   optional: null
 * };
 * ```
 */
export type JsonValue = Record<string, JsonPrimitive>;

/**
 * Metadata object allowing undefined values for optional fields
 * Use for structured metadata where not all fields are required
 *
 * @example
 * ```typescript
 * const metadata: JsonMetadata = {
 *   optimizationType: "clarity",
 *   performanceScore: 8.5,
 *   notes: undefined  // Optional field
 * };
 * ```
 */
export type JsonMetadata = Record<string, JsonPrimitive | undefined>;
