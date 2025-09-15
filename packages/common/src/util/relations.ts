import { EntityCollection, Property, Relation } from "@firecms/types";
import { toSnakeCase } from "./strings";

export function sanitizeRelation(relation: Partial<Relation>, sourceCollection: EntityCollection): Relation {
    if (!relation.target) {
        throw new Error("Relation is missing a `target` collection.");
    }
    const targetCollection = relation.target();

    const newRelation: Partial<Relation> = { ...relation };

    // 1. Default relationName from target collection slug or dbPath
    if (!newRelation.relationName) {
        newRelation.relationName = toSnakeCase(targetCollection.slug ?? targetCollection.dbPath);
    }

    // 2. Infer or default direction if absent
    if (!newRelation.direction) {
        if (newRelation.foreignKeyOnTarget) newRelation.direction = "inverse";
        else if (newRelation.through) newRelation.direction = "owning";
        else if (newRelation.cardinality === "many") newRelation.direction = "inverse"; // Default has-many to be inverse
        else newRelation.direction = "owning"; // Default all others to owning
    }

    // Do not default keys if a custom joinPath is provided; it's an advanced override.
    if (!newRelation.joinPath) {
        const sourceName = toSnakeCase(sourceCollection.slug ?? sourceCollection.name);

        // 3. Default keys based on the relation type (cardinality and direction)
        if (newRelation.cardinality === "one" && newRelation.direction === "owning") {
            // Belongs-to / many-to-one
            if (!newRelation.localKey) {
                newRelation.localKey = `${newRelation.relationName}_id`;
            }
        } else if (newRelation.cardinality === "many" && newRelation.direction === "inverse") {
            // Has-many / one-to-many
            if (!newRelation.foreignKeyOnTarget) {
                newRelation.foreignKeyOnTarget = `${sourceName}_id`;
            }
        } else if (newRelation.cardinality === "many" && newRelation.direction === "owning") {

            // Many-to-many via junction table
            const sourceTableName = getTableName(sourceCollection);
            const targetTableName = getTableName(targetCollection);

            newRelation.through = {
                table: newRelation.through?.table ?? [sourceTableName, targetTableName].sort().join("_to_"),
                sourceColumn: newRelation.through?.sourceColumn ?? `${sourceName}_id`,
                targetColumn: newRelation.through?.targetColumn ?? `${newRelation.relationName}_id`,
            };
        }
    }

    // 4. Basic validation to catch configuration errors early
    if (newRelation.cardinality === "one" && newRelation.direction === "owning" && !newRelation.localKey && !newRelation.joinPath) {
        throw new Error(`Configuration Error in relation from '${sourceCollection.name}': An 'owning' one-to-one relation requires a 'localKey'. Check the relation config for '${newRelation.relationName}'`);
    }
    if (newRelation.cardinality === "many" && newRelation.direction === "inverse" && !newRelation.foreignKeyOnTarget && !newRelation.joinPath) {
        throw new Error(`Configuration Error in relation from '${sourceCollection.name}': An 'inverse' one-to-many relation requires a 'foreignKeyOnTarget'. Check the relation config for '${newRelation.relationName}'`);
    }

    return newRelation as Relation;
}

export function resolveCollectionRelations(
    collection: EntityCollection,
): Record<string, Relation> {
    const relations: Record<string, Relation> = {};

    // 1. Process explicit relations from the new `relations` field
    if (collection.relations) {
        collection.relations.forEach((relation) => {
            const normalizedRelation = sanitizeRelation(relation, collection);
            const relationKey = normalizedRelation.relationName;
            if (relationKey) {
                relations[relationKey] = normalizedRelation;
            }
        });
    }

    // 2. Process properties of type "relation"
    if (collection.properties) {
        Object.entries(collection.properties).forEach(([propKey, prop]) => {
            const relation = resolvePropertyRelation({
                propertyKey: propKey,
                property: prop as Property,
                sourceCollection: collection
            });
            if (relation) {
                // Use property name as relation key if not already defined
                if (!relations[propKey]) {
                    // FIX: Set relationName to propKey if not defined, before normalizing
                    if (!relation.relationName) {
                        relation.relationName = propKey;
                    }
                    relations[propKey] = sanitizeRelation(relation, collection); // Already normalized in collection.relations
                }
            }
        });
    }

    return relations;
}

export function resolvePropertyRelation({
                                            propertyKey,
                                            property,
                                            sourceCollection
                                        }: {
    propertyKey: string;
    property: Property;
    sourceCollection: EntityCollection;
}): Relation | undefined {
    if (property.type !== "relation") return undefined;

    const relation = sourceCollection.relations?.find((rel) => rel.relationName === property.relationName)
    if (!relation) {
        console.warn(`Unrecognized relation format for property '${propertyKey}' in collection '${sourceCollection.slug || sourceCollection.dbPath}'`);
        return undefined;
    }

    return relation as Relation;

}

export function getTableName(collection: EntityCollection): string {
    return collection.dbPath ?? toSnakeCase(collection.slug) ?? toSnakeCase(collection.name);
}

export function getTableVarName(tableName: string): string {
    return tableName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function getEnumVarName(tableName: string, propName: string): string {
    const tableVar = getTableVarName(tableName);
    const propVar = propName.charAt(0).toUpperCase() + propName.slice(1);
    return `${tableVar}${propVar}`;
}

export function getColumnName(fullColumn: string): string {
    return fullColumn.includes(".") ? fullColumn.split(".").pop()! : fullColumn;
}
