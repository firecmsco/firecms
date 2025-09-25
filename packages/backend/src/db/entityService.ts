import { and, asc, count, desc, eq, gt, inArray, lt, or, sql, SQL } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, FilterValues, Properties, Property, Relation, WhereFilterOp } from "@firecms/types";
import { getTableName, resolveCollectionRelations } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import { DrizzleConditionBuilder } from "../utils/drizzle-conditions";

/**
 * Helper function to sanitize and convert dates to ISO strings
 */
function sanitizeAndConvertDates(obj: any): any {
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

// Transform relations for database storage (relation objects to IDs)
function serializeDataToServer<M extends Record<string, any>>(entity: M, properties: Properties, collection?: EntityCollection): Record<string, any> {
    if (!entity || !properties) return entity;

    const result: Record<string, any> = {};

    // Get normalized relations if collection is provided
    const resolvedRelations = collection ? resolveCollectionRelations(collection) : {};

    // Track inverse relations that need to be handled separately
    const inverseRelationUpdates: Array<{
        relationKey: string;
        relation: Relation;
        newValue: any;
        currentEntityId?: string | number;
    }> = [];
    const joinPathRelationUpdates: Array<{
        relationKey: string;
        relation: Relation;
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
                } else if (relation.cardinality === "one" && relation.joinPath && relation.joinPath.length > 0) {
                    // Computed one-to-one via joinPath: capture as a write intent
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

function serializePropertyToServer(value: any, property: Property): any {
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

// Transform IDs back to relation objects for frontend
async function parseDataFromServer<M extends Record<string, any>>(
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

                            // Add search conditions if search string is provided
                            if (options.searchString) {
                                const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                                    options.searchString,
                                    targetCollection.properties,
                                    targetTable
                                );

                                if (searchConditions.length === 0) {
                                    return []; // No searchable fields found - early return
                                }

                                additionalFilters.push(DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!);
                            }

                            // Add filter conditions
                            if (options.filter) {
                                const filterConditions = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
                                additionalFilters.push(...filterConditions);
                            }

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

function parsePropertyFromServer(value: any, property: Property, collection: EntityCollection): any {
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

export class EntityService {
    constructor(private db: NodePgDatabase<any>) {
    }

    private buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        table: PgTable<any>,
        collectionPath: string
    ): SQL[] {
        if (!filter) return [];
        let collection: EntityCollection | undefined;
        try {
            collection = this.getCollectionByPath(collectionPath);
        } catch (e) {
            console.warn("Could not load collection for path while building filters", collectionPath, e);
        }
        const resolvedRelations = collection ? resolveCollectionRelations(collection) : {} as Record<string, Relation>;

        const normalized: FilterValues<any> = {};
        const extraConditions: SQL[] = [];

        const parentIdFieldName = collection?.idField || "id";
        const parentIdCol = (table as any)[parentIdFieldName] as AnyPgColumn | undefined;

        const transformValue = (val: any, column?: AnyPgColumn): any => {
            if (val === null) return null;
            if (val === undefined) return undefined;
            if (val === "null") return null; // encoded null from URL
            if (Array.isArray(val)) return val.map(v => transformValue(v, column));
            if (typeof val === "object" && val.__type === "relation" && val.id !== undefined) {
                let idValue: any = val.id;
                if (typeof idValue === "string" && /^\d+$/.test(idValue)) {
                    const parsed = parseInt(idValue, 10);
                    if (!isNaN(parsed)) idValue = parsed;
                }
                return idValue;
            }
            return val;
        };

        for (const [key, value] of Object.entries(filter)) {
            if (!value) continue;
            const [op, rawVal] = value as [WhereFilterOp, any];
            const relDef = resolvedRelations[key];

            // Handle MANY cardinality relation specific operators (array-contains / array-contains-any)
            if (relDef && relDef.cardinality === "many") {
                if (op !== "array-contains" && op !== "array-contains-any") {
                    console.warn(`Relation filter '${key}' with cardinality 'many' only supports 'array-contains' or 'array-contains-any'. Skipping op '${op}'.`);
                    continue;
                }
                // Normalize value(s) to list of target IDs
                const normalizeIds = (val: any): any[] => {
                    if (val == null) return [];
                    if (Array.isArray(val)) return val.flatMap(v => normalizeIds(v));
                    if (typeof val === "object" && vHasId(val)) return [val.id];
                    return [val];
                };
                const vHasId = (v: any) => v && typeof v === "object" && (v.id !== undefined);
                const ids = op === "array-contains"
                    ? normalizeIds(rawVal).slice(0, 1)
                    : normalizeIds(rawVal);
                if (!ids.length) {
                    // No ids => condition can never match; add FALSE condition for deterministic behavior
                    extraConditions.push(sql`FALSE`);
                    continue;
                }

                // CASE 1: Many-to-many through junction (owning)
                if (relDef.through && relDef.direction === "owning") {
                    const junction = relDef.through;
                    const junctionTable = collectionRegistry.getTable(junction.table);
                    if (!junctionTable) {
                        console.warn(`Junction table '${junction.table}' not found for relation '${key}'`);
                        continue;
                    }
                    const sourceCol = junctionTable[junction.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
                    const targetCol = junctionTable[junction.targetColumn as keyof typeof junctionTable] as AnyPgColumn;
                    if (!sourceCol || !targetCol) {
                        console.warn(`Junction columns not found for relation '${key}'`);
                        continue;
                    }
                    if (ids.length === 1) {
                        extraConditions.push(sql`EXISTS (SELECT 1 FROM ${junctionTable} jt WHERE jt.${sql.raw(sourceCol.name)} = ${parentIdCol} AND jt.${sql.raw(targetCol.name)} = ${ids[0]})`);
                    } else {
                        const joined = sql.join(ids.map(i => sql`${i}`), sql`, `);
                        extraConditions.push(sql`EXISTS (SELECT 1 FROM ${junctionTable} jt WHERE jt.${sql.raw(sourceCol.name)} = ${parentIdCol} AND jt.${sql.raw(targetCol.name)} IN (${joined}))`);
                    }
                    continue;
                }

                // CASE 2: Many inverse with foreignKeyOnTarget (one-to-many)
                if (relDef.direction === "inverse" && relDef.foreignKeyOnTarget) {
                    try {
                        const targetCollection = relDef.target();
                        const targetTable = collectionRegistry.getTable(targetCollection.dbPath);
                        if (!targetTable) {
                            console.warn(`Target table not found for inverse many relation '${key}'`);
                            continue;
                        }
                        const targetIdFieldName = targetCollection.idField || "id";
                        const targetIdCol = (targetTable as any)[targetIdFieldName] as AnyPgColumn;
                        const fkCol = (targetTable as any)[relDef.foreignKeyOnTarget] as AnyPgColumn;
                        if (!targetIdCol || !fkCol) {
                            console.warn(`Missing columns for inverse many relation '${key}'`);
                            continue;
                        }
                        if (ids.length === 1) {
                            extraConditions.push(sql`EXISTS (SELECT 1 FROM ${targetTable} t WHERE t.${sql.raw(fkCol.name)} = ${parentIdCol} AND t.${sql.raw(targetIdCol.name)} = ${ids[0]})`);
                        } else {
                            const joined = sql.join(ids.map(i => sql`${i}`), sql`, `);
                            extraConditions.push(sql`EXISTS (SELECT 1 FROM ${targetTable} t WHERE t.${sql.raw(fkCol.name)} = ${parentIdCol} AND t.${sql.raw(targetIdCol.name)} IN (${joined}))`);
                        }
                        continue;
                    } catch (e) {
                        console.warn(`Failed building inverse many relation condition for '${key}'`, e);
                        continue;
                    }
                }

                // CASE 3: Many with joinPath (multi-hop)
                if (relDef.joinPath && relDef.joinPath.length > 0) {
                    try {
                        const steps = relDef.joinPath;
                        // Validate single-column joins only (skip composite for now)
                        if (steps.some(s => Array.isArray(s.on.from) || Array.isArray(s.on.to))) {
                            console.warn(`Composite key joinPath filtering not yet supported for relation '${key}'.`);
                            continue;
                        }
                        const parentTableName = getTableName(collection!);
                        const targetCollection = relDef.target();
                        const targetIdFieldName = targetCollection.idField || "id";
                        const finalTableName = steps[steps.length - 1].table;

                        // Build JOIN clauses
                        const prevAlias = parentTableName; // correlate to outer parent table
                        const joinClauses: string[] = [];
                        steps.forEach((step, index) => {
                            const joinTableName = step.table;
                            const fromCol = (step.on.from as string).split(".").pop();
                            const toCol = (step.on.to as string).split(".").pop();
                            if (!fromCol || !toCol) return;
                            // Correlate first step with parent table (outer query)
                            if (index === 0) {
                                joinClauses.push(`JOIN ${joinTableName} ON ${prevAlias}.${fromCol} = ${joinTableName}.${toCol}`);
                            } else {
                                const prevStepTable = steps[index - 1].table;
                                joinClauses.push(`JOIN ${joinTableName} ON ${prevStepTable}.${fromCol} = ${joinTableName}.${toCol}`);
                            }
                        });
                        const idPredicate = ids.length === 1
                            ? `${finalTableName}.${targetIdFieldName} = ${ids[0]}`
                            : `${finalTableName}.${targetIdFieldName} IN (${ids.map(i => typeof i === "number" ? i : `'${i}'`).join(",")})`;
                        const existsSQL = sql.raw(`EXISTS (SELECT 1 FROM ${parentTableName} ${joinClauses.join(" ")} WHERE ${parentTableName}.${parentIdFieldName} = ${parentTableName}.${parentIdFieldName} AND ${idPredicate})`);
                        extraConditions.push(existsSQL as any);
                        continue;
                    } catch (e) {
                        console.warn(`Failed building joinPath many relation condition for '${key}'`, e);
                        continue;
                    }
                }

                // CASE 4: Inverse many-to-many without explicit through (attempt auto-detect)
                if (relDef.direction === "inverse" && !relDef.foreignKeyOnTarget && !relDef.through) {
                    console.warn(`Auto-detection for inverse many-to-many filtering not implemented for relation '${key}'.`);
                    continue;
                }

                // If we reached here, configuration not recognized
                console.warn(`Unsupported many relation filtering configuration for '${key}'.`);
                continue;
            }

            // Inverse relation handling (foreign key on TARGET table)
            if (relDef && relDef.direction === "inverse" && relDef.foreignKeyOnTarget) {
                if (!collection) continue;
                if (!parentIdCol) continue;
                try {
                    const targetCollection = relDef.target();
                    const targetTable = collectionRegistry.getTable(targetCollection.dbPath);
                    if (!targetTable) {
                        console.warn("Target table not found for inverse relation filter", key);
                        continue;
                    }
                    const targetIdFieldName = targetCollection.idField || "id";
                    const targetIdCol = (targetTable as any)[targetIdFieldName] as AnyPgColumn;
                    const foreignKeyCol = (targetTable as any)[relDef.foreignKeyOnTarget] as AnyPgColumn;
                    if (!targetIdCol || !foreignKeyCol) {
                        console.warn("Missing target id or FK column for inverse relation", key);
                        continue;
                    }

                    const transformed = transformValue(rawVal, targetIdCol);

                    // Null filtering semantics: profile == null => NOT EXISTS (row linking parent). profile != null => EXISTS
                    if (transformed === null) {
                        if (op === "==") {
                            extraConditions.push(sql`NOT EXISTS (SELECT 1 FROM ${targetTable} WHERE ${foreignKeyCol} = ${parentIdCol})`);
                        } else if (op === "!=") {
                            extraConditions.push(sql`EXISTS (SELECT 1 FROM ${targetTable} WHERE ${foreignKeyCol} = ${parentIdCol})`);
                        }
                        continue;
                    }

                    // Supported ops for inverse relation id filters
                    if (op === "==") {
                        extraConditions.push(sql`EXISTS (SELECT 1 FROM ${targetTable} WHERE ${foreignKeyCol} = ${parentIdCol} AND ${targetIdCol} = ${transformed})`);
                        continue;
                    } else if (op === "!=") {
                        extraConditions.push(sql`NOT EXISTS (SELECT 1 FROM ${targetTable} WHERE ${foreignKeyCol} = ${parentIdCol} AND ${targetIdCol} = ${transformed})`);
                        continue;
                    } else if (op === "in") {
                        const listVals = Array.isArray(transformed) ? transformed : [transformed];
                        if (listVals.length > 0) {
                            const joined = sql.join(listVals.map(v => sql`${v}`));
                            extraConditions.push(sql`EXISTS (SELECT 1 FROM ${targetTable} WHERE ${foreignKeyCol} = ${parentIdCol} AND ${targetIdCol} IN (${joined}))`);
                        }
                        continue;
                    } else if (op === "array-contains" || op === "array-contains-any" || op === "not-in") {
                        // Future extension: implement semantics if needed
                        console.warn(`Operator '${op}' not currently supported for inverse relation filters on '${key}'.`);
                        continue;
                    } else {
                        console.warn(`Unsupported operator '${op}' for inverse relation filter on '${key}'.`);
                        continue;
                    }
                } catch (e) {
                    console.warn("Failed building inverse relation filter condition", key, e);
                    continue;
                }
            }

            // Owning relation with localKey mapping
            if (relDef && relDef.direction === "owning" && relDef.localKey) {
                const localKey = relDef.localKey;
                const column = (table as any)[localKey] as AnyPgColumn | undefined;
                const transformed = transformValue(rawVal, column);
                normalized[localKey] = [op, transformed];
            } else {
                const column = (table as any)[key] as AnyPgColumn | undefined;
                const transformed = transformValue(rawVal, column);
                normalized[key] = [op, transformed];
            }
        }

        const simpleConditions = DrizzleConditionBuilder.buildFilterConditions(normalized, table, collectionPath);
        return [...simpleConditions, ...extraConditions];
    }

    private getCollectionByPath(collectionPath: string): EntityCollection {
        const collection = collectionRegistry.getCollectionByPath(collectionPath);
        if (!collection) {
            throw new Error(`Collection not found: ${collectionPath}`);
        }
        return collection;
    }

    private getTableForCollection(collection: EntityCollection): PgTable<any> {
        const table = collectionRegistry.getTable(collection.dbPath);
        if (!table) {
            throw new Error(`Table not found for dbPath: ${collection.dbPath}`);
        }
        return table;
    }

    private getIdFieldInfo(collection: EntityCollection) {
        const idFieldName = collection.idField ?? "id";
        const idFieldConfig = collection.properties[idFieldName] as Property;

        if (!idFieldConfig) {
            throw new Error(`ID field '${idFieldName}' not found in properties for collection '${collection.slug || collection.dbPath}'`);
        }

        return {
            fieldName: idFieldName,
            type: idFieldConfig.type
        };
    }

    private parseIdValue(idValue: string | number, idType: string): string | number {
        if (idType === "number") {
            if (typeof idValue === "number") {
                return idValue;
            }

            const parsed = parseInt(String(idValue), 10);
            if (isNaN(parsed)) {
                throw new Error(`Invalid numeric ID: ${idValue}`);
            }
            return parsed;
        } else if (idType === "string") {
            return String(idValue);
        } else {
            throw new Error(`Unsupported ID type: ${idType}`);
        }
    }

    async fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> {
        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const parsedId = this.parseIdValue(entityId, idInfo.type);

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return undefined;

        const raw = result[0] as M;

        // Transform IDs back to relation objects and apply type conversion
        const values = await parseDataFromServer(raw, collection, this.db, collectionRegistry);

        // Load relations based on new cardinality system
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties));

        const relationPromises = Object.entries(resolvedRelations)
            .filter(([key]) => propertyKeys.has(key))
            .map(async ([key, relation]) => {
                if (relation.cardinality === "many") {
                    const relatedEntities = await this.fetchRelatedEntities(
                        collectionPath,
                        parsedId,
                        key,
                        {}
                    );
                    (values as any)[key] = relatedEntities.map(e => ({
                        id: e.id,
                        path: e.path,
                        __type: "relation"
                    }));
                } else if (relation.cardinality === "one") {
                    // Populate any missing one-to-one relation (owning or inverse), including joinPath-based
                    if ((values as any)[key] == null) {
                        try {
                            const relatedEntities = await this.fetchRelatedEntities(
                                collectionPath,
                                parsedId,
                                key,
                                { limit: 1 }
                            );
                            if (relatedEntities.length > 0) {
                                const e = relatedEntities[0];
                                (values as any)[key] = {
                                    id: e.id,
                                    path: e.path,
                                    __type: "relation"
                                };
                            }
                        } catch (e) {
                            console.warn(`Could not resolve one-to-one relation property: ${key}`, e);
                        }
                    }
                }
            });

        await Promise.all(relationPromises);

        return {
            id: entityId.toString(),
            path: collectionPath,
            values: values as M,
            databaseId
        };
    }

    /**
     * Unified method to fetch entities with optional search functionality
     */
    private async fetchEntitiesWithConditions<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        let query: any = this.db.select().from(table);
        const allConditions: SQL[] = [];

        // Add search conditions if search string is provided
        if (options.searchString) {
            const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                options.searchString,
                collection.properties,
                table
            );

            if (searchConditions.length === 0) {
                return []; // No searchable fields found - early return
            }

            allConditions.push(DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!);
        }

        // Add filter conditions
        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, table, collectionPath);
            if (filterConditions.length > 0) {
                allConditions.push(...filterConditions);
            }
        }

        // Apply all conditions
        if (allConditions.length > 0) {
            const finalCondition = DrizzleConditionBuilder.combineConditionsWithAnd(allConditions);
            if (finalCondition) {
                query = query.where(finalCondition);
            }
        }

        // Apply ordering
        const orderExpressions = [];
        if (options.orderBy) {
            const orderByField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
            if (orderByField) {
                orderExpressions.push(options.order === "asc" ? asc(orderByField) : desc(orderByField));
            }
        }

        // Default ordering by ID, always applied as a secondary sort
        orderExpressions.push(desc(idField));

        if (orderExpressions.length > 0) {
            query = query.orderBy(...orderExpressions);
        }

        // Apply startAfter pagination
        if (options.startAfter) {
            const startAfterConditions: SQL[] = [];

            // Handle pagination based on ordering fields
            if (options.orderBy) {
                const orderByField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
                if (orderByField) {
                    const startAfterOrderValue = options.startAfter.values?.[options.orderBy] ?? options.startAfter[options.orderBy];
                    const startAfterId = options.startAfter.id ?? options.startAfter[idInfo.fieldName];

                    if (startAfterOrderValue !== undefined && startAfterId !== undefined) {
                        if (options.order === "asc") {
                            // For ascending order: orderBy > startAfter OR (orderBy = startAfter AND id > startAfterId)
                            startAfterConditions.push(
                                or(
                                    gt(orderByField, startAfterOrderValue),
                                    and(
                                        eq(orderByField, startAfterOrderValue),
                                        gt(idField, startAfterId)
                                    )
                                )!
                            );
                        } else {
                            // For descending order: orderBy < startAfter OR (orderBy = startAfter AND id < startAfterId)
                            startAfterConditions.push(
                                or(
                                    lt(orderByField, startAfterOrderValue),
                                    and(
                                        eq(orderByField, startAfterOrderValue),
                                        lt(idField, startAfterId)
                                    )
                                )!
                            );
                        }
                    }
                }
            } else {
                // If no orderBy field, just use ID for pagination
                const startAfterId = options.startAfter.id ?? options.startAfter[idInfo.fieldName];
                if (startAfterId !== undefined) {
                    const parsedStartAfterId = this.parseIdValue(startAfterId, idInfo.type);
                    // Since default ordering is desc(idField), use lt for pagination
                    startAfterConditions.push(lt(idField, parsedStartAfterId));
                }
            }

            if (startAfterConditions.length > 0) {
                const startAfterCondition = DrizzleConditionBuilder.combineConditionsWithAnd(startAfterConditions);
                if (startAfterCondition) {
                    allConditions.push(startAfterCondition);
                    // Re-apply all conditions including startAfter
                    const finalCondition = DrizzleConditionBuilder.combineConditionsWithAnd(allConditions);
                    if (finalCondition) {
                        query = query.where(finalCondition);
                    }
                }
            }
        }

        // Apply limit (use search default of 50 if searching, otherwise use provided limit)
        const limitValue = options.searchString ? (options.limit || 50) : options.limit;
        if (limitValue) {
            query = query.limit(limitValue);
        }

        const results = await query;

        return this.processEntityResults<M>(results, collection, collectionPath, idInfo, options.databaseId);
    }

    /**
     * Process raw database results into Entity objects with relations
     */
    private async processEntityResults<M extends Record<string, any>>(
        results: any[],
        collection: EntityCollection,
        collectionPath: string,
        idInfo: { fieldName: string; type: string },
        databaseId?: string
    ): Promise<Entity<M>[]> {
        if (results.length === 0) return [];

        // First pass: parse all entities
        const entitiesWithValues = await Promise.all(results.map(async (entity: any) => {
            const values = await parseDataFromServer(entity as M, collection, this.db, collectionRegistry);
            return {
                entity,
                values,
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath
            };
        }));

        // Second pass: batch load missing one-to-one relations to avoid N+1 queries
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties));

        for (const [key, relation] of Object.entries(resolvedRelations)) {
            if (!propertyKeys.has(key) || relation.cardinality !== "one") continue;

            // Find entities missing this relation
            const entitiesMissingRelation = entitiesWithValues.filter(item =>
                (item.values as any)[key] == null
            );

            if (entitiesMissingRelation.length === 0) continue;

            try {
                // Batch load this relation for all entities that need it
                const entityIds = entitiesMissingRelation.map(item => item.entity[idInfo.fieldName]);
                const relationResults = await this.batchFetchRelatedEntities(
                    collectionPath,
                    entityIds,
                    key,
                    relation
                );

                // Map results back to entities
                entitiesMissingRelation.forEach(item => {
                    const entityId = item.entity[idInfo.fieldName];
                    const relatedEntity = relationResults.get(entityId);
                    if (relatedEntity) {
                        (item.values as any)[key] = {
                            id: relatedEntity.id,
                            path: relatedEntity.path,
                            __type: "relation"
                        };
                    }
                });
            } catch (e) {
                console.warn(`Could not batch load one-to-one relation property: ${key}`, e);
            }
        }

        // Handle many relations (these still need individual queries for now)
        const manyRelationPromises = entitiesWithValues.map(async (item) => {
            const manyRelationPromises = Object.entries(resolvedRelations)
                .filter(([key, relation]) => propertyKeys.has(key) && relation.cardinality === "many")
                .map(async ([key, relation]) => {
                    try {
                        const relatedEntities = await this.fetchRelatedEntities(
                            collectionPath,
                            item.entity[idInfo.fieldName],
                            key,
                            {}
                        );
                        (item.values as any)[key] = relatedEntities.map(e => ({
                            id: e.id,
                            path: e.path,
                            __type: "relation"
                        }));
                    } catch (e) {
                        console.warn(`Could not resolve many relation property: ${key}`, e);
                    }
                });
            await Promise.all(manyRelationPromises);
        });

        await Promise.all(manyRelationPromises);

        return entitiesWithValues.map(item => ({
            id: item.id,
            path: item.path,
            values: item.values as M,
            databaseId
        }));
    }

    async fetchCollection<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        // Handle multi-segment paths by resolving through relations
        if (collectionPath.includes("/")) {
            return this.fetchCollectionFromPath<M>(collectionPath, options);
        }

        // Use unified method for both search and regular fetch
        return this.fetchEntitiesWithConditions<M>(collectionPath, options);
    }

    async searchEntities<M extends Record<string, any>>(
        collectionPath: string,
        searchString: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        // Use unified method with search string
        return this.fetchEntitiesWithConditions<M>(collectionPath, {
            ...options,
            searchString
        });
    }

    private async fetchCollectionFromPath<M extends Record<string, any>>(
        path: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${path}. Expected format: collection/id/relation or collection/id/relation/id/relation`);
        }

        // Start with the root collection
        const rootCollectionPath = pathSegments[0];
        let currentCollection = this.getCollectionByPath(rootCollectionPath);
        let currentEntityId: string | number = pathSegments[1];

        // Navigate through the path using relations
        for (let i = 2; i < pathSegments.length; i += 2) {
            const relationKey = pathSegments[i];

            // Get relations for current collection
            const resolvedRelations = resolveCollectionRelations(currentCollection);
            const relation = resolvedRelations[relationKey];

            if (!relation) {
                throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
            }

            // If this is the final segment, fetch the related entities
            if (i === pathSegments.length - 1) {
                return this.fetchRelatedEntities<M>(
                    currentCollection.slug ?? currentCollection.dbPath,
                    currentEntityId,
                    relationKey,
                    options
                );
            }

            // If there are more segments, continue navigation
            if (i + 1 < pathSegments.length) {
                const nextEntityId = pathSegments[i + 1];
                currentCollection = relation.target();
                currentEntityId = nextEntityId;
            }
        }

        throw new Error(`Unable to resolve path: ${path}`);
    }

    /**
     * Fetch entities related to a parent entity through a specific relation
     */
    async fetchRelatedEntities<M extends Record<string, any>>(
        parentCollectionPath: string,
        parentEntityId: string | number,
        relationKey: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const parentCollection = this.getCollectionByPath(parentCollectionPath);
        const resolvedRelations = resolveCollectionRelations(parentCollection);
        const relation = resolvedRelations[relationKey];

        if (!relation) {
            throw new Error(`Relation '${relationKey}' not found in collection '${parentCollectionPath}'`);
        }

        return this.fetchEntitiesUsingJoins<M>(parentCollection, parentEntityId, relation, options);
    }

    // Updated fetchEntitiesUsingJoins implementation
    private async fetchEntitiesUsingJoins<M extends Record<string, any>>(
        parentCollection: EntityCollection,
        parentEntityId: string | number,
        relation: Relation,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const targetCollection = relation.target();
        const targetTable = this.getTableForCollection(targetCollection);
        const idInfo = this.getIdFieldInfo(targetCollection);
        const idField = targetTable[idInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Handle join path relations - this was missing!
        if (relation.joinPath && relation.joinPath.length > 0) {
            let query = this.db.select().from(parentTable);
            let currentTable = parentTable;

            // Apply each join in the path
            for (const join of relation.joinPath) {
                const joinTable = collectionRegistry.getTable(join.table);
                if (!joinTable) {
                    throw new Error(`Join table not found: ${join.table}`);
                }

                const fromColumn = Array.isArray(join.on.from) ? join.on.from[0] : join.on.from;
                const toColumn = Array.isArray(join.on.to) ? join.on.to[0] : join.on.to;

                const fromParts = fromColumn.split(".");
                const toParts = toColumn.split(".");

                const fromColName = fromParts[fromParts.length - 1];
                const toColName = toParts[toParts.length - 1];

                const fromCol = currentTable[fromColName as keyof typeof currentTable] as AnyPgColumn;
                const toCol = joinTable[toColName as keyof typeof joinTable] as AnyPgColumn;

                if (!fromCol || !toCol) {
                    throw new Error(`Join columns not found: ${fromColumn} -> ${toColumn}`);
                }

                query = query.innerJoin(joinTable, eq(fromCol, toCol)) as any;
                currentTable = joinTable;
            }

            // Add where condition for the parent entity
            const parentIdField = parentTable[(parentCollection.idField || "id") as keyof typeof parentTable] as AnyPgColumn;
            const parentCondition = eq(parentIdField, parsedParentId);

            // Build additional conditions array
            const additionalFilters: SQL[] = [];

            // Add search conditions if search string is provided
            if (options.searchString) {
                const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                    options.searchString,
                    targetCollection.properties,
                    targetTable
                );

                if (searchConditions.length === 0) {
                    return []; // No searchable fields found - early return
                }

                additionalFilters.push(DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!);
            }

            // Add filter conditions
            if (options.filter) {
                const filterConditions = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
                additionalFilters.push(...filterConditions);
            }

            // Combine parent condition with additional filters using AND
            const combinedWhere = DrizzleConditionBuilder.combineConditionsWithAnd([
                parentCondition,
                ...additionalFilters
            ].filter(Boolean) as SQL[]);

            if (combinedWhere) {
                query = query.where(combinedWhere) as any;
            }

            // Ordering
            if (options.orderBy) {
                const orderField = targetTable[options.orderBy as keyof typeof targetTable] as AnyPgColumn;
                if (orderField) {
                    query = query.orderBy(options.order === "asc" ? asc(orderField) : desc(orderField)) as any;
                }
            }

            if (options.limit) {
                query = query.limit(options.limit) as any;
            }

            const results = await query;
            const targetTableName = relation.joinPath[relation.joinPath.length - 1].table;

            return results.map((row: any) => {
                const entity = row[targetTableName] || row;
                return {
                    id: entity[idInfo.fieldName].toString(),
                    path: targetCollection.slug ?? targetCollection.dbPath,
                    values: entity as M,
                    databaseId: options.databaseId
                };
            });
        }

        // For owning relations with localKey, we need to first get the foreign key value from the parent entity
        let relationKeyValue = parsedParentId;
        if (relation.direction === "owning" && relation.localKey) {
            // First, fetch the foreign key value from the parent entity
            const localKeyCol = parentTable[relation.localKey as keyof typeof parentTable] as AnyPgColumn;
            if (!localKeyCol) {
                throw new Error(`Local key column '${relation.localKey}' not found in parent table`);
            }

            const parentQuery = this.db.select({
                [relation.localKey]: localKeyCol
            }).from(parentTable).where(eq(parentIdCol, parsedParentId)).limit(1);

            const parentResult = await parentQuery;
            if (parentResult.length === 0) {
                return []; // Parent entity not found
            }

            const foreignKeyValue = parentResult[0][relation.localKey];
            if (foreignKeyValue == null) {
                return []; // Foreign key is null, no related entity
            }

            // Ensure the foreign key value is of the correct type
            relationKeyValue = typeof foreignKeyValue === "string" || typeof foreignKeyValue === "number"
                ? foreignKeyValue
                : String(foreignKeyValue);
        }

        // Build additional filter conditions
        const additionalFilters: SQL[] = [];

        // Add search conditions if search string is provided
        if (options.searchString) {
            const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                options.searchString,
                targetCollection.properties,
                targetTable
            );

            if (searchConditions.length === 0) {
                return []; // No searchable fields found - early return
            }

            additionalFilters.push(DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!);
        }

        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
            additionalFilters.push(...filterConditions);
        }

        // Explicitly combine search and filter conditions with AND so tests can spy this call
        const combinedAdditional = DrizzleConditionBuilder.combineConditionsWithAnd(additionalFilters);

        // Start query from target table
        let query: any = this.db.select().from(targetTable);

        // Use unified query builder from DrizzleConditionBuilder
        query = DrizzleConditionBuilder.buildRelationQuery(
            query,
            relation,
            relationKeyValue,
            targetTable,
            parentTable,
            parentIdCol,
            idField,
            collectionRegistry,
            combinedAdditional ? [combinedAdditional] : undefined
        );

        // Ordering
        const orderExpressions = [] as any[];
        if (options.orderBy) {
            const orderField = targetTable[options.orderBy as keyof typeof targetTable] as AnyPgColumn;
            if (orderField) orderExpressions.push(options.order === "asc" ? asc(orderField) : desc(orderField));
        }
        orderExpressions.push(desc(idField));
        if (orderExpressions.length > 0) query = query.orderBy(...orderExpressions);

        if (options.limit) query = query.limit(options.limit);

        const results = await query;
        const entityPromises = results.map(async (row: any) => {
            const entity = row[getTableName(targetCollection)] || row;
            const values = await parseDataFromServer(entity as M, targetCollection, this.db, collectionRegistry);

            // Apply the SAME relation population logic as fetchEntity - this was missing!
            const resolvedRelations = resolveCollectionRelations(targetCollection);
            const propertyKeys = new Set(Object.keys(targetCollection.properties));
            const relationPromises = Object.entries(resolvedRelations)
                .filter(([key]) => propertyKeys.has(key))
                .map(async ([key, relation]) => {
                    if (relation.cardinality === "one") {
                        // Populate any missing one-to-one relation
                        if ((values as any)[key] == null) {
                            try {
                                const relatedEntities = await this.fetchRelatedEntities(
                                    targetCollection.slug ?? targetCollection.dbPath,
                                    entity[idInfo.fieldName],
                                    key,
                                    { limit: 1 }
                                );
                                if (relatedEntities.length > 0) {
                                    const e = relatedEntities[0];
                                    (values as any)[key] = {
                                        id: e.id,
                                        path: e.path,
                                        __type: "relation"
                                    };
                                }
                            } catch (e) {
                                console.warn(`Could not resolve one-to-one relation property: ${key}`, e);
                                throw e;
                            }
                        }
                    }
                });
            await Promise.all(relationPromises);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: targetCollection.slug ?? targetCollection.dbPath,
                values: values as M,
                databaseId: options.databaseId
            };
        });
        return Promise.all(entityPromises);
    }

    /**
     * Count entities from multi-segment path using relations
     */
    private async countEntitiesFromPath<M extends Record<string, any>>(
        path: string,
        options: { filter?: FilterValues<Extract<keyof M, string>>; databaseId?: string } = {}
    ): Promise<number> {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${path}. Expected format: collection/id/relation or collection/id/relation/id/relation`);
        }

        // Start with the root collection
        const rootCollectionPath = pathSegments[0];
        let currentCollection = this.getCollectionByPath(rootCollectionPath);
        let currentEntityId: string | number = pathSegments[1];

        // Navigate through the path using relations
        for (let i = 2; i < pathSegments.length; i += 2) {
            const relationKey = pathSegments[i];

            // Get relations for current collection
            const resolvedRelations = resolveCollectionRelations(currentCollection);
            const relation = resolvedRelations[relationKey];

            if (!relation) {
                throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
            }

            // If this is the final segment, count the related entities
            if (i === pathSegments.length - 1) {
                return this.countRelatedEntities<M>(
                    currentCollection.slug ?? currentCollection.dbPath,
                    currentEntityId,
                    relationKey,
                    options
                );
            }

            // If there are more segments, continue navigation
            if (i + 1 < pathSegments.length) {
                const nextEntityId = pathSegments[i + 1];
                currentCollection = relation.target();
                currentEntityId = nextEntityId;
            }
        }

        throw new Error(`Unable to resolve path: ${path}`);
    }

    generateEntityId(): string {
        // For PostgreSQL with auto-increment IDs, we don\'t need to pre-generate
        // The database will assign the ID on insert
        return Date.now().toString() + Math.random().toString(36).substring(2, 7);
    }

    // Updated countRelatedEntities implementation
    private async countRelatedEntities<M extends Record<string, any>>(
        parentCollectionPath: string,
        parentEntityId: string | number,
        relationKey: string,
        options: { filter?: FilterValues<Extract<keyof M, string>>; databaseId?: string } = {}
    ): Promise<number> {
        const parentCollection = this.getCollectionByPath(parentCollectionPath);
        const resolvedRelations = resolveCollectionRelations(parentCollection);
        const relation = resolvedRelations[relationKey];
        if (!relation) throw new Error(`Relation '${relationKey}' not found in collection '${parentCollectionPath}'`);

        const targetCollection = relation.target();
        const targetTable = this.getTableForCollection(targetCollection);
        const targetIdInfo = this.getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Start count with distinct to avoid duplicates from junction tables
        let query: any = this.db.select({ count: sql<number>`count(distinct ${targetIdField})` }).from(targetTable);

        // Build additional filter conditions
        const additionalFilters: SQL[] = [];
        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
            additionalFilters.push(...filterConditions);
        }

        // Use unified count query builder from DrizzleConditionBuilder
        query = DrizzleConditionBuilder.buildRelationCountQuery(
            query,
            relation,
            parsedParentId,
            targetTable,
            parentTable,
            parentIdCol,
            targetIdField,
            collectionRegistry,
            additionalFilters
        );

        const result = await query;
        return Number(result[0]?.count || 0);
    }

    async deleteEntity(collectionPath: string, entityId: string | number, _databaseId?: string): Promise<void> {
        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const parsedId = this.parseIdValue(entityId, idInfo.type);

        await this.db
            .delete(table)
            .where(eq(idField, parsedId));
    }

    async checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        _databaseId?: string
    ): Promise<boolean> {
        if (value === undefined || value === null) return true;

        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        const field = table[fieldName as keyof typeof table] as AnyPgColumn;

        if (!field) return true; // Field doesn't exist, consider it unique

        // Build unique field conditions using the unified utility
        const parsedExcludeId = excludeEntityId ? this.parseIdValue(excludeEntityId, idInfo.type) : undefined;
        const conditions = DrizzleConditionBuilder.buildUniqueFieldCondition(
            field,
            value,
            idField,
            parsedExcludeId
        );

        const result = await this.db
            .select({ count: count() })
            .from(table)
            .where(and(...conditions));

        const countResult = Number(result[0]?.count || 0);
        return countResult === 0;
    }

    async countEntities<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            databaseId?: string;
        } = {}
    ): Promise<number> {
        // Handle multi-segment paths
        if (collectionPath.includes("/")) {
            return this.countEntitiesFromPath<M>(collectionPath, options);
        }

        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);

        let query: any = this.db.select({ count: count() }).from(table);

        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, table, collectionPath);
            if (filterConditions.length > 0) {
                query = query.where(and(...filterConditions));
            }
        }

        const result = await query;
        return Number(result[0]?.count || 0);
    }

    async saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>> {
        // If saving under a nested relation path (e.g., authors/70/posts/139/comments)
        // resolve the parent relation and inject the FK field into values automatically
        let effectiveCollectionPath = collectionPath;
        const effectiveValues: Partial<M> = { ...values };

        if (collectionPath.includes("/")) {
            const segments = collectionPath.split("/").filter(Boolean);
            if (segments.length >= 3 && segments.length % 2 === 1) {
                // Traverse to the parent collection for the final relation
                const rootSegment = segments[0];
                let currentCollection = this.getCollectionByPath(rootSegment);
                let currentEntityId: string | number = segments[1];

                for (let i = 2; i < segments.length; i += 2) {
                    const relationKey = segments[i];

                    // If we're at the last segment, we are saving into the target of this relation
                    const resolvedRelations = resolveCollectionRelations(currentCollection);
                    const relation = resolvedRelations[relationKey];
                    if (!relation) {
                        throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
                    }

                    if (i === segments.length - 1) {
                        // Parent is currentCollection, and target is relation.target()
                        const targetCollection = relation.target();
                        effectiveCollectionPath = targetCollection.slug ?? targetCollection.dbPath;

                        // For many-to-many relationships with junction tables, we need special handling
                        if (relation.cardinality === "many" && relation.through) {
                            // For many-to-many with junction table, we don't modify the target entity
                            // The junction table relationship will be handled after the target entity is saved
                            // We store the parent info for later use in junction table creation
                            const parentIdInfo = this.getIdFieldInfo(currentCollection);
                            const parsedParentId = this.parseIdValue(currentEntityId, parentIdInfo.type);

                            // Store metadata for junction table handling
                            (effectiveValues as any).__junction_table_info = {
                                parentCollection: currentCollection,
                                parentId: parsedParentId,
                                relation: relation,
                                relationKey: relationKey
                            };
                            break; // resolved final target
                        }

                        // For path-based saving, we need to find the FK column that should store the parent ID
                        let targetColumnName: string;

                        if (relation.localKey) {
                            // Use localKey if available (preferred approach)
                            targetColumnName = relation.localKey;
                        } else if (relation.foreignKeyOnTarget) {
                            // Use foreignKeyOnTarget for inverse relations
                            targetColumnName = relation.foreignKeyOnTarget;
                        } else if (relation.joinPath && relation.joinPath.length > 0) {
                            // Find the join step where the target table is the one we're saving to
                            const targetTableName = getTableName(targetCollection);
                            const relevantJoinStep = relation.joinPath.find(joinStep => joinStep.table === targetTableName);

                            if (relevantJoinStep) {
                                // For join steps to the target table, to represents the FK column in target table
                                const targetColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(relevantJoinStep.on.to);
                                targetColumnName = targetColumnNames[0];
                            } else {
                                // Fallback: use the first join step's to column
                                console.warn(`Could not find specific join step for target table ${targetTableName} in relation '${relationKey}'. Using first join step as fallback.`);
                                const targetColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(relation.joinPath[0].on.to);
                                targetColumnName = targetColumnNames[0];
                            }
                        } else {
                            throw new Error(`Relation '${relationKey}' in '${currentCollection.slug || currentCollection.dbPath}' lacks configuration for path-based saving (no localKey, foreignKeyOnTarget, or joinPath).`);
                        }

                        const parentIdInfo = this.getIdFieldInfo(currentCollection);
                        const parsedParentId = this.parseIdValue(currentEntityId, parentIdInfo.type);

                        const existingValue = (effectiveValues as any)[targetColumnName];
                        if (existingValue !== undefined && existingValue !== null && existingValue !== parsedParentId) {
                            console.warn(`Overriding provided value '${existingValue}' for FK '${targetColumnName}' with path parent id '${parsedParentId}' (path takes precedence).`);
                        }
                        (effectiveValues as any)[targetColumnName] = parsedParentId;
                        break; // resolved final target
                    } else {
                        // Move deeper in the chain
                        const nextEntityId = segments[i + 1];
                        currentCollection = relation.target();
                        currentEntityId = nextEntityId;
                    }
                }
            }
        }

        const collection = this.getCollectionByPath(effectiveCollectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${effectiveCollectionPath}'`);
        }

        // Separate relations that require special handling
        const relationValues: Record<string, any> = {};
        const otherValues: Partial<M> = { ...effectiveValues };

        const resolvedRelations = resolveCollectionRelations(collection);

        for (const key in resolvedRelations) {
            const relation = resolvedRelations[key];
            if (relation && relation.cardinality === "many") {
                if (Object.prototype.hasOwnProperty.call(otherValues, key)) {
                    relationValues[key] = otherValues[key as keyof M];
                    delete otherValues[key as keyof M];
                }
            }
        }

        // Transform relations to IDs, then sanitize
        const processedData = serializeDataToServer(otherValues as M, collection.properties as Properties, collection);

        // Extract relation updates before sanitizing
        const inverseRelationUpdates = (processedData as any).__inverseRelationUpdates || [];
        const joinPathRelationUpdates = (processedData as any).__joinPathRelationUpdates || [];
        const junctionTableInfo = (processedData as any).__junction_table_info;
        delete (processedData as any).__inverseRelationUpdates;
        delete (processedData as any).__joinPathRelationUpdates;
        delete (processedData as any).__junction_table_info;

        const entityData = sanitizeAndConvertDates(processedData);

        const savedId = await this.db.transaction(async (tx) => {
            let currentId: string | number;

            if (entityId) {
                // Update existing entity
                currentId = this.parseIdValue(entityId, idInfo.type);
                await tx
                    .update(table)
                    .set(entityData)
                    .where(eq(idField, currentId));
            } else {
                const dataForInsert = { ...entityData };
                // Don't include the ID in the insert statement, so the database can generate it
                if (idInfo.fieldName in dataForInsert) {
                    delete (dataForInsert as any)[idInfo.fieldName];
                }

                const result = await tx
                    .insert(table)
                    .values(dataForInsert)
                    .returning({ id: idField });

                currentId = result[0].id as string | number;
            }

            // Handle inverse relation updates
            if (inverseRelationUpdates.length > 0) {
                await this.updateInverseRelations(tx, collection, currentId, inverseRelationUpdates);
            }

            // Update many-to-many relations using the new join system
            if (Object.keys(relationValues).length > 0) {
                await this.updateRelationsUsingJoins(tx, collection, currentId, relationValues);
            }

            // Apply joinPath one-to-one relation updates
            if (joinPathRelationUpdates.length > 0) {
                await this.updateJoinPathOneToOneRelations(tx, collection, currentId, joinPathRelationUpdates);
            }

            // Handle junction table creation for many-to-many path-based saves
            // Only create junction table entries for NEW entities, not updates
            if (junctionTableInfo && !entityId) {
                await this.handleJunctionTableCreation(tx, currentId, junctionTableInfo);
            }

            return currentId;
        });

        // Fetch the updated/created entity to return with proper relation objects
        const finalEntity = await this.fetchEntity<M>(collection.dbPath ?? collection.slug, savedId, databaseId);
        if (!finalEntity) throw new Error("Could not fetch entity after save.");
        return finalEntity;
    }

    /**
     * Batch fetch related entities for multiple parent entities to avoid N+1 queries
     */
    private async batchFetchRelatedEntities(
        parentCollectionPath: string,
        parentEntityIds: (string | number)[],
        relationKey: string,
        relation: Relation
    ): Promise<Map<string | number, Entity<any>>> {
        if (parentEntityIds.length === 0) return new Map();

        const parentCollection = this.getCollectionByPath(parentCollectionPath);
        const targetCollection = relation.target();
        const targetTable = this.getTableForCollection(targetCollection);
        const targetIdInfo = this.getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Parse all parent IDs once
        const parsedParentIds = parentEntityIds.map(id => this.parseIdValue(id, parentIdInfo.type));

        // Handle join path relations with batching
        if (relation.joinPath && relation.joinPath.length > 0) {
            let query = this.db.select().from(parentTable);
            let currentTable = parentTable;

            // Apply each join in the path
            for (const join of relation.joinPath) {
                const joinTable = collectionRegistry.getTable(join.table);
                if (!joinTable) {
                    throw new Error(`Join table not found: ${join.table}`);
                }

                const fromColumn = Array.isArray(join.on.from) ? join.on.from[0] : join.on.from;
                const toColumn = Array.isArray(join.on.to) ? join.on.to[0] : join.on.to;

                const fromParts = fromColumn.split(".");
                const toParts = toColumn.split(".");

                const fromColName = fromParts[fromParts.length - 1];
                const toColName = toParts[toParts.length - 1];

                const fromCol = currentTable[fromColName as keyof typeof currentTable] as AnyPgColumn;
                const toCol = joinTable[toColName as keyof typeof joinTable] as AnyPgColumn;

                if (!fromCol || !toCol) {
                    throw new Error(`Join columns not found: ${fromColumn} -> ${toColumn}`);
                }

                query = query.innerJoin(joinTable, eq(fromCol, toCol)) as any;
                currentTable = joinTable;
            }

            // Add where condition for ALL parent entities at once
            const parentIdField = parentTable[(parentCollection.idField || "id") as keyof typeof parentTable] as AnyPgColumn;
            query = query.where(inArray(parentIdField, parsedParentIds)) as any;

            const results = await query;
            const targetTableName = relation.joinPath[relation.joinPath.length - 1].table;
            const resultMap = new Map<string | number, Entity<any>>();

            // Group results by parent ID
            results.forEach((row: any) => {
                const parentEntity = row[getTableName(parentCollection)] || row;
                const targetEntity = row[targetTableName] || row;
                const parentId = parentEntity[parentIdInfo.fieldName];

                resultMap.set(parentId, {
                    id: targetEntity[targetIdInfo.fieldName].toString(),
                    path: targetCollection.slug ?? targetCollection.dbPath,
                    values: targetEntity
                });
            });

            return resultMap;
        }

        // Handle other relation types with batching
        let query: any = this.db.select().from(targetTable);

        // Build the relation query with ALL parent IDs
        query = DrizzleConditionBuilder.buildRelationQuery(
            query,
            relation,
            parsedParentIds, // Pass array instead of single ID
            targetTable,
            parentTable,
            parentIdCol,
            targetIdField,
            collectionRegistry,
            []
        );

        const results = await query;
        const resultMap = new Map<string | number, Entity<any>>();

        // Map results back to parent entities
        // For one-to-one relations, we need to determine which parent each result belongs to
        // based on the foreign key relationship
        results.forEach((row: any) => {
            const targetEntity = row[getTableName(targetCollection)] || row;

            // Determine the parent ID this result belongs to based on the relation type
            let parentId: string | number | undefined;

            if (relation.direction === "inverse" && relation.foreignKeyOnTarget) {
                // For inverse relations, the foreign key is on the target table
                parentId = targetEntity[relation.foreignKeyOnTarget];
            } else if (relation.direction === "inverse" && relation.cardinality === "one" && relation.inverseRelationName) {
                // For auto-inferred foreign keys, use the pattern: {inverseRelationName}_id
                const inferredForeignKeyName = `${relation.inverseRelationName}_id`;
                parentId = targetEntity[inferredForeignKeyName];
            } else if (relation.direction === "owning" && relation.localKey) {
                // For owning relations, we need to find which parent has this target entity ID
                const targetId = targetEntity[targetIdInfo.fieldName];
                // Find the parent that references this target entity
                for (const parsedParentId of parsedParentIds) {
                    // This is a simplification - in a real owning relation, we'd need to check
                    // the parent entity's foreign key field to see if it matches this target ID
                    // For now, we'll map the first available parent (this needs refinement)
                    if (!resultMap.has(parsedParentId)) {
                        parentId = parsedParentId;
                        break;
                    }
                }
            }

            // Only add to result map if we successfully determined the parent ID
            // and it's one of the requested parent IDs
            if (parentId !== undefined && parsedParentIds.includes(parentId)) {
                resultMap.set(parentId, {
                    id: targetEntity[targetIdInfo.fieldName].toString(),
                    path: targetCollection.slug ?? targetCollection.dbPath,
                    values: targetEntity
                });
            }
        });

        return resultMap;
    }

    private async updateRelationsUsingJoins<M extends Record<string, any>>(
        tx: NodePgDatabase<any>,
        collection: EntityCollection,
        entityId: string | number,
        relationValues: Partial<M>
    ) {
        const resolvedRelations = resolveCollectionRelations(collection);

        for (const [key, value] of Object.entries(relationValues)) {
            const relation = resolvedRelations[key];
            if (!relation || relation.cardinality !== "many") continue;

            const targetEntityIds = (value && Array.isArray(value)) ? value.map((rel: any) => rel.id) : [];
            const targetCollection = relation.target();

            // Use joinPath if available, otherwise handle through property
            if (relation.joinPath && relation.joinPath.length > 0) {
                // Find the junction table - it should be the table that's not the parent or target
                const parentTableName = getTableName(collection);
                const targetTableName = getTableName(targetCollection);

                let junctionTable: PgTable<any> | null = null;
                let sourceJunctionColumn: AnyPgColumn | null = null;
                let targetJunctionColumn: AnyPgColumn | null = null;

                for (const joinStep of relation.joinPath) {
                    const joinTableObj = collectionRegistry.getTable(joinStep.table);
                    if (!joinTableObj) continue;

                    // Check if this is the junction table (not parent or target table)
                    if (joinStep.table !== parentTableName && joinStep.table !== targetTableName) {
                        junctionTable = joinTableObj;

                        const sourceColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.from);
                        const targetColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.to);
                        const sourceColumnName = sourceColumnNames[0]; // Use first column for simple FK cases
                        const targetColumnName = targetColumnNames[0]; // Use first column for simple FK cases

                        sourceJunctionColumn = junctionTable[sourceColumnName as keyof typeof junctionTable] as AnyPgColumn;
                        targetJunctionColumn = junctionTable[targetColumnName as keyof typeof junctionTable] as AnyPgColumn;
                        break;
                    }
                }

                if (!junctionTable || !sourceJunctionColumn || !targetJunctionColumn) {
                    console.warn(`Could not determine junction table for relation '${key}' in collection '${collection.slug || collection.dbPath}'`);
                    continue;
                }

                const parentIdInfo = this.getIdFieldInfo(collection);
                const parsedParentId = this.parseIdValue(entityId, parentIdInfo.type);

                // Delete existing relations for this entity
                await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedParentId));

                if (targetEntityIds.length > 0) {
                    const targetIdInfo = this.getIdFieldInfo(targetCollection);
                    const parsedTargetIds = targetEntityIds.map(id => this.parseIdValue(id, targetIdInfo.type));

                    const newLinks = parsedTargetIds.map(targetId => ({
                        [sourceJunctionColumn.name]: parsedParentId,
                        [targetJunctionColumn.name]: targetId
                    }));

                    if (newLinks.length > 0) {
                        await tx.insert(junctionTable).values(newLinks);
                    }
                }
            } else if (relation.through && relation.cardinality === "many" && relation.direction === "owning") {
                // Handle many-to-many relations with junction table using 'through' property
                const junctionTable = collectionRegistry.getTable(relation.through.table);
                if (!junctionTable) {
                    console.warn(`Junction table '${relation.through.table}' not found for relation '${key}' in collection '${collection.slug || collection.dbPath}'`);
                    continue;
                }

                const sourceJunctionColumn = junctionTable[relation.through.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
                const targetJunctionColumn = junctionTable[relation.through.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

                if (!sourceJunctionColumn) {
                    console.warn(`Source column '${relation.through.sourceColumn}' not found in junction table '${relation.through.table}' for relation '${key}'`);
                    continue;
                }

                if (!targetJunctionColumn) {
                    console.warn(`Target column '${relation.through.targetColumn}' not found in junction table '${relation.through.table}' for relation '${key}'`);
                    continue;
                }

                const parentIdInfo = this.getIdFieldInfo(collection);
                const parsedParentId = this.parseIdValue(entityId, parentIdInfo.type);

                // Delete existing relations for this entity
                await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedParentId));

                if (targetEntityIds.length > 0) {
                    const targetIdInfo = this.getIdFieldInfo(targetCollection);
                    const parsedTargetIds = targetEntityIds.map(id => this.parseIdValue(id, targetIdInfo.type));

                    const newLinks = parsedTargetIds.map(targetId => ({
                        [sourceJunctionColumn.name]: parsedParentId,
                        [targetJunctionColumn.name]: targetId
                    }));

                    if (newLinks.length > 0) {
                        await tx.insert(junctionTable).values(newLinks);
                    }
                }
            } else if (relation.cardinality === "many" && relation.direction === "inverse" && relation.foreignKeyOnTarget) {
                // Handle one-to-many (inverse) by updating target FK to point to parent
                const targetTable = this.getTableForCollection(targetCollection);
                const targetIdInfo = this.getIdFieldInfo(targetCollection);
                const targetIdCol = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;
                const fkCol = targetTable[relation.foreignKeyOnTarget as keyof typeof targetTable] as AnyPgColumn;

                if (!fkCol || !targetIdCol) {
                    console.warn(`Invalid inverse-many config for relation '${key}' in collection '${collection.slug || collection.dbPath}'`);
                    continue;
                }

                const parentIdInfo = this.getIdFieldInfo(collection);
                const parsedParentId = this.parseIdValue(entityId, parentIdInfo.type);

                // Clear existing links not in the new set
                if (targetEntityIds.length > 0) {
                    const parsedTargetIds = targetEntityIds.map(id => this.parseIdValue(id, targetIdInfo.type));
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget]: null })
                        .where(and(eq(fkCol, parsedParentId), sql`${targetIdCol} NOT IN (${sql.join(parsedTargetIds)})`));

                    // Set FK for the provided targets
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget]: parsedParentId })
                        .where(inArray(targetIdCol as any, parsedTargetIds as any));
                } else {
                    // If empty array provided, clear all existing links for this parent
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget]: null })
                        .where(eq(fkCol, parsedParentId));
                }
            } else {
                // Skip many-to-many relations that don't have joinPath or through defined
                console.warn(`Many relation '${key}' in collection '${collection.slug || collection.dbPath}' lacks write configuration (no joinPath with junction, no through, or no foreignKeyOnTarget) and will be skipped during save.`);
            }
        }
    }

    /**
     * Handle many-to-many inverse relation updates using junction tables
     */
    private async updateManyToManyInverseRelation(
        tx: NodePgDatabase<any>,
        sourceCollection: EntityCollection,
        sourceEntityId: string | number,
        targetCollection: EntityCollection,
        relation: Relation,
        newValue: any,
        junctionInfo: { table: string; sourceColumn: string; targetColumn: string }
    ) {
        try {
            const junctionTable = collectionRegistry.getTable(junctionInfo.table);
            if (!junctionTable) {
                console.warn(`Junction table '${junctionInfo.table}' not found for many-to-many inverse relation '${relation.relationName}'`);
                return;
            }

            const sourceJunctionColumn = junctionTable[junctionInfo.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
            const targetJunctionColumn = junctionTable[junctionInfo.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

            if (!sourceJunctionColumn) {
                console.warn(`Source column '${junctionInfo.sourceColumn}' not found in junction table '${junctionInfo.table}' for relation '${relation.relationName}'`);
                return;
            }

            if (!targetJunctionColumn) {
                console.warn(`Target column '${junctionInfo.targetColumn}' not found in junction table '${junctionInfo.table}' for relation '${relation.relationName}'`);
                return;
            }

            const sourceIdInfo = this.getIdFieldInfo(sourceCollection);
            const parsedSourceId = this.parseIdValue(sourceEntityId, sourceIdInfo.type);

            // Clear existing entries for this source entity
            await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedSourceId));

            // Add new entries if newValue is provided
            if (newValue && Array.isArray(newValue) && newValue.length > 0) {
                const targetIdInfo = this.getIdFieldInfo(targetCollection);
                const targetEntityIds = newValue.map((rel: any) => rel.id);
                const parsedTargetIds = targetEntityIds.map(id => this.parseIdValue(id, targetIdInfo.type));

                const newLinks = parsedTargetIds.map(targetId => ({
                    [sourceJunctionColumn.name]: parsedSourceId,
                    [targetJunctionColumn.name]: targetId
                }));

                if (newLinks.length > 0) {
                    await tx.insert(junctionTable).values(newLinks);
                }
            }
        } catch (error) {
            console.error(`Failed to update many-to-many inverse relation '${relation.relationName}':`, error);
            throw error;
        }
    }

    private async updateJoinPathOneToOneRelations(
        tx: NodePgDatabase<any>,
        parentCollection: EntityCollection,
        parentEntityId: string | number,
        updates: Array<{
            relationKey: string;
            relation: Relation;
            newTargetId: any;
        }>
    ) {
        for (const upd of updates) {
            const {
                relation,
                newTargetId
            } = upd;
            const targetCollection = relation.target();
            const targetTable = this.getTableForCollection(targetCollection);
            const targetIdInfo = this.getIdFieldInfo(targetCollection);
            const targetIdCol = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

            // Determine mapping of columns
            const {
                targetFKColName,
                parentSourceColName
            } = this.resolveJoinPathWriteMapping(parentCollection, relation);
            const parentTable = this.getTableForCollection(parentCollection);
            const parentIdInfo = this.getIdFieldInfo(parentCollection);
            const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);

            const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;
            const parentSourceCol = parentTable[parentSourceColName as keyof typeof parentTable] as AnyPgColumn;
            const targetFKCol = targetTable[targetFKColName as keyof typeof targetTable] as AnyPgColumn;

            if (!parentSourceCol) {
                console.warn(`Parent source column '${parentSourceColName}' not found for joinPath relation '${relation.relationName}'`);
                continue;
            }
            if (!targetFKCol) {
                console.warn(`Target FK column '${targetFKColName}' not found for joinPath relation '${relation.relationName}'`);
                continue;
            }

            // Fetch the parent row to obtain the value for parentSourceCol (e.g., posts.author_id)
            const parentRows = await tx
                .select({ val: parentSourceCol })
                .from(parentTable)
                .where(eq(parentIdCol, parsedParentId))
                .limit(1);
            if (parentRows.length === 0) continue;
            const parentFKValue = parentRows[0].val as string | number | null;

            if (newTargetId === null || newTargetId === undefined) {
                // Clear any target rows currently linked to this parent via the FK
                if (parentFKValue !== null && parentFKValue !== undefined) {
                    await tx.update(targetTable)
                        .set({ [targetFKColName]: null })
                        .where(eq(targetFKCol, parentFKValue as any));
                }
                continue;
            }

            // Parse the new target id
            const parsedTargetId = this.parseIdValue(newTargetId, targetIdInfo.type);

            // Ensure one-to-one by clearing existing link from any target rows with this parent FK
            if (parentFKValue !== null && parentFKValue !== undefined) {
                await tx.update(targetTable)
                    .set({ [targetFKColName]: null })
                    .where(eq(targetFKCol, parentFKValue as any));
            } else {
                // If we can't resolve parent FK value, we can't set the link
                console.warn(`Cannot set joinPath relation '${relation.relationName}' because parent FK value is null/undefined (source column '${parentSourceColName}')`);
                continue;
            }

            // Now set the FK on the target entity
            await tx.update(targetTable)
                .set({ [targetFKColName]: parentFKValue as any })
                .where(eq(targetIdCol, parsedTargetId));
        }
    }

    private async updateInverseRelations(
        tx: NodePgDatabase<any>,
        sourceCollection: EntityCollection,
        sourceEntityId: string | number,
        inverseRelationUpdates: Array<{
            relationKey: string;
            relation: Relation;
            newValue: any;
            currentEntityId?: string | number;
        }>
    ) {
        for (const update of inverseRelationUpdates) {
            const {
                relation,
                newValue
            } = update;

            try {
                const targetCollection = relation.target();
                const targetTable = this.getTableForCollection(targetCollection);
                const targetIdInfo = this.getIdFieldInfo(targetCollection);
                const sourceIdInfo = this.getIdFieldInfo(sourceCollection);

                // Check if this is a many-to-many inverse relation that should use junction tables
                if (relation.cardinality === "many" && relation.direction === "inverse") {
                    // For many-to-many inverse relations, we need to find the corresponding owning relation
                    // to get the junction table information
                    const targetCollectionRelations = resolveCollectionRelations(targetCollection);
                    let junctionInfo: { table: string; sourceColumn: string; targetColumn: string } | null = null;

                    // Look for the corresponding owning relation
                    for (const [relationKey, targetRelation] of Object.entries(targetCollectionRelations)) {
                        if (targetRelation.cardinality === "many" &&
                            targetRelation.direction === "owning" &&
                            targetRelation.through &&
                            (targetRelation.relationName === relation.inverseRelationName || relationKey === relation.inverseRelationName)) {

                            // Found the corresponding owning relation with junction table info
                            // For inverse relation, we need to swap source and target columns
                            junctionInfo = {
                                table: targetRelation.through.table,
                                sourceColumn: targetRelation.through.targetColumn, // Swapped
                                targetColumn: targetRelation.through.sourceColumn // Swapped
                            };
                            break;
                        }
                    }

                    if (junctionInfo) {
                        // Handle many-to-many inverse relation using junction table
                        await this.updateManyToManyInverseRelation(
                            tx,
                            sourceCollection,
                            sourceEntityId,
                            targetCollection,
                            relation,
                            newValue,
                            junctionInfo
                        );
                        continue;
                    }
                }

                // Handle simple inverse relations (one-to-one, one-to-many with direct foreign keys)
                if (!relation.foreignKeyOnTarget) {
                    console.warn(`Inverse relation '${relation.relationName}' is missing foreignKeyOnTarget property and could not be resolved as many-to-many. Skipping.`);
                    continue;
                }

                const foreignKeyColumn = targetTable[relation.foreignKeyOnTarget! as keyof typeof targetTable] as AnyPgColumn;
                if (!foreignKeyColumn) {
                    console.warn(`Foreign key column '${relation.foreignKeyOnTarget}' not found in target table for relation '${relation.relationName}'`);
                    continue;
                }

                const parsedSourceId = this.parseIdValue(sourceEntityId, sourceIdInfo.type);

                // Handle inverse relation name mapping
                // If inverseRelationName is provided, we need to update the target entity's inverse relation
                if (relation.inverseRelationName) {
                    await this.updateInverseRelationProperty(
                        tx,
                        targetCollection,
                        sourceCollection,
                        relation,
                        parsedSourceId,
                        newValue,
                        targetIdInfo
                    );
                }

                if (newValue === null || newValue === undefined) {
                    // Setting relation to null - update the target entity to clear the FK
                    // First, find the current target entity that points to this source entity
                    const currentTargetEntities = await tx
                        .select()
                        .from(targetTable)
                        .where(eq(foreignKeyColumn, parsedSourceId));

                    // Clear the FK in all entities that currently point to this source entity
                    if (currentTargetEntities.length > 0) {
                        await tx
                            .update(targetTable)
                            .set({ [relation.foreignKeyOnTarget!]: null })
                            .where(eq(foreignKeyColumn, parsedSourceId));
                    }
                } else {
                    // Setting relation to a specific target entity
                    const parsedNewTargetId = this.parseIdValue(newValue, targetIdInfo.type);
                    const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

                    // First, clear any existing FK that points to this source entity
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget!]: null })
                        .where(eq(foreignKeyColumn, parsedSourceId));

                    // Then, update the new target entity to point to this source entity
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget!]: parsedSourceId })
                        .where(eq(targetIdField, parsedNewTargetId));
                }
            } catch (e) {
                console.warn(`Failed to update inverse relation '${relation.relationName}':`, e);
            }
        }
    }

    /**
     * Handle inverse relation name mapping when updating relations
     * This ensures that when a relation has an inverseRelationName, the target entity's
     * corresponding relation property is properly updated
     */
    private async updateInverseRelationProperty(
        tx: NodePgDatabase<any>,
        targetCollection: EntityCollection,
        sourceCollection: EntityCollection,
        relation: Relation,
        sourceEntityId: string | number,
        newValue: any,
        targetIdInfo: { fieldName: string; type: string }
    ) {
        try {
            // Find the inverse relation on the target collection using inverseRelationName
            const targetResolvedRelations = resolveCollectionRelations(targetCollection);
            const inverseRelation = targetResolvedRelations[relation.inverseRelationName!];

            if (!inverseRelation) {
                console.warn(`Inverse relation '${relation.inverseRelationName}' not found on target collection '${targetCollection.slug || targetCollection.dbPath}'`);
                return;
            }

            // Update the inverse relation on the target entity
            if (newValue === null || newValue === undefined) {
                // Clear the inverse relation on all target entities that currently reference this source entity
                const targetTable = this.getTableForCollection(targetCollection);
                const foreignKeyColumn = targetTable[relation.foreignKeyOnTarget! as keyof typeof targetTable] as AnyPgColumn;

                await tx
                    .update(targetTable)
                    .set({ [relation.foreignKeyOnTarget!]: null })
                    .where(eq(foreignKeyColumn, sourceEntityId));
            } else {
                // Set the inverse relation on the specific target entity
                const parsedNewTargetId = this.parseIdValue(newValue, targetIdInfo.type);
                const targetTable = this.getTableForCollection(targetCollection);
                const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

                // Update the target entity to reference the source entity
                await tx
                    .update(targetTable)
                    .set({ [relation.foreignKeyOnTarget!]: sourceEntityId })
                    .where(eq(targetIdField, parsedNewTargetId));
            }
        } catch (e) {
            console.warn(`Failed to update inverse relation property '${relation.inverseRelationName}':`, e);
        }
    }

    private resolveJoinPathWriteMapping(
        parentCollection: EntityCollection,
        relation: Relation
    ): { targetFKColName: string; parentSourceColName: string } {
        if (!relation.joinPath || relation.joinPath.length === 0) {
            throw new Error("resolveJoinPathWriteMapping requires a joinPath relation");
        }
        const parentTableName = getTableName(parentCollection);
        // Last step determines the target FK column
        const lastStep = relation.joinPath[relation.joinPath.length - 1];
        const targetFKColName = DrizzleConditionBuilder.getColumnNamesFromColumns(lastStep.on.to)[0];
        let currentFrom = lastStep.on.from; // fully-qualified

        // Walk back until we reach a column on the parent table
        // Each iteration finds the previous step whose 'to' matches currentFrom
        // and sets currentFrom to that step's 'from'
        // Stop when currentFrom belongs to parent table
        // Safety to avoid infinite loops
        let safety = 0;
        while (safety++ < 10) {
            const currentFromTable = DrizzleConditionBuilder.getTableNamesFromColumns(currentFrom)[0];
            if (currentFromTable === parentTableName) {
                break;
            }
            const prevStep = relation.joinPath.find((s) => {
                const to = Array.isArray(s.on.to) ? s.on.to[0] : s.on.to;
                return to === currentFrom;
            });
            if (!prevStep) {
                throw new Error(`Could not resolve parent source column for joinPath relation '${relation.relationName}'`);
            }
            currentFrom = prevStep.on.from;
        }
        const parentSourceColName = DrizzleConditionBuilder.getColumnNamesFromColumns(currentFrom)[0];
        return {
            targetFKColName,
            parentSourceColName
        };
    }

    /**
     * Handle junction table creation for many-to-many path-based saves
     */
    private async handleJunctionTableCreation(
        tx: NodePgDatabase<any>,
        newEntityId: string | number,
        junctionTableInfo: {
            parentCollection: EntityCollection;
            parentId: string | number;
            relation: Relation;
            relationKey: string;
        }
    ) {
        const {
            parentCollection,
            parentId,
            relation,
            relationKey
        } = junctionTableInfo;
        const targetCollection = relation.target();

        try {
            // Get the junction table from the relation configuration
            const junctionTable = collectionRegistry.getTable(relation.through!.table);
            if (!junctionTable) {
                console.warn(`Junction table '${relation.through!.table}' not found for relation '${relationKey}' in collection '${parentCollection.slug || parentCollection.dbPath}'`);
                return;
            }

            const sourceJunctionColumn = junctionTable[relation.through!.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
            const targetJunctionColumn = junctionTable[relation.through!.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

            if (!sourceJunctionColumn) {
                console.warn(`Source column '${relation.through!.sourceColumn}' not found in junction table '${relation.through!.table}' for relation '${relationKey}'`);
                return;
            }

            if (!targetJunctionColumn) {
                console.warn(`Target column '${relation.through!.targetColumn}' not found in junction table '${relation.through!.table}' for relation '${relationKey}'`);
                return;
            }

            // Parse the new entity ID to the correct type
            const targetIdInfo = this.getIdFieldInfo(targetCollection);
            const parsedNewEntityId = this.parseIdValue(newEntityId, targetIdInfo.type);

            // Create the junction table entry linking parent to the new entity
            const junctionData = {
                [sourceJunctionColumn.name]: parentId,
                [targetJunctionColumn.name]: parsedNewEntityId
            };

            await tx.insert(junctionTable).values(junctionData);

            console.log(`Created junction table entry for many-to-many relation '${relationKey}': ${JSON.stringify(junctionData)}`);
        } catch (error) {
            console.error(`Failed to create junction table entry for relation '${relationKey}':`, error);
            throw error;
        }
    }
}
