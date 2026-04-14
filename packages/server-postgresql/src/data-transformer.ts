import { eq, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityCollection, Properties, Property, Relation, RelationProperty } from "@rebasepro/types";
import { getTableName, resolveCollectionRelations } from "@rebasepro/common";
import { PostgresCollectionRegistry } from "./collections/PostgresCollectionRegistry";
import { DrizzleConditionBuilder } from "./utils/drizzle-conditions";
import { getPrimaryKeys, buildCompositeId } from "./services/entity-helpers";

/**
 * Data transformation utilities for converting between frontend and database formats.
 */

/**
 * Helper function to sanitize and convert dates to ISO strings
 */
export function sanitizeAndConvertDates(obj: unknown): unknown {
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
        const newObj: Record<string, unknown> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = sanitizeAndConvertDates((obj as Record<string, unknown>)[key]);
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
    collection?: EntityCollection,
    registry?: PostgresCollectionRegistry
): Record<string, unknown> {
    if (!entity || !properties) return entity;

    const result: Record<string, unknown> = {};

    // Get normalized relations if collection is provided
    const resolvedRelations = collection ? resolveCollectionRelations(collection as import("@rebasepro/types").PostgresCollection<any, any>) : {};

    // Track inverse relations that need to be handled separately
    const inverseRelationUpdates: Array<{
        relationKey: string;
        relation: Relation;
        newValue: unknown;
        currentEntityId?: string | number;
    }> = [];
    const joinPathRelationUpdates: Array<{
        relationKey: string;
        relation: Relation;
        newTargetId: string | number | null;
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
                    const pks = getPrimaryKeys(collection, registry!);
                    inverseRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newValue: serializedValue,
                        currentEntityId: entity.id || buildCompositeId(entity, pks)
                    });
                    // Don't add the original relation property to the result
                    continue;
                } else if (relation.direction === "inverse" && relation.joinPath && relation.joinPath.length > 0) {
                    // Inverse relation via joinPath: capture as inverse relation update
                    const serializedValue = serializePropertyToServer(value, property);
                    const pks = getPrimaryKeys(collection, registry!);
                    inverseRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newValue: serializedValue,
                        currentEntityId: entity.id || buildCompositeId(entity, pks)
                    });
                    // Don't add the original relation property to the result
                    continue;
                } else if (relation.cardinality === "one" && relation.direction === "owning" && relation.joinPath && relation.joinPath.length > 0) {
                    // Owning one-to-one via joinPath: capture as a write intent
                    const serializedValue = serializePropertyToServer(value, property);
                    joinPathRelationUpdates.push({
                        relationKey: key,
                        relation,
                        newTargetId: serializedValue as string | number | null
                    });
                    // Don't include this property directly in payload
                    continue;
                }
            }
        }

        result[key] = serializePropertyToServer(value, property);
    }

    if (inverseRelationUpdates.length > 0) {
        (result as Record<string, unknown>).__inverseRelationUpdates = inverseRelationUpdates;
    }
    if (joinPathRelationUpdates.length > 0) {
        (result as Record<string, unknown>).__joinPathRelationUpdates = joinPathRelationUpdates;
    }

    return result;
}

/**
 * Serialize a single property value for database storage
 */
