import { EntityCollection, Property, Relation } from "@firecms/types";

export function resolveCollectionRelations(
    collection: EntityCollection,
    allCollections: EntityCollection[]
): Record<string, Relation> {
    const relations: Record<string, Relation> = {};

    // 1. Process explicit relations from the new `relations` field
    if (collection.relations) {
        collection.relations.forEach((relation, index) => {
            const targetCollection = relation.target();
            // Use relationName as primary key, fall back to target collection slug or dbPath
            const relationKey = relation.relationName || targetCollection.slug || targetCollection.dbPath;
            relations[relationKey] = relation;
        });
    }

    // 2. Process properties of type "relation"
    if (collection.properties) {
        Object.entries(collection.properties).forEach(([propKey, prop]) => {
            const relation = resolvePropertyRelation({
                propertyKey: propKey,
                property: prop as Property,
                allCollections
            });
            if (relation) {
                // Use property name as relation key if not already defined
                if (!relations[propKey]) {
                    relations[propKey] = relation;
                }
            }
        });
    }

    return relations;
}

/**
 * Find a collection by its slug or dbPath
 */
export function findCollectionBySlugOrDbPath(collections: EntityCollection[], slugOrPath: string): EntityCollection | undefined {
    return collections.find(c => c.slug === slugOrPath || c.dbPath === slugOrPath);
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
    if (property.relation) {
        return property.relation as Relation;
    }

    if (!property.path) return undefined;

    const target = findCollectionBySlugOrDbPath(allCollections, property.path);
    if (!target) return undefined;

    const idField = target.idField ?? "id";
    return {
        type: "one" as const,
        target: () => target,
        sourceFields: [propertyKey],
        targetFields: [idField]
    };
}
