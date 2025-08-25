import type { EntityCollection } from "./collections";

/**
 * @group Models
 */
export type OnAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

/**
 * Represents a one() relation - equivalent to Drizzle's one() function
 * Used for one-to-one and many-to-one relationships
 * @group Models
 */
export interface OneRelation {
    type: "one";
    /**
     * Target collection this relation points to
     */
    target: () => EntityCollection;
    /**
     * The field(s) in the source entity that hold the foreign key.
     * These property names must exist in the source collection's properties.
     * @example ["customerId"]
     */
    sourceFields: string[];
    /**
     * The field(s) in the target entity that are referenced by the foreign key.
     * These property names must exist in the target collection's properties.
     * Usually this is the primary key of the target collection.
     * @example ["id"]
     */
    targetFields: string[];
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
    /**
     * Action to perform on update.
     */
    onUpdate?: OnAction;
    /**
     * Action to perform on delete.
     */
    onDelete?: OnAction;
}

/**
 * Represents a many() relation - equivalent to Drizzle's many() function
 * Used for one-to-many relationships (WITHOUT intermediate table)
 * @group Models
 */
export interface ManyRelation {
    type: "many";
    /**
     * Target collection this relation points to
     */
    target: () => EntityCollection;
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Represents a many-to-many relation through an intermediate/junction table
 * This is the most complex relation type covering junction table scenarios
 * @group Models
 */
export interface ManyToManyRelation {
    type: "manyToMany";
    /**
     * Target collection this relation points to
     */
    target: () => EntityCollection;
    /**
     * Junction/intermediate table configuration
     */
    through?: {
        /**
         * Override for the junction table name.
         * If not provided, the name is inferred from the `table` collection.
         */
        dbPath: string;
        /**
         * Foreign key in junction table that references this collection
         */
        sourceJunctionKey: string | string[];
        /**
         * Foreign key in junction table that references the target collection
         */
        targetJunctionKey: string | string[];
        /**
         * Action to perform on source delete.
         */
        onSourceDelete?: OnAction;
        /**
         * Action to perform on target delete.
         */
        onTargetDelete?: OnAction;
    };
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}


/**
 * Base relation type that covers ALL PostgreSQL relation patterns
 * @group Models
 */
export type BaseRelation =
    | OneRelation
    | ManyRelation
    | ManyToManyRelation

/**
 * Extended relation that combines base relation with FireCMS UI config
 * @group Models
 */
export type Relation = BaseRelation & {
    /**
     * Override target collection configuration for UI purposes
     */
    collection?: Partial<EntityCollection>;

    /**
     * How to render this relation in the UI
     */
    widget?: "select" | "subcollection" | "table";

    /**
     * For hierarchical/self relations: how deep to load the tree
     */
    maxDepth?: number;

    validation?: {
        required?: boolean;
    }

};

/**
 * Collection relations object - comprehensive relation definitions
 * @group Models
 */
export type CollectionRelations = Record<string, Relation>;
