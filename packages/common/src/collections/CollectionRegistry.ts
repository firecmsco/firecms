import {
    ArrayProperty,
    EntityCollection,
    NumberProperty,
    Properties,
    Property,
    Relation,
    RelationProperty,
    StringProperty
} from "@rebasepro/types";
import { deepEqual } from "fast-equals";

import { enumToObjectEntries, getSubcollections, resolveCollectionRelations } from "../util";
import cloneDeep from "lodash/cloneDeep.js";
import { removeFunctions } from "@rebasepro/utils";

export class CollectionRegistry {

    // Normalized runtime layer (used by Data Grid / UI)
    private collectionsByDbPath = new Map<string, EntityCollection>();
    private collectionsBySlug = new Map<string, EntityCollection>();
    private rootCollections: EntityCollection[] = [];

    // Raw configuration layer (used by Collection Editor AST generator)
    private rawCollectionsByDbPath = new Map<string, EntityCollection>();
    private rawCollectionsBySlug = new Map<string, EntityCollection>();
    private rawRootCollections: EntityCollection[] = [];

    // Snapshot of raw input for idempotency check — compared BEFORE normalization
    // to avoid the issue where normalization creates new objects that always fail equality.
    private lastRawInputSnapshot: ReturnType<typeof removeFunctions>[] | null = null;

    constructor(collections?: EntityCollection[]) {
        if (collections) {
            this.registerMultiple(collections);
        }
    }

    reset() {
        this.collectionsByDbPath.clear();
        this.collectionsBySlug.clear();
        this.rootCollections = [];

        this.rawCollectionsByDbPath.clear();
        this.rawCollectionsBySlug.clear();
        this.rawRootCollections = [];
    }

    /**
     * Registers a collection and its subcollections recursively.
     * Returns true if the collections have changed, false otherwise.
     *
     * Idempotent: compares the raw input (before normalization) against a stored
     * snapshot. Only re-normalizes and re-registers when the raw input actually changed.
     * @param collections
     */
    registerMultiple(collections: EntityCollection[]): boolean {
        // Compare raw input BEFORE normalization to detect actual changes.
        // This avoids the old issue where normalization creates new objects
        // that always fail deep-equal even when the source data is identical.
        const rawSnapshot = collections.map(c => removeFunctions(c));
        if (this.lastRawInputSnapshot && deepEqual(this.lastRawInputSnapshot, rawSnapshot)) {
            return false;
        }

        // Raw input has changed — normalize and register
        this.reset();

        const normalizedCollections = collections.map(c => this.normalizeCollection({ ...c }));

        // Phase 1: Register all top-level collections first (without recursion).
        // This ensures that injected entityViews (e.g. History tab) are preserved.
        // Without this, _registerRecursively could register a relation-target collection
        // (e.g. Tags from Posts.relations) using the raw module object (without injected views)
        // before the top-level Tags collection (with injected views) gets its turn.
        normalizedCollections.forEach((c, index) => {
            const raw = cloneDeep(collections[index]);
            this.rootCollections.push(c);
            this.rawRootCollections.push(raw);

            const normalized = this.normalizeCollection(c);
            this.collectionsByDbPath.set(normalized.dbPath, normalized);
            this.rawCollectionsByDbPath.set(raw.dbPath, raw);
            if (normalized.slug) {
                this.collectionsBySlug.set(normalized.slug, normalized);
            }
            if (raw.slug) {
                this.rawCollectionsBySlug.set(raw.slug, raw);
            }
        });

        // Phase 2: Now recurse into subcollections (relations, etc.)
        normalizedCollections.forEach((c, index) => {
            const subcollections = getSubcollections(c);
            const rawSubcollections = getSubcollections(collections[index]);
            if (subcollections && rawSubcollections) {
                subcollections.forEach((subCollection, subIndex) => {
                    this._registerRecursively(this.normalizeCollection(subCollection), cloneDeep(rawSubcollections[subIndex]));
                });
            }
        });

        // Store the snapshot for future comparisons
        this.lastRawInputSnapshot = rawSnapshot;

        return true;
    }

    register(collection: EntityCollection, rawCollection?: EntityCollection) {
        const raw = rawCollection ? cloneDeep(rawCollection) : cloneDeep(collection);

        this.rootCollections.push(collection);
        this.rawRootCollections.push(raw);

        this._registerRecursively(collection, raw);
    }

