import { EntityCollection } from "@firecms/core";

export type CollectionEditorPermissionsBuilder<UserType = any, EC extends EntityCollection = EntityCollection> = (params: { user: UserType | null, collection?: EC }) => CollectionEditorPermissions;

export type CollectionEditorPermissions = {
    /**
     * Is the user allowed to create new collections.
     */
    createCollections: boolean;

    /**
     * Is the user allowed to modify this collection
     */
    editCollections: boolean;

    /**
     * Is the user allowed to delete this collection
     */
    deleteCollections: boolean;
}
