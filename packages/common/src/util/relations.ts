import { EntityCollection, Property, Relation } from "@firecms/types";
import { toSnakeCase } from "./strings";

export function normalizeRelation(relation: Relation, sourceCollection: EntityCollection): Relation {
    const newRelation = { ...relation };
    const targetCollection = newRelation.target();

    // Infer or default direction if absent
    if (!newRelation.direction) {
        if (newRelation.foreignKeyOnTarget) {
            newRelation.direction = "inverse";
        } else if (newRelation.through) {
            newRelation.direction = "owning";
        } else if (newRelation.localKey) {
            newRelation.direction = "owning";
        } else if (newRelation.cardinality === "many") {
            // Ambiguous: assume inverse (has-many) unless through specified
            newRelation.direction = "inverse";
        } else {
            newRelation.direction = "owning";
        }
    }

    // Default relationName from target collection slug or dbPath
    if (!newRelation.relationName) {
        newRelation.relationName = toSnakeCase(targetCollection.slug ?? targetCollection.dbPath);
    }

    // Create default joins if not provided
    if (!newRelation.joins) {
        const sourceTableName = getTableName(sourceCollection);
        const targetTableName = getTableName(targetCollection);
        const targetIdField = targetCollection.idField ?? "id";
        const sourceIdField = sourceCollection.idField ?? "id";

        if (newRelation.cardinality === "one" && newRelation.direction === "owning") { // Belongs-to / many-to-one
            const localKey = newRelation.localKey ?? `${newRelation.relationName}_id`;
            newRelation.localKey = localKey;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${localKey}`,
                targetColumn: `${targetTableName}.${targetIdField}`
            }];
        } else if (newRelation.cardinality === "many" && newRelation.direction === "inverse") { // Has-many / one-to-many (FK on target)
            const foreignKeyOnTarget = newRelation.foreignKeyOnTarget
                ?? `${toSnakeCase(sourceCollection.slug ?? sourceCollection.name)}_id`;
            newRelation.foreignKeyOnTarget = foreignKeyOnTarget;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${sourceIdField}`,
                targetColumn: `${targetTableName}.${foreignKeyOnTarget}`
            }];
        } else if (newRelation.cardinality === "many" && newRelation.through) { // Many-to-many owning
            const junctionTable = newRelation.through.table;
            const sourceJunctionColumn = newRelation.through.sourceColumn;
            const targetJunctionColumn = newRelation.through.targetColumn;
            newRelation.joins = [
                {
                    table: junctionTable,
                    sourceColumn: `${sourceTableName}.${sourceIdField}`,
                    targetColumn: `${junctionTable}.${sourceJunctionColumn}`
                },
                {
                    table: targetTableName,
                    sourceColumn: `${junctionTable}.${targetJunctionColumn}`,
                    targetColumn: `${targetTableName}.${targetIdField}`
                }
            ];
        } else if (newRelation.cardinality === "one" && newRelation.direction === "inverse") { // One-to-one inverse - fallback to belongs-to
            // For ambiguous one-to-one inverse, fall back to belongs-to style join
            const localKey = newRelation.localKey ?? `${newRelation.relationName}_id`;
            newRelation.localKey = localKey;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${localKey}`,
                targetColumn: `${targetTableName}.${targetIdField}`
            }];
        } else {
            // Default fallback for simple relations if no other config is provided
            const localKey = newRelation.localKey ?? `${newRelation.relationName}_id`;
            newRelation.localKey = localKey;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${localKey}`,
                targetColumn: `${targetTableName}.${targetIdField}`
            }];
        }
    }

    // Default table in joins and columns
    let previousJoinTable = getTableName(sourceCollection);
    for (const join of newRelation.joins) {
        if (!join.table) {
            join.table = getTableName(targetCollection);
        }

        if (!join.sourceColumn.includes(".")) {
            join.sourceColumn = `${previousJoinTable}.${join.sourceColumn}`;
        }

        if (!join.targetColumn.includes(".")) {
            join.targetColumn = `${join.table}.${join.targetColumn}`;
        }
        previousJoinTable = join.table;
    }

    return newRelation;
}

export function resolveCollectionRelations(
    collection: EntityCollection,
): Record<string, Relation> {
    const relations: Record<string, Relation> = {};

    // 1. Process explicit relations from the new `relations` field
    if (collection.relations) {
        collection.relations.forEach((relation) => {
            const normalizedRelation = normalizeRelation(relation, collection);
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
                    relations[propKey] = normalizeRelation(relation, collection); // Already normalized in collection.relations
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
