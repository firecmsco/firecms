import { EntityCollection } from "@firecms/core";

export type CollectionInference = (path: string, collectionGroup: boolean, parentCollectionIds: string[]) => Promise<Partial<EntityCollection> | null>;
