import { EntityCollection, EntitySchema } from "../models";

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

/**
 * You can add these additional props to override properties
 */
export interface SchemaSidePanelProps {

    /**
     * Can the elements in this collection be added and edited. Defaults to `true`
     */
    editEnabled?: boolean;

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
