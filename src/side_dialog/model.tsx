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

