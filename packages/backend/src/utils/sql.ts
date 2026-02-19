import { sql, SQL } from "drizzle-orm";

/**
 * Returns a SQL chunk that gets the current user ID from the session configuration.
 * This corresponds to the `firecms.current_user_id` configuration set in the transaction.
 *
 * @returns SQL chunk
 */
export const sqlGetCurrentUser = (): SQL => {
    return sql`current_setting('firecms.current_user_id')`;
};

/**
 * Returns a SQL chunk that gets the current user's roles (comma-separated string)
 * from the session configuration.
 * This corresponds to the `firecms.current_user_roles` configuration set in the transaction.
 *
 * Use with PostgreSQL regex match (~) to check for specific roles:
 * `sql\`${sqlGetCurrentUserRoles()} ~ 'admin'\``
 *
 * @returns SQL chunk
 */
export const sqlGetCurrentUserRoles = (): SQL => {
    return sql`current_setting('firecms.current_user_roles')`;
};

