import { sql, SQL } from "drizzle-orm";

/**
 * Returns a SQL chunk calling `auth.uid()` — the current user's ID.
 * This is a Supabase-style helper function created in the `auth` schema
 * that reads `app.user_id` set per-transaction by `withAuth()`.
 *
 * @example
 * sql`${table.user_id} = ${authUid()}`
 */
export const authUid = (): SQL => {
    return sql`auth.uid()`;
};

/**
 * Returns a SQL chunk calling `auth.roles()` — the current user's roles
 * as a comma-separated string.
 * Reads `app.user_roles` set per-transaction by `withAuth()`.
 *
 * @example
 * sql`auth.roles() ~ 'admin'`
 */
export const authRoles = (): SQL => {
    return sql`auth.roles()`;
};

/**
 * Returns a SQL chunk calling `auth.jwt()` — the full JWT claims as JSONB.
 * Reads `app.jwt` set per-transaction by `withAuth()`.
 *
 * @example
 * sql`auth.jwt()->>'sub'`
 */
export const authJwt = (): SQL => {
    return sql`auth.jwt()`;
};

/** @deprecated Use {@link authUid} instead. */
export const sqlGetCurrentUser = authUid;

/** @deprecated Use {@link authRoles} instead. */
export const sqlGetCurrentUserRoles = authRoles;
