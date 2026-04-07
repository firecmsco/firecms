import { EntityCollection, EntityReference } from "../types";

/**
 * Controller that provides access to the registered entity collections.
 * @group Models
 */
export type CollectionRegistryController<EC extends EntityCollection = EntityCollection<any>> = {

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[];

    /**
     * Is the registry ready to be used
     */
    initialised: boolean;

    /**
     * Get the collection configuration for a given path.
     * The collection is resolved from the given path or alias.
     */
    getCollection: (slugOrPath: string, includeUserOverride?: boolean) => EC | undefined;

    /**
     * Get the raw, un-normalized collection configuration.
     * This bypasses the `CollectionRegistry` normalization (such as injecting `relation` instances).
     * This is strictly for the Visual Editor to manipulate AST code without persisting runtime state.
     */
    getRawCollection: (slugOrPath: string) => EC | undefined;

    /**
     * Retrieve all the related parent references for a given path
     * @param path
     */
    getParentReferencesFromPath: (path: string) => EntityReference[];

    /**
     * Retrieve all the related parent collection ids for a given path
     * @param path
     */
    getParentCollectionIds: (path: string) => string[];

    /**
     * Resolve paths from a list of ids
     * @param ids
     */
    convertIdsToPaths: (ids: string[]) => string[];

};
