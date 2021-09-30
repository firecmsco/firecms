import { EntitySchema } from "./entities";
import { EntityCollection, PermissionsBuilder } from "./collections";
import { EntityCallbacks } from "./entity_callbacks";

/**
 * You can add these additional props to override properties in a SchemaResolver
 * @category Models
 */
export interface SchemaConfig<M = any> {

    /**
     * Can the elements in this collection be added and edited.
     */
    permissions?: PermissionsBuilder;

    /**
     * Schema representing the entities of this view
     */
    schema: EntitySchema<M>;

    /**
     * You can add subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollection[];

    /**
     * This interface defines all the callbacks that can be used when an entity
     * is being created, updated or deleted.
     * Useful for adding your own logic or blocking the execution of the operation
     */
    callbacks?: EntityCallbacks<M>;

}

/**
 * Used to override schemas based on the collection path and entityId.
 * @category Models
 */
export type SchemaResolver = (props: {
    entityId?: string,
    path: string
}) => SchemaConfig | undefined;
