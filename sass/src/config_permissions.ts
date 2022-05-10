export type ConfigPermissions = {
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
