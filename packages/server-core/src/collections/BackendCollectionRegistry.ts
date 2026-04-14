import { CollectionRegistry } from "@rebasepro/common";
import { CollectionRegistryInterface } from "../db/interfaces";
import { EntityCollection } from "@rebasepro/types";

/**
 * Backend-agnostic collection registry.
 * Satisfies CollectionRegistryInterface through inheritance from CollectionRegistry.
 */
export class BackendCollectionRegistry extends CollectionRegistry implements CollectionRegistryInterface {

    /**
     * Get the available relation keys for a given collection path.
     * Maps from the collection's relation property names to the relation names.
     */
    getRelationKeysForCollection(collectionPath: string): string[] {
        const collection = this.getCollectionByPath(collectionPath) as (EntityCollection & { relations?: any[] }) | undefined;
        if (!collection?.relations) return [];
        return collection.relations.map(r => r.relationName || r.localKey || "").filter(Boolean);
    }
}
