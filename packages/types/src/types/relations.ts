import { EntityCollection } from "./collections";

/**
 * @group Models
 */
export type OnAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

/**
 * Extended relation that combines base relation with FireCMS UI config
 * @group Models
 */
export interface Relation {
    /**
     * The application-level name for this relationship.
     * If not provided, it will be inferred from the target collection path.
     * @example "posts"
     */
    relationName?: string;

    /**
     * The final collection you want to retrieve records from.
     */
    target: () => EntityCollection;

    /**
     * The nature of the relationship, determining if one or many records are returned.
     */
    cardinality: "one" | "many";

    /**
     * Which side owns the persistence for this relationship.
     * - "owning": The foreign key (for one-to-one/many-to-one) or the junction table (for many-to-many) is managed by this collection.
     * - "inverse": The foreign key is on the target collection's table. This side of the relation is typically read-only.
     * Defaults to "owning".
     */
    direction?: "owning" | "inverse";

    /**
     * Column on THIS table that stores the foreign key to the target.
     * Required when `direction` is "owning" and `cardinality` is "one".
     * @example "author_id"
     */
    localKey?: string;

    /**
     * Column on the TARGET table that stores the foreign key to this entity.
     * Required when `direction` is "inverse".
     * @example "post_id"
     */
    foreignKeyOnTarget?: string;

    /**
     * Defines the junction table for a many-to-many relationship.
     * Required when `cardinality` is "many" and `direction` is "owning".
     *
     * @example Simple many-to-many between Users and Roles:
     * ```typescript
     * // Users collection
     * {
     *   relations: [{
     *     relationName: "roles",
     *     target: () => rolesCollection,
     *     cardinality: "many",
     *     through: {
     *       table: "user_roles",        // Junction table name
     *       sourceColumn: "user_id",    // Column that references this collection's ID
     *       targetColumn: "role_id"     // Column that references target collection's ID
     *     }
     *   }]
     * }
     *
     * // This creates a junction table like:
     * // CREATE TABLE user_roles (
     * //   user_id INTEGER REFERENCES users(id),
     * //   role_id INTEGER REFERENCES roles(id),
     * //   PRIMARY KEY (user_id, role_id)
     * // );
     * ```
     *
     * @example Many-to-many with additional junction table data:
     * ```typescript
     * // Students and Courses with enrollment date
     * {
     *   relations: [{
     *     relationName: "courses",
     *     target: () => coursesCollection,
     *     cardinality: "many",
     *     through: {
     *       table: "enrollments",
     *       sourceColumn: "student_id",
     *       targetColumn: "course_id"
     *     }
     *   }]
     * }
     *
     * // Junction table can have additional columns:
     * // CREATE TABLE enrollments (
     * //   student_id INTEGER REFERENCES students(id),
     * //   course_id INTEGER REFERENCES courses(id),
     * //   enrolled_at TIMESTAMP DEFAULT NOW(),
     * //   grade VARCHAR(2),
     * //   PRIMARY KEY (student_id, course_id)
     * // );
     * ```
     */
    through?: {
        table: string;
        sourceColumn: string; // FK to "this" collection's PK
        targetColumn: string; // FK to the target collection's PK
    };

