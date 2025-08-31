import { EntityCollection, Property, Relation } from "@firecms/types";

// Resolves a subcollection into a one-to-many relation
export function resolveSubcollectionRelation(subcollection: any): Relation {
    if (subcollection.relation) {
        return subcollection.relation;
    }
    // Default: a subcollection represents a one-to-many relation from the parent to the subcollection
    return {
        type: "many" as const,
        target: () => subcollection
    };
}

/**
 * Resolve a relation property into a one-to-one (or many-to-one) relation.
 * In this model a property of type "relation" on the source points to the
 * target collection's id field.
 */
export function resolvePropertyRelation({
                                            propertyKey,
                                            property,
                                            allCollections
                                        }: {
    propertyKey: string;
    property: Property;
    allCollections: EntityCollection[];
}): Relation | undefined {
    if (property.type !== "relation") return undefined;

    // Explicit relation on the relation property (supports manyToMany, one, many overrides)
    if ((property).relation) {
        return (property).relation as Relation;
    }

    if (!(property).path) return undefined;

    const target = findCollectionBySlugOrDbPath(allCollections, (property).path);
    if (!target) return undefined;

    const idField = target.idField ?? "id";
    return {
        type: "one" as const,
        target: () => target,
        sourceFields: [propertyKey],
        targetFields: [idField]
    };
}

/**
 * Recursively resolve relations for a collection by scanning:
 * - its subcollections (as one-to-many)
 * - its properties (relation properties as one-to-one)
 * - nested map properties
 */
export function resolveCollectionRelations(
    collection: EntityCollection,
    allCollections: EntityCollection[]
): Record<string, Relation> {
    const result: Record<string, Relation> = {};

    // 1) Subcollections -> many
    const subcollections = collection.subcollections?.() ?? [];
    for (const sc of subcollections) {
        result[sc.slug] = resolveSubcollectionRelation(sc);
    }

    // 2) Properties (relation)
    scanPropertiesRecursively(collection.properties, (keyPath, prop) => {
        if (prop.type === "relation") {
            const rel = resolvePropertyRelation({
                propertyKey: keyPath,
                property: prop,
                allCollections
            });
            if (rel) result[keyPath] = rel;
        }
    });

    return result;
}

/**
 * DFS over collections and subcollections to find a collection by slug or dbPath
 */
function findCollectionBySlugOrDbPath(all: EntityCollection[], path: string): EntityCollection | undefined {
    for (const c of all) {
        if (c.slug === path || c.dbPath === path) return c;
        const sub = c.subcollections?.();
        if (sub && sub.length) {
            const found = findCollectionBySlugOrDbPath(sub, path);
            if (found) return found;
        }
    }
    return undefined;
}

/**
 * Recursively scan a properties tree and invoke fn for every concrete property node.
 * - Traverses map properties (property.properties)
 */
function scanPropertiesRecursively(
    properties: Record<string, Property>,
    fn: (keyPath: string, property: Property) => void,
    prefix = ""
) {
    Object.entries(properties).forEach(([key, prop]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        fn(fullKey, prop);

        if (prop.type === "map" && (prop as any).properties) {
            scanPropertiesRecursively((prop as any).properties as Record<string, Property>, fn, fullKey);
        } else if (prop.type === "array") {
            // Traverse 'of' if it's a single property (e.g. array of references or array of maps)
            const ofProp = (prop as any).of;
            if (ofProp && !Array.isArray(ofProp) && typeof ofProp === "object" && (ofProp as Property).type) {
                fn(`${fullKey}[]`, ofProp as Property);
                if ((ofProp as Property).type === "map" && (ofProp as any).properties) {
                    scanPropertiesRecursively((ofProp as any).properties as Record<string, Property>, fn, `${fullKey}[]`);
                }
            }
            // Traverse oneOf variants if present
            const oneOf = (prop as any).oneOf;
            if (oneOf?.properties) {
                Object.entries(oneOf.properties as Record<string, Property>).forEach(([altKey, altProp]) => {
                    const altFullKey = `${fullKey}[${altKey}]`;
                    fn(altFullKey, altProp);
                    if (altProp.type === "map" && (altProp as any).properties) {
                        scanPropertiesRecursively((altProp as any).properties as Record<string, Property>, fn, altFullKey);
                    }
                });
            }
        }
    });
}
