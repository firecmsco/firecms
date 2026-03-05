

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
     * Permissions related to editing the collections
     */
    config?: {

        createCollections?: boolean;

        editCollections?: boolean | "own";

        deleteCollections?: boolean | "own";
    }
}
