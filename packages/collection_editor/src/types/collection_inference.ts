import { EntityCollection, FilterValues } from "@firecms/core";

/**
 * This function is used to infer the configuration of a collection given its path.
 * @param path - The path of the collection
 * @param collectionGroup - Whether this is a collection group query
 * @param parentCollectionPaths - Array of parent collection paths for subcollections
 * @param databaseId - Optional database ID for multi-database setups
 * @param initialFilter - Optional filter values from the collection configuration
 * @param initialSort - Optional sort configuration from the collection
 */
export type CollectionInference = (
    path: string,
    collectionGroup: boolean,
    parentCollectionPaths: string[],
    databaseId?: string,
    initialFilter?: FilterValues<string>,
    initialSort?: [string, "asc" | "desc"]
) => Promise<Partial<EntityCollection> | null>;