export function serializePropertyToServer(value: unknown, property: Property): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    const propertyType = property.type;

    switch (propertyType) {
        case "relation":
            if (Array.isArray(value)) {
                return value.map(v => serializePropertyToServer(v, property));
            } else if (typeof value === "object" && value !== null && "id" in value) {
                return (value as Record<string, unknown>).id;
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => serializePropertyToServer(item, property.of as Property));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, unknown> = {};
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
    registry?: PostgresCollectionRegistry
): Promise<M> {
    const properties = collection.properties;
    if (!data || !properties) return data;

    const result: Record<string, unknown> = {};

    // Get the normalized relations once
    const resolvedRelations = resolveCollectionRelations(collection as import("@rebasepro/types").PostgresCollection<any, any>);

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

        result[key] = parsePropertyFromServer(value, property, collection, key);
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
                                path: targetCollection.slug,
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
                        const targetTable = registry.getTable(getTableName(targetCollection));
                        const pks = getPrimaryKeys(collection, registry!);
                        const currentEntityId = buildCompositeId(data, pks);

                        if (targetTable && currentEntityId) {
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
                                        const targetPks = getPrimaryKeys(targetCollection, registry!);
                                        const relatedEntity = relatedEntities[0] as Record<string, unknown>;
                                        result[propKey] = {
                                            id: buildCompositeId(relatedEntity, targetPks),
                                            path: targetCollection.slug,
                                            __type: "relation"
                                        };
                                    } else {
                                        // One-to-many: return array of relation objects
                                        const targetPks = getPrimaryKeys(targetCollection, registry!);
                                        result[propKey] = relatedEntities.map((entity: Record<string, unknown>) => ({
                                            id: buildCompositeId(entity, targetPks),
                                            path: targetCollection.slug,
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
                        const pks = getPrimaryKeys(collection, registry!);
                        const currentEntityId = buildCompositeId(data, pks);

                        if (currentEntityId) {
                            // Build the join query following the join path
                            const sourceTable = registry.getTable(getTableName(collection));
                            if (!sourceTable) {
                                console.warn(`Source table not found for collection: ${collection.slug}`);
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

                                query = query.innerJoin(joinTable, eq(fromCol, toCol)) as unknown as typeof query;
                                currentTable = joinTable;
                            }

                            // Add where condition for the current entity
                            if (pks.length === 1) {
                                const sourceIdField = sourceTable[pks[0].fieldName as keyof typeof sourceTable] as AnyPgColumn;
                                query = query.where(eq(sourceIdField, currentEntityId)) as unknown as typeof query;
                            } else {
                                // For composite keys, we would need to map the split parts. For now log a warning.
                                console.warn(`Join path resolution for composite primary keys is not yet fully supported: ${collection.slug}`);
                            }

                            // Build additional conditions array
                            const additionalFilters: SQL[] = [];

                            // Combine parent condition with additional filters using AND
                            let combinedWhere: SQL | undefined;

                            if (pks.length === 1) {
                                const sourceIdField = sourceTable[pks[0].fieldName as keyof typeof sourceTable] as AnyPgColumn;
                                combinedWhere = DrizzleConditionBuilder.combineConditionsWithAnd([
                                    eq(sourceIdField, currentEntityId),
                                    ...additionalFilters
                                ].filter(Boolean) as SQL[]);
                            }

                            // Execute the query
                            const joinResults = await query.where(combinedWhere).limit(relation.cardinality === "one" ? 1 : 100);

                            if (joinResults.length > 0) {
                                const targetPks = getPrimaryKeys(targetCollection, registry!);
                                const targetTableName = relation.joinPath[relation.joinPath.length - 1].table;

                                if (relation.cardinality === "one") {
                                    // One-to-one: return single relation object
                                    const joinResult = joinResults[0] as Record<string, unknown>;
                                    const targetEntity = joinResult[targetTableName] || joinResult;
                                    result[propKey] = {
                                        id: buildCompositeId(targetEntity, targetPks),
                                        path: targetCollection.slug,
                                        __type: "relation"
                                    };
                                } else {
                                    // One-to-many: return array of relation objects
                                    result[propKey] = joinResults.map((joinResult: Record<string, unknown>) => {
                                        const targetEntity = joinResult[targetTableName] || joinResult;
                                        return {
                                            id: buildCompositeId(targetEntity, targetPks),
                                            path: targetCollection.slug,
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
export function parsePropertyFromServer(value: unknown, property: Property, collection: EntityCollection, propertyKey?: string): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    switch (property.type) {
        case "relation":
            // Transform ID back to relation object with type information
            if (typeof value === "string" || typeof value === "number") {
                let relationDef: Relation | undefined = (property as RelationProperty).relation;
                if (!relationDef && propertyKey) {
                    const resolvedRelations = resolveCollectionRelations(collection as import("@rebasepro/types").PostgresCollection<any, any>);
                    relationDef = resolvedRelations[propertyKey];
                }
                if (!relationDef) {
                    relationDef = (collection as import("@rebasepro/types").PostgresCollection<any, any>).relations?.find((rel) => rel.relationName === (property as RelationProperty).relationName);
                }
                
                if (!relationDef) {
                    console.warn(`Relation not defined in property for key: ${propertyKey || 'unknown'}`);
                    return value;
                }
                
                try {
                    const targetCollection = relationDef.target();
                    return {
                        id: value.toString(),
                        path: targetCollection.slug,
                        __type: "relation"
                    };
                } catch (e) {
                    console.warn(`Could not resolve target collection for relation property: ${propertyKey || 'unknown'}`, e);
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
                const result: Record<string, unknown> = {};
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

/**
 * Lightweight value normalization for db.query results.
 * Only handles type coercion (dates, numbers, NaN) and property filtering.
 * Does NOT query the database for relations — those are already resolved
 * by Drizzle's relational query API.
 *
 * Use this instead of `parseDataFromServer` when processing results from
 * `db.query.findFirst/findMany` which return pre-hydrated relation data.
 */
export function normalizeDbValues<M extends Record<string, any>>(
    data: M,
    collection: EntityCollection
): M {
    const properties = collection.properties;
    if (!data || !properties) return data;

    const result: Record<string, unknown> = {};

    // Get FK columns that are used internally for relations and not defined as properties
    const resolvedRelations = resolveCollectionRelations(collection as import("@rebasepro/types").PostgresCollection<any, any>);
    const internalFKColumns = new Set<string>();
    Object.values(resolvedRelations).forEach(relation => {
        if (relation.localKey && !properties[relation.localKey]) {
            internalFKColumns.add(relation.localKey);
        }
    });

    for (const [key, value] of Object.entries(data)) {
        // Skip internal FK columns
        if (internalFKColumns.has(key)) continue;

        const property = properties[key as keyof M] as Property;
        if (!property) continue; // Skip DB columns not defined in properties

        // Skip relation properties — they're already handled by db.query
        if (property.type === "relation") continue;

        result[key] = parsePropertyFromServer(value, property, collection, key);
    }

    return result as M;
}
