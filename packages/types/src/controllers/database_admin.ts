/**
 * @module database_admin
 *
 * Re-exports the capability-specific admin interfaces from `@rebasepro/types/backend`.
 * This file is kept for backwards compatibility — new code should import from
 * `@rebasepro/types` directly.
 *
 * @group Admin
 */
export type {
    SQLAdmin,
    DocumentAdmin,
    SchemaAdmin,
    DatabaseAdmin,
    HealthCheckResult,
} from "../types/backend";

export {
    isSQLAdmin,
    isDocumentAdmin,
    isSchemaAdmin,
} from "../types/backend";
