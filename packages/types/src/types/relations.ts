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
     */
    through?: {
        table: string;
        sourceColumn: string; // FK to "this" collection's PK
        targetColumn: string; // FK to the target collection's PK
    };

    /**
     * An explicit, ordered array of JOINs to perform to get from the source
     * collection to the `targetTable`.
     * This is an advanced feature for multi-hop relations and overrides the automatic join inference
     * from `localKey`, `foreignKeyOnTarget`, and `through`.
     */
    joins?: JoinCondition[];

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
 * Defines a single, explicit JOIN condition between two tables.
 */
export interface JoinCondition {
    /**
     * The database table name to join.
     * @example "posts"
     */
    table: string;

    /**
     * The column on the SOURCE table for this join.
     * (For the first join, the source is the collection where the relation is defined).
     * @example "authors.id" or "id"
     */
    sourceColumn: string;

    /**
     * The column on the TARGET table for this join (the `table` specified above).
     * @example "posts.author_id" or "author_id"
     */
    targetColumn: string;
}
