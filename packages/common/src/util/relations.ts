import { EntityCollection, Property, Relation } from "@firecms/types";
import { toSnakeCase } from "./strings";

function normalizeRelation(relation: Relation, sourceCollection: EntityCollection): Relation {
    const newRelation = { ...relation };
    const targetCollection = newRelation.target();

    // Default relationName from target collection slug or dbPath
    if (!newRelation.relationName) {
        newRelation.relationName = toSnakeCase(targetCollection.slug ?? targetCollection.dbPath);
    }

    // Create default joins if not provided
    if (!newRelation.joins || newRelation.joins.length === 0) {
        const sourceTableName = getTableName(sourceCollection);
        const targetTableName = getTableName(targetCollection);
        const targetIdField = targetCollection.idField ?? "id";

        if (newRelation.cardinality === "one") {
            // Belongs-to relation: FK is on the source table
            const sourceFkField = `${newRelation.relationName}_id`;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${sourceFkField}`,
                targetColumn: `${targetTableName}.${targetIdField}`
            }];
        } else { // cardinality: "many"
            // Has-many relation: FK is on the target table
            const targetFkField = `${toSnakeCase(sourceCollection.slug ?? sourceCollection.name)}_id`;
            newRelation.joins = [{
                table: targetTableName,
                sourceColumn: `${sourceTableName}.${sourceCollection.idField ?? "id"}`,
                targetColumn: `${targetTableName}.${targetFkField}`
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
    allCollections: EntityCollection[]
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
                allCollections,
                sourceCollection: collection
            });
            if (relation) {
                // Use property name as relation key if not already defined
                if (!relations[propKey]) {
                    // FIX: Set relationName to propKey if not defined, before normalizing
                    if (!relation.relationName) {
                        relation.relationName = propKey;
                    }
                    relations[propKey] = normalizeRelation(relation, collection);
                }
            }
        });
    }

    return relations;
}

export function resolvePropertyRelation({
                                            propertyKey,
                                            property,
                                            allCollections,
                                            sourceCollection
                                        }: {
    propertyKey: string;
    property: Property;
    allCollections: EntityCollection[];
    sourceCollection: EntityCollection;
}): Relation | undefined {
    if (property.type !== "relation") return undefined;

    if (!property.relation) return undefined;

    const explicitRelation = property.relation as any;

    // New-style relation format
    if (explicitRelation.cardinality) {
        return explicitRelation as Relation;
    }

    // Legacy relation format
    if (explicitRelation.type && explicitRelation.target) {
        const targetCollection = explicitRelation.target();
        const targetIdField = targetCollection.idField ?? "id";

        return {
            relationName: propertyKey,
            cardinality: explicitRelation.type === "many" ? "many" : "one",
            target: explicitRelation.target,
            joins: [
                {
                    table: targetCollection.dbPath,
                    sourceColumn: `${sourceCollection.dbPath}.${propertyKey}`,
                    targetColumn: `${targetCollection.dbPath}.${targetIdField}`
                }
            ]
        } as Relation;
    }

    console.warn(`Unrecognized relation format for property '${propertyKey}' in collection '${sourceCollection.slug || sourceCollection.dbPath}'`);
    return undefined;
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
