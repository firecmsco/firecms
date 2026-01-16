import { eq } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityCollection, Properties, Property, SQL } from "@firecms/types";
import { resolveCollectionRelations } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import { DrizzleConditionBuilder } from "../utils/drizzle-conditions";

/**
 * Data transformation utilities for converting between frontend and database formats.
 */

/**
 * Helper function to sanitize and convert dates to ISO strings
 */
export function sanitizeAndConvertDates(obj: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }

    if (typeof obj === "number" && isNaN(obj)) {
        return null;
    }

    if (typeof obj === "string" && obj.toLowerCase() === "nan") {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeAndConvertDates(v));
    }

    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (typeof obj === "object") {
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = sanitizeAndConvertDates(obj[key]);
            }
        }
        return newObj;
    }

    if (typeof obj === "string") {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
        const jsDateRegex = /^\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/;
        if (isoDateRegex.test(obj) || jsDateRegex.test(obj)) {
            const date = new Date(obj);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        }
    }

    return obj;
}

/**
 * Transform relations for database storage (relation objects to IDs)
 */
export function serializeDataToServer<M extends Record<string, any>>(
    entity: M,
    properties: Properties,
    collection?: EntityCollection
): Record<string, any> {
    if (!entity || !properties) return entity;

    const result: Record<string, any> = {};

    // Get normalized relations if collection is provided
    const resolvedRelations = collection ? resolveCollectionRelations(collection) : {};

    // Track inverse relations that need to be handled separately
    const inverseRelationUpdates: Array<{
        relationKey: string;
        relation: any;
        newValue: any;
        currentEntityId?: string | number;
    }> = [];
    const joinPathRelationUpdates: Array<{
        relationKey: string;
        relation: any;
        newTargetId: any;
    }> = [];

    for (const [key, value] of Object.entries(entity)) {
        const property = properties[key as keyof M] as Property;
        if (!property) {
            result[key] = value;
            continue;
        }

        // Handle relation properties specially
        if (property.type === "relation" && collection) {
            const relation = resolvedRelations[key];
            if (relation) {
                if (relation.direction === "owning" && relation.localKey) {
                    // Owning relation: Map relation object to FK column on current table
                    const serializedValue = serializePropertyToServer(value, property);
                    if (serializedValue !== null && serializedValue !== undefined) {
                        result[relation.localKey] = serializedValue;
                    }
                    // Don't add the original relation property to the result
                    continue;
                } else if (relation.direction === "inverse" && relation.foreignKeyOnTarget) {
                    // Inverse relation: Need to update the target table's FK
                    const serializedValue = serializePropertyToServer(value, property);
                    inverseRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newValue: serializedValue,
                        currentEntityId: entity.id || entity[collection.idField || "id"]
                    });
                    // Don't add the original relation property to the result
                    continue;
                } else if (relation.direction === "inverse" && relation.joinPath && relation.joinPath.length > 0) {
                    // Inverse relation via joinPath: capture as inverse relation update
                    const serializedValue = serializePropertyToServer(value, property);
                    inverseRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newValue: serializedValue,
                        currentEntityId: entity.id || entity[collection.idField || "id"]
                    });
                    // Don't add the original relation property to the result
                    continue;
                } else if (relation.cardinality === "one" && relation.direction === "owning" && relation.joinPath && relation.joinPath.length > 0) {
                    // Owning one-to-one via joinPath: capture as a write intent
                    const serializedValue = serializePropertyToServer(value, property);
                    joinPathRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newTargetId: serializedValue
                    });
                    // Don't include this property directly in payload
                    continue;
                }
            }
        }

        result[key] = serializePropertyToServer(value, property);
    }

    if (inverseRelationUpdates.length > 0) {
        (result as any).__inverseRelationUpdates = inverseRelationUpdates;
    }
    if (joinPathRelationUpdates.length > 0) {
        (result as any).__joinPathRelationUpdates = joinPathRelationUpdates;
    }

    return result;
}

/**
 * Serialize a single property value for database storage
 */
export function serializePropertyToServer(value: any, property: Property): any {
    if (value === null || value === undefined) {
        return value;
    }

    const propertyType = property.type;

    switch (propertyType) {
        case "relation":
            if (Array.isArray(value)) {
                return value.map(v => serializePropertyToServer(v, property));
            } else if (typeof value === "object" && value?.id !== undefined) {
                return value.id;
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => serializePropertyToServer(item, property.of as Property));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = (property.properties as Properties)[subKey];
                    if (subProperty) {
                        result[subKey] = serializePropertyToServer(subValue, subProperty);
                    } else {
                        result[subKey] = subValue;
                    }
                }
                return result;
            }
            return value;

        default:
            return value;
    }
}

