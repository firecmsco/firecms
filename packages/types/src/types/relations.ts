import type { EntityCollection } from "./collections";

/**
 * @group Models
 */
export type OnAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

/**
 * Represents a one() relation - equivalent to Drizzle's one() function
 * Used for one-to-one and many-to-one relationships.
 *  * e.g., In a Post-Author relationship, this would be defined on the Post
 *  * collection to link its `author_id` field to the Author's `id`.
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
     * The field in the target collection that references back to this collection.
     * This is the foreign key field in the target collection.
     * @example "maquinaria_id" or "maquinariaId"
     */
    targetForeignKey?: string;
    /**
     * The field in this collection that the foreign key references.
     * Usually the primary key. Defaults to the idField of this collection.
     * @example "id"
     */
    localKey?: string;
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
         * Junction table name.
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
 * Represents a relation that traverses through multiple collections
 * For cases like maquinaria -> alquileres -> incidencias
 * @group Models
 */
export interface ThroughRelation {

    type: "through";
    /**
     * Target collection this relation points to
     */
    target: () => EntityCollection;
    /**
     * Path of collections and properties to traverse
     */
    through: {
        /**
         * Junction table name.
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
    }[];
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Base relation type that covers SQL relation patterns
 * @group Models
 */
export type BaseRelation =
    | OneRelation
    | ManyRelation
    | ManyToManyRelation
    | ThroughRelation

/**
 * Extended relation that combines base relation with FireCMS UI config
 * @group Models
 */
export type Relation = BaseRelation & {
    /**
     * Override target collection configuration for UI purposes
     */
    collection?: Partial<EntityCollection>;

    validation?:{
        required?: boolean;
    }

};
