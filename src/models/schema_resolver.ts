import { EntityCollection, EntitySchema, PermissionsBuilder } from "./models";

/**
 * You can add these additional props to override properties in a SchemaResolver
 */
export interface SchemaConfig {

    /**
     * Can the elements in this collection be added and edited.
     */
    permissions?: PermissionsBuilder<any, any>;

    /**
     * Schema representing the entities of this view
     */
    schema: EntitySchema<any>;

    /**
     * Following the Firestore document and collection schema, you can add
     * subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollection[];

}

/**
 * Used to override schemas based on the collection path and entityId.
 * If no schema
 */
export type SchemaResolver = (props: {
    entityId?: string,
    collectionPath: string
}) => SchemaConfig | undefined;
