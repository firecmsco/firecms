import {
    EntityCollection,
    NumberProperty,
    Properties,
    Property,
    Relation,
    RelationProperty,
    StringProperty
} from "@firecms/types";
import { enumToObjectEntries, getSubcollections, resolveCollectionRelations } from "../util";

export class CollectionRegistry {

    private collectionsByDbPath = new Map<string, EntityCollection>();
    private collectionsBySlug = new Map<string, EntityCollection>();
    private rootCollections: EntityCollection[] = [];

    constructor(collections?: EntityCollection[]) {
        if (collections) {
            this.registerMultiple(collections);
        }
    }

    reset() {
        this.collectionsByDbPath.clear();
        this.collectionsBySlug.clear();
        this.rootCollections = [];
    }

    registerMultiple(collections: EntityCollection[]) {
        collections.forEach(c => this.register(c));
    }

    register(collection: EntityCollection) {
        // avoid adding duplicates
        if (this.rootCollections.some(c => c.slug === collection.slug)) {
            return;
        }
        this.rootCollections.push(collection);
        this._registerRecursively(collection);
    }

    private _registerRecursively(collection: EntityCollection) {
        if (this.collectionsByDbPath.has(collection.dbPath)) {
            return;
        }

        const normalizedCollection = this.normalizeCollection(collection);
        this.collectionsByDbPath.set(normalizedCollection.dbPath, normalizedCollection);
        if (normalizedCollection.slug)
            this.collectionsBySlug.set(normalizedCollection.slug, normalizedCollection);

        const subcollections = getSubcollections(collection);

        if (subcollections) {
            subcollections.forEach(subCollection => this._registerRecursively(this.normalizeCollection(subCollection)));
        }
    }

    public normalizeCollection(collection: EntityCollection): EntityCollection {
        const properties: Properties = this.normalizeProperties(collection.properties, collection.relations ?? []);
        return {
            ...collection,
            textSearchEnabled: collection.textSearchEnabled === undefined ? true : collection.textSearchEnabled,
            properties
        };
    }

    private normalizeProperties(properties: Properties, relations: Relation[]): Properties {
        const newProperties: Properties = {};
        for (const key in properties) {
            newProperties[key] = this.normalizeProperty(properties[key], relations);
        }
        return newProperties;
    }

    private normalizeProperty(property: Property, relations: Relation[]): Property {
        const newProperty = { ...property };

        if (newProperty.type === "map" && newProperty.properties) {
            newProperty.properties = this.normalizeProperties(newProperty.properties, relations);
        } else if (newProperty.type === "array") {
            if (newProperty.of) {
                newProperty.of = this.normalizeProperty(newProperty.of, relations);
            } else if (newProperty.oneOf && newProperty.oneOf.properties) {
                newProperty.oneOf.properties = this.normalizeProperties(newProperty.oneOf.properties, relations);
            }
        } else if ((newProperty.type === "string" || newProperty.type === "number") && newProperty.enum) {
            const stringOrNumberProperty = newProperty as StringProperty | NumberProperty;
            if (typeof stringOrNumberProperty.enum === "object" && !Array.isArray(stringOrNumberProperty.enum)) {
                (stringOrNumberProperty as any).enum = enumToObjectEntries(stringOrNumberProperty.enum)?.filter((value) => value && (value.id || value.id === 0) && value.label) ?? [];
            }
        } else if (newProperty.type === "relation") {
            const relationProperty = newProperty as RelationProperty;
            const relation = relations.find(r => r.relationName === relationProperty.relationName);
            if (relation) {
                // we attach the resolved relation to the property
                (relationProperty as any).relation = relation;
            } else {
                console.warn(`Could not find relation for property with relationName: ${relationProperty.relationName}`);
            }
        }

        return newProperty;
    }

    get(path: string): EntityCollection | undefined {
        return this.collectionsBySlug.get(path);
    }

    /**
     * Get collection by resolving multi-segment paths through relations
     * e.g., "authors/70/posts" resolves to the posts collection
     */
    getCollectionByPath(collectionPath: string): EntityCollection | undefined {
        // Handle simple single collection path
        if (!collectionPath.includes("/")) {
            return this.get(collectionPath);
        }

        // Handle multi-segment paths by resolving through relations
        const pathSegments = collectionPath.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${collectionPath}. Expected format: collection/id/relation or collection/id/relation/id/relation`);
        }

        // Start with the root collection
        const rootCollectionPath = pathSegments[0];
        let currentCollection = this.get(rootCollectionPath);

        if (!currentCollection) {
            throw new Error(`Root collection not found: ${rootCollectionPath}`);
        }

        // Navigate through the path using relations
        for (let i = 2; i < pathSegments.length; i += 2) {
            const relationKey = pathSegments[i];

            // Get relations for current collection
            const resolvedRelations = resolveCollectionRelations(currentCollection);
            const relation = resolvedRelations[relationKey];

            if (!relation) {
                throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
            }

            // Move to the target collection
            currentCollection = relation.target();

            // If there are more segments, continue navigation
            if (i + 1 < pathSegments.length) {
                // Skip entity ID segment
            }
        }

        return currentCollection;
    }

    getAllCollectionsRecursively(): EntityCollection[] {
        return Array.from(this.collectionsByDbPath.values());
    }

    /**
     * Resolves a multi-segment path like "products/123/locales" and returns
     * information about the collections and entity IDs along the path
     */
    resolvePathToCollections(path: string): {
        collections: EntityCollection[],
        entityIds: (string | number)[],
        finalCollection: EntityCollection
    } {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length === 0) {
            throw new Error(`Invalid path: ${path}`);
        }

        if (pathSegments.length % 2 !== 1) {
            throw new Error(`Invalid collection path: ${path}. It must have an odd number of segments.`);
        }

        const collections: EntityCollection[] = [];
        const entityIds: (string | number)[] = [];

        // Start with the first collection
        let currentCollection = this.get(pathSegments[0]);

        if (!currentCollection) {
            throw new Error(`Unknown collection path or slug: ${pathSegments[0]}`);
        }

        collections.push(currentCollection);

        // Process the rest of the path in pairs (entityId, subcollectionSlug)
        for (let i = 1; i < pathSegments.length; i += 2) {
            const entityId = pathSegments[i];
            entityIds.push(entityId);

            if (i + 1 < pathSegments.length) {
                const subcollectionSlug = pathSegments[i + 1];
                const subcollections: EntityCollection[] | undefined = currentCollection.subcollections?.();
                if (!subcollections) {
                    throw new Error(`No subcollections found for ${currentCollection.slug || currentCollection.dbPath} in path: ${path}`);
                }

                const subcollection: EntityCollection | undefined = subcollections.find(c => c.slug === subcollectionSlug);
                if (!subcollection) {
                    throw new Error(`Subcollection '${subcollectionSlug}' not found in ${currentCollection.slug || currentCollection.dbPath}`);
                }
                currentCollection = subcollection;
                collections.push(currentCollection);
            }
        }

        return {
            collections,
            entityIds,
            finalCollection: currentCollection
        };
    }

}