/**
 * Transform IDs back to relation objects for frontend
 */
export async function parseDataFromServer<M extends Record<string, any>>(
    data: M,
    collection: EntityCollection,
    db?: NodePgDatabase<any>,
    registry?: BackendCollectionRegistry
): Promise<M> {
    const properties = collection.properties;
    if (!data || !properties) return data;

    const result: Record<string, any> = {};

    // Get the normalized relations once
    const resolvedRelations = resolveCollectionRelations(collection);

    // Get list of FK columns that are used only for relations and not defined as properties
    const internalFKColumns = new Set<string>();
    Object.values(resolvedRelations).forEach(relation => {
        if (relation.localKey && !properties[relation.localKey]) {
            // This FK is used internally but not exposed as a property
            internalFKColumns.add(relation.localKey);
        }
    });

    // Process only the properties that are defined in the collection
    for (const [key, value] of Object.entries(data)) {
        // Skip internal FK columns that aren't defined as properties
        if (internalFKColumns.has(key)) {
            continue;
        }

        const property = properties[key as keyof M] as Property;
        if (!property) {
            // Also skip any other database columns not defined in properties
            continue;
        }

        result[key] = parsePropertyFromServer(value, property, collection);
    }

    // Add relation properties that should be populated from FK values or inverse queries
    for (const [propKey, property] of Object.entries(properties)) {
        if (property.type === "relation" && !(propKey in result)) {
            // Find the normalized relation for this property
            const relation = resolvedRelations[propKey];
            if (relation) {
                if (relation.direction === "owning" && relation.localKey && relation.localKey in data) {
                    // Owning relation: FK is in current table
                    const fkValue = data[relation.localKey as keyof M];
                    if (fkValue !== null && fkValue !== undefined) {
                        try {
                            const targetCollection = relation.target();
                            result[propKey] = {
                                id: fkValue.toString(),
                                path: targetCollection.slug || targetCollection.dbPath,
                                __type: "relation"
                            };
                        } catch (e) {
                            console.warn(`Could not resolve target collection for relation property: ${propKey}`, e);
                        }
                    }
                } else if (relation.direction === "inverse" && relation.foreignKeyOnTarget && db && registry) {
                    // Inverse relation: FK is in target table, need to query for it
                    try {
                        const targetCollection = relation.target();
                        const targetTable = registry.getTable(targetCollection.dbPath);
                        const currentEntityId = data[collection.idField || "id"];

                        if (targetTable && currentEntityId !== null && currentEntityId !== undefined) {
                            const foreignKeyColumn = targetTable[relation.foreignKeyOnTarget as keyof typeof targetTable] as AnyPgColumn;
                            if (foreignKeyColumn) {
                                // Query the target table to find entity that references this entity
                                const relatedEntities = await db
                                    .select()
                                    .from(targetTable)
                                    .where(eq(foreignKeyColumn, currentEntityId))
                                    .limit(relation.cardinality === "one" ? 1 : 100); // Limit for one-to-one vs one-to-many

                                if (relatedEntities.length > 0) {
                                    if (relation.cardinality === "one") {
                                        // One-to-one: return single relation object
                                        const targetIdField = targetCollection.idField || "id";
                                        const relatedEntity = relatedEntities[0] as Record<string, any>;
                                        result[propKey] = {
                                            id: relatedEntity[targetIdField].toString(),
                                            path: targetCollection.slug || targetCollection.dbPath,
                                            __type: "relation"
                                        };
                                    } else {
                                        // One-to-many: return array of relation objects
                                        const targetIdField = targetCollection.idField || "id";
                                        result[propKey] = relatedEntities.map((entity: any) => ({
                                            id: entity[targetIdField].toString(),
                                            path: targetCollection.slug || targetCollection.dbPath,
                                            __type: "relation"
                                        }));
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Could not resolve inverse relation property: ${propKey}`, e);
                    }
                } else if (relation.direction === "inverse" && relation.joinPath && db && registry) {
                    // Join path relation: Multi-hop relation using joins
                    try {
                        const targetCollection = relation.target();
                        const currentEntityId = data[collection.idField || "id"];

                        if (currentEntityId !== null && currentEntityId !== undefined) {
                            // Build the join query following the join path
                            const sourceTable = registry.getTable(collection.dbPath);
                            if (!sourceTable) {
                                console.warn(`Source table not found for collection: ${collection.dbPath}`);
                                continue;
                            }

                            let query = db.select().from(sourceTable);
                            let currentTable = sourceTable;

                            // Apply each join in the path
                            for (const join of relation.joinPath) {
                                const joinTable = registry.getTable(join.table);
                                if (!joinTable) {
                                    console.warn(`Join table not found: ${join.table}`);
                                    break;
                                }

                                // Parse the join condition - handle both string and array formats
                                const fromColumn = Array.isArray(join.on.from) ? join.on.from[0] : join.on.from;
                                const toColumn = Array.isArray(join.on.to) ? join.on.to[0] : join.on.to;

                                const fromParts = fromColumn.split(".");
                                const toParts = toColumn.split(".");

                                const fromColName = fromParts[fromParts.length - 1];
                                const toColName = toParts[toParts.length - 1];

                                const fromCol = currentTable[fromColName as keyof typeof currentTable] as AnyPgColumn;
                                const toCol = joinTable[toColName as keyof typeof joinTable] as AnyPgColumn;

                                if (!fromCol || !toCol) {
                                    console.warn(`Join columns not found: ${fromColumn} -> ${toColumn}`);
                                    break;
                                }

                                query = query.innerJoin(joinTable, eq(fromCol, toCol)) as any;
                                currentTable = joinTable;
                            }

                            // Add where condition for the current entity
                            const sourceIdField = sourceTable[(collection.idField || "id") as keyof typeof sourceTable] as AnyPgColumn;
                            query = query.where(eq(sourceIdField, currentEntityId)) as any;

                            // Build additional conditions array
                            const additionalFilters: SQL[] = [];

                            // Combine parent condition with additional filters using AND
                            const combinedWhere = DrizzleConditionBuilder.combineConditionsWithAnd([
                                eq(sourceIdField, currentEntityId),
                                ...additionalFilters
                            ].filter(Boolean) as SQL[]);

                            // Execute the query
                            const joinResults = await query.where(combinedWhere).limit(relation.cardinality === "one" ? 1 : 100);

                            if (joinResults.length > 0) {
                                const targetIdField = targetCollection.idField || "id";
                                const targetTableName = relation.joinPath[relation.joinPath.length - 1].table;

                                if (relation.cardinality === "one") {
                                    // One-to-one: return single relation object
                                    const joinResult = joinResults[0] as Record<string, any>;
                                    const targetEntity = joinResult[targetTableName] || joinResult;
                                    result[propKey] = {
                                        id: targetEntity[targetIdField].toString(),
                                        path: targetCollection.slug || targetCollection.dbPath,
                                        __type: "relation"
                                    };
                                } else {
                                    // One-to-many: return array of relation objects
                                    result[propKey] = joinResults.map((joinResult: any) => {
                                        const targetEntity = joinResult[targetTableName] || joinResult;
                                        return {
                                            id: targetEntity[targetIdField].toString(),
                                            path: targetCollection.slug || targetCollection.dbPath,
                                            __type: "relation"
                                        };
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Could not resolve join path relation property: ${propKey}`, e);
                    }
                }
            }
        }
    }

    return result as M;
}

/**
 * Parse a single property value from database format to frontend format
 */
export function parsePropertyFromServer(value: any, property: Property, collection: EntityCollection): any {
    if (value === null || value === undefined) {
        return value;
    }

    switch (property.type) {
        case "relation":
            // Transform ID back to relation object with type information
            if (typeof value === "string" || typeof value === "number") {
                const relationDef = collection.relations?.find((rel) => rel.relationName === property.relationName);
                if (!relationDef) throw new Error("Relation not defined in property");
                try {
                    const targetCollection = relationDef.target();
                    return {
                        id: value.toString(),
                        path: targetCollection.slug || targetCollection.dbPath,
                        __type: "relation"
                    };
                } catch (e) {
                    console.warn(`Could not resolve target collection for relation property: ${property.relationName}`, e);
                    return value;
                }
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => parsePropertyFromServer(item, property.of as Property, collection));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = (property.properties as Properties)[subKey];
                    if (subProperty) {
                        result[subKey] = parsePropertyFromServer(subValue, subProperty, collection);
                    } else {
                        result[subKey] = subValue;
                    }
                }
                return result;
            }
            return value;

        case "number":
            if (typeof value === "string") {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? null : parsed;
            }
            return value;

        case "date": {
            let date: Date | undefined;
            if (value instanceof Date) {
                date = value;
            } else if (typeof value === "string" || typeof value === "number") {
                const parsedDate = new Date(value);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate;
                }
            }
            if (date) {
                return {
                    __type: "date",
                    value: date.toISOString()
                };
            }
            return null;
        }

        default:
            return value;
    }
}
