import { EntityCollection, EntitySchema, PermissionsBuilder } from "../models";
import { removeInitialAndTrailingSlashes } from "../routes/navigation";

export interface SideEntityPanelProps {
    /**
     * Absolute path of the entity
     */
    collectionPath: string;

    /**
     * Id of the entity, if not set, it means we are creating a new entity
     */
    entityId?: string;

    /**
     * Set this flag to true if you want to make a copy of an existing entity
     */
    copy?: boolean;

    /**
     * Open the entity with a selected subcollection view. If the panel for this
     * entity was already open, it is replaced.
     */
    selectedSubcollection?: string;

}

export function getSidePanelKey(collectionPath: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(collectionPath)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(collectionPath);
}

/**
 * You can add these additional props to override properties
 */
export interface SchemaSidePanelProps {

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
}) => SchemaSidePanelProps | undefined;
