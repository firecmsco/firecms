import { EntityCollection } from "@firecms/core";

export type CollectionInference = (path: string, collectionGroup: boolean, parentCollectionPaths: string[]) => Promise<Partial<EntityCollection> | null>;