    private _registerRecursively(collection: EntityCollection, rawCollection: EntityCollection) {
        if (this.collectionsByDbPath.has(collection.dbPath)) {
            return;
        }

        const normalizedCollection = this.normalizeCollection(collection);
        this.collectionsByDbPath.set(normalizedCollection.dbPath, normalizedCollection);
        this.rawCollectionsByDbPath.set(rawCollection.dbPath, rawCollection);

        if (normalizedCollection.slug) {
            this.collectionsBySlug.set(normalizedCollection.slug, normalizedCollection);
        }
        if (rawCollection.slug) {
            this.rawCollectionsBySlug.set(rawCollection.slug, rawCollection);
        }

        const subcollections = getSubcollections(collection);
        const rawSubcollections = getSubcollections(rawCollection);

        if (subcollections && rawSubcollections) {
            subcollections.forEach((subCollection, index) => {
                this._registerRecursively(this.normalizeCollection(subCollection), cloneDeep(rawSubcollections[index]));
            });
        }
    }

    public normalizeCollection(collection: EntityCollection): EntityCollection {
        const properties: Properties = this.normalizeProperties(collection.properties, collection.relations ?? []);

        collection.properties = properties;
        return collection;
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
            // Cast via unknown to get a properly typed mutable reference
            const arrayProp = newProperty as unknown as ArrayProperty;
            if (arrayProp.of) {
                if (Array.isArray(arrayProp.of)) {
                    (arrayProp as { of: Property | Property[] }).of = arrayProp.of.map(p => this.normalizeProperty(p, relations));
                } else {
                    arrayProp.of = this.normalizeProperty(arrayProp.of, relations);
                }
            } else if (arrayProp.oneOf && arrayProp.oneOf.properties) {
                arrayProp.oneOf.properties = this.normalizeProperties(arrayProp.oneOf.properties, relations);
            }
        } else if ((newProperty.type === "string" || newProperty.type === "number") && newProperty.enum) {
            const stringOrNumberProperty = newProperty as StringProperty | NumberProperty;
            if (typeof stringOrNumberProperty.enum === "object" && !Array.isArray(stringOrNumberProperty.enum)) {
                (stringOrNumberProperty as unknown as Record<string, unknown>).enum = enumToObjectEntries(stringOrNumberProperty.enum)?.filter((value) => value && (value.id || value.id === 0) && value.label) ?? [];
            }
        } else if (newProperty.type === "relation") {
            const relationProperty = newProperty as RelationProperty;
            const relation = relations.find(r => r.relationName === relationProperty.relationName);
            if (relation) {
                // we attach the resolved relation to the property
                (relationProperty as unknown as Record<string, unknown>).relation = relation;
            } else {
                console.warn(`Could not find relation for property with relationName: ${relationProperty.relationName}`);
            }
        }

        return newProperty;
    }

    get(path: string): EntityCollection | undefined {
        // First try slug lookup
        const bySlug = this.collectionsBySlug.get(path);
        if (bySlug) return bySlug;

        // Fallback to dbPath lookup
        return this.collectionsByDbPath.get(path);
    }

    /**
     * Gets the pristine, un-normalized collection exactly as it was provided.
     * Useful for the AST editor so it doesn't accidentally serialize injected metadata back to disk.
     */
    getRaw(path: string): EntityCollection | undefined {
        const bySlug = this.rawCollectionsBySlug.get(path);
        if (bySlug) return bySlug;
        return this.rawCollectionsByDbPath.get(path);
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

    getCollections(): EntityCollection[] {
        return Array.from(this.collectionsByDbPath.values());
    }

    getRawCollections(): EntityCollection[] {
        return Array.from(this.rawCollectionsByDbPath.values());
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

function areCollectionListsEqual(a: EntityCollection[], b: EntityCollection[]) {
    // console.log("Comparing collection lists", a, b);
    // return true;
    if (a.length !== b.length) {
        return false;
    }
    const aCopy = [...a];
    const bCopy = [...b];
    const aSorted = aCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    const bSorted = bCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    return aSorted.every((value, index) => areCollectionsEqual(value, bSorted[index]));
}

function areCollectionsEqual(a: EntityCollection, b: EntityCollection) {
    const {
        subcollections: subcollectionsA,
        ...restA
    } = a;
    const {
        subcollections: subcollectionsB,
        ...restB
    } = b;
    if (!areCollectionListsEqual(subcollectionsA?.() ?? [], subcollectionsB?.() ?? [])) {
        return false;
    }
    return deepEqual(removeFunctions(restA), removeFunctions(restB));
}
