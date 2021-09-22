import { EntitySchema } from "./entities";
import { EntityCollection, PermissionsBuilder } from "./collections";

/**
 * You can add these additional props to override properties in a SchemaResolver
 * @category Models
 */
export interface SchemaConfig {

    /**
     * Can the elements in this collection be added and edited.
     */
    permissions?: PermissionsBuilder;

    /**
     * Schema representing the entities of this view
     */
    schema: EntitySchema;

    /**
     * You can add subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollection[];

}

/**
 * Used to override schemas based on the collection path and entityId.
 * @category Models
 */
export type SchemaResolver = (props: {
    entityId?: string,
    path: string
}) => SchemaConfig | undefined;
