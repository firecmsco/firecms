import { EntityCollection } from "@firecms/core";

export type CollectionInference = (path: string, collectionGroup: boolean, parentPathSegments: string[]) => Promise<EntityCollection | null>;
