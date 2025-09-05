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
     * An explicit, ordered array of JOINs to perform to get from the source
     * collection to the `targetTable`.
     * If not provided, it will be inferred from the target collection path.
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
