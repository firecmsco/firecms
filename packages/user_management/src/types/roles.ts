import { Permissions } from "@firecms/core";

export type Role = {

    /**
     * ID of the role
     */
    id: string;

    /**
     * Name of the role
     */
    name: string;

    /**
     * If this flag is true, the user can perform any action
     */
    isAdmin?: boolean;

    /**
     * Default permissions for all collections for this role.
     * You can override this values at the collection level using
     * {@link collectionPermissions}
     */
    defaultPermissions?: Permissions;

    /**
     * Record of stripped collection ids to their permissions.
     * @see stripCollectionPath
     */
    collectionPermissions?: Record<string, Permissions>;

    config?: {

        createCollections?: boolean;

        editCollections?: boolean | "own";

        deleteCollections?: boolean | "own";
    }
}
