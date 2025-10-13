import { EntityCollection } from "@firecms/core";

/**
 * This function is used to infer the configuration of a collection given its path.
 */
export type CollectionInference = (path: string, collectionGroup: boolean, parentCollectionPaths: string[], databaseId?:string) => Promise<Partial<EntityCollection> | null>;