    /**
     * An explicit, ordered array of JOINs to perform to get from the source
     * to the target. Used for multi-hop relations, composite keys, or when you need
     * fine-grained control over the join logic.
     *
     * When `joinPath` is provided, it overrides all other relation configuration
     * (localKey, foreignKeyOnTarget, through) and gives you complete control
     * over how tables are joined together.
     *
     * @example Simple one-to-one join (equivalent to localKey):
     * ```typescript
     * // Posts -> Authors relationship
     * {
     *   relationName: "author",
     *   target: () => authorsCollection,
     *   cardinality: "one",
     *   joinPath: [
     *     {
     *       table: "authors",
     *       on: {
     *         from: "author_id",  // Column on posts table
     *         to: "id"           // Column on authors table
     *       }
     *     }
     *   ]
     * }
     *
     * // Generates: SELECT * FROM posts JOIN authors ON posts.author_id = authors.id
     * ```
     *
     * @example Multi-hop relationship (3 tables):
     * ```typescript
     * // Users -> Permissions through Roles
     * {
     *   relationName: "permissions",
     *   target: () => permissionsCollection,
     *   cardinality: "many",
     *   joinPath: [
     *     {
     *       table: "user_roles",
     *       on: {
     *         from: "id",        // users.id
     *         to: "user_id"      // user_roles.user_id
     *       }
     *     },
     *     {
     *       table: "roles",
     *       on: {
     *         from: "role_id",   // user_roles.role_id
     *         to: "id"          // roles.id
     *       }
     *     },
     *     {
     *       table: "role_permissions",
     *       on: {
     *         from: "id",        // roles.id
     *         to: "role_id"      // role_permissions.role_id
     *       }
     *     },
     *     {
     *       table: "permissions",
     *       on: {
     *         from: "permission_id", // role_permissions.permission_id
     *         to: "id"              // permissions.id
     *       }
     *     }
     *   ]
     * }
     *
     * // Generates:
     * // SELECT * FROM users
     * // JOIN user_roles ON users.id = user_roles.user_id
     * // JOIN roles ON user_roles.role_id = roles.id
     * // JOIN role_permissions ON roles.id = role_permissions.role_id
     * // JOIN permissions ON role_permissions.permission_id = permissions.id
     * ```
     *
     * @example Composite key relationship:
     * ```typescript
     * // Orders -> Customer by company_code + region
     * {
     *   relationName: "customer",
     *   target: () => customersCollection,
     *   cardinality: "one",
     *   joinPath: [
     *     {
     *       table: "customers",
     *       on: {
     *         from: ["company_code", "region_id"], // Multiple columns from orders
     *         to: ["code", "region_id"]            // Multiple columns on customers
     *       }
     *     }
     *   ]
     * }
     *
     * // Generates:
     * // SELECT * FROM orders
     * // JOIN customers ON orders.company_code = customers.code
     * //               AND orders.region_id = customers.region_id
     * ```
     *
     * @example Self-referencing with intermediate table:
     * ```typescript
     * // Users -> Friends (many-to-many self-reference)
     * {
     *   relationName: "friends",
     *   target: () => usersCollection, // Same collection
     *   cardinality: "many",
     *   joinPath: [
     *     {
     *       table: "friendships",
     *       on: {
     *         from: "id",         // users.id
     *         to: "user_id"       // friendships.user_id
     *       }
     *     },
     *     {
     *       table: "users",
     *       on: {
     *         from: "friend_id",  // friendships.friend_id
     *         to: "id"           // users.id (target)
     *       }
     *     }
     *   ]
     * }
     * ```
     *
     * @example Complex business logic join:
     * ```typescript
     * // Products -> Active Suppliers (only current, non-expired contracts)
     * {
     *   relationName: "activeSuppliers",
     *   target: () => suppliersCollection,
     *   cardinality: "many",
     *   joinPath: [
     *     {
     *       table: "product_supplier_contracts",
     *       on: {
     *         from: "id",           // products.id
     *         to: "product_id"      // contracts.product_id
     *       }
     *     },
     *     {
     *       table: "suppliers",
     *       on: {
     *         from: "supplier_id",  // contracts.supplier_id
     *         to: "id"             // suppliers.id
     *       }
     *     }
     *   ]
     *   // Note: Additional WHERE conditions for active/non-expired
     *   // would be handled in the query logic, not in joinPath
     * }
     * ```
     */
    joinPath?: JoinStep[];

    /**
     * Action to perform on update.
     */
    onUpdate?: OnAction;
    /**
     * Action to perform on delete.
     */
    onDelete?: OnAction;

    overrides?: Partial<EntityCollection>;

    validation?:{
        required?: boolean;
    }
}

/**
 * Defines a single, explicit step in a multi-join path.
 *
 * Each step represents one JOIN operation in the sequence. The `from` columns
 * refer to the previous table in the chain (or the source table for the first step),
 * and the `to` columns refer to the current table being joined.
 *
 * @example Single column join:
 * ```typescript
 * {
 *   table: "authors",
 *   on: {
 *     from: "author_id",  // Column from previous table (e.g., posts.author_id)
 *     to: "id"           // Column from current table (authors.id)
 *   }
 * }
 * ```
 *
 * @example Multi-column composite key join:
 * ```typescript
 * {
 *   table: "order_items",
 *   on: {
 *     from: ["order_id", "store_id"],    // Multiple columns from previous table
 *     to: ["order_id", "store_id"]       // Corresponding columns in current table
 *   }
 * }
 * ```
 */
export interface JoinStep {
    /**
     * The database table name to join TO in this step.
     * This is the table you're joining into, not the table you're joining from.
     *
     * @example "authors", "user_roles", "product_categories"
     */
    table: string;

    /**
     * The join condition for this step. Defines how the previous table
     * connects to the current table.
     *
     * - `from`: Column name(s) on the PREVIOUS table in the join chain
     * - `to`: Column name(s) on the CURRENT table (specified in `table`)
     *
     * For the first step, `from` refers to the source collection's table.
     * For subsequent steps, `from` refers to the table from the previous step.
     *
     * Both `from` and `to` support:
     * - Single column: `"user_id"`
     * - Multiple columns: `["company_id", "region_id"]` for composite keys
     *
     * When using arrays, both `from` and `to` must have the same length,
     * and columns are matched by position (index 0 with index 0, etc.).
     */
    on: {
        from: string | string[];
        to: string | string[];
    };
}
