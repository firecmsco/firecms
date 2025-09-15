import { and, asc, count, desc, eq, ilike, or, sql, SQLWrapper } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, FilterValues, Properties, Property, Relation, WhereFilterOp } from "@firecms/types";
import { CollectionRegistry, getColumnName, getTableName, resolveCollectionRelations } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";

/**
 * Helper function to extract table name(s) from column reference(s)
 */
function getTableNamesFromColumns(columns: string | string[]): string[] {
    if (Array.isArray(columns)) {
        return columns.map(col => col.includes(".") ? col.split(".")[0] : "");
    }
    return [columns.includes(".") ? columns.split(".")[0] : ""];
}

/**
 * Helper function to extract column name(s) from fully qualified column reference(s)
 */
function getColumnNamesFromColumns(columns: string | string[]): string[] {
    if (Array.isArray(columns)) {
        return columns.map(col => getColumnName(col));
    }
    return [getColumnName(columns)];
}

/**
 * Helper function to build join condition(s) for single or multi-column joins
 */
function buildJoinCondition(
    sourceTable: PgTable<any>,
    targetTable: PgTable<any>,
    sourceColumns: string | string[],
    targetColumns: string | string[]
): SQLWrapper {
    const sourceColNames = getColumnNamesFromColumns(sourceColumns);
    const targetColNames = getColumnNamesFromColumns(targetColumns);

    if (sourceColNames.length === 1 && targetColNames.length === 1) {
        // Single column join
        const sourceCol = sourceTable[sourceColNames[0] as keyof typeof sourceTable] as AnyPgColumn;
        const targetCol = targetTable[targetColNames[0] as keyof typeof targetTable] as AnyPgColumn;
        return eq(sourceCol, targetCol);
    } else {
        // Multi-column join - combine with AND
        const conditions: SQLWrapper[] = [];
        for (let i = 0; i < sourceColNames.length; i++) {
            const sourceCol = sourceTable[sourceColNames[i] as keyof typeof sourceTable] as AnyPgColumn;
            const targetCol = targetTable[targetColNames[i] as keyof typeof targetTable] as AnyPgColumn;
            conditions.push(eq(sourceCol, targetCol));
        }
        return and(...conditions)!;
    }
}

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
function serializeDataToServer<M extends Record<string, any>>(entity: M, properties: Properties, collection?: EntityCollection): any {
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
                }
            }
        }

        result[key] = serializePropertyToServer(value, property);
    }

    // Add inverse relation updates to the result for the EntityService to handle
    if (inverseRelationUpdates.length > 0) {
        result.__inverseRelationUpdates = inverseRelationUpdates;
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
            } else if (typeof value === "object" && value !== null && value.id !== undefined) {
                return value.id;
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => serializePropertyToServer(item, property.of as Property));
            }
            return value;

        case "map":
            if (typeof value === "object" && value !== null && property.properties) {
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
    ): SQLWrapper[] {
        const conditions: SQLWrapper[] = [];
        for (const [field, filterParam] of Object.entries(filter)) {
            if (!filterParam) continue;

            const [op, value] = filterParam as [WhereFilterOp, any];
            const fieldColumn = table[field as keyof typeof table] as AnyPgColumn;

            if (!fieldColumn) {
                console.warn(`Filtering by field '${field}', but it does not exist in table for collection '${collectionPath}'`);
                continue;
            }

            switch (op) {
                case "==":
                    conditions.push(eq(fieldColumn, value));
                    break;
                case "!=":
                    conditions.push(sql`${fieldColumn} != ${value}`);
                    break;
                case ">":
                    conditions.push(sql`${fieldColumn} > ${value}`);
                    break;
                case ">=":
                    conditions.push(sql`${fieldColumn} >= ${value}`);
                    break;
                case "<":
                    conditions.push(sql`${fieldColumn} < ${value}`);
                    break;
                case "<=":
                    conditions.push(sql`${fieldColumn} <= ${value}`);
                    break;
                case "in":
                    if (Array.isArray(value) && value.length > 0) {
                        conditions.push(sql`${fieldColumn} = ANY(${value})`);
                    }
                    break;
                case "array-contains":
                    // For JSONB arrays
                    conditions.push(sql`${fieldColumn} @> ${JSON.stringify([value])}`);
                    break;
            }
        }
        return conditions;
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

    private getInverseRelations<M extends Record<string, any>>(entity: M, collection: EntityCollection): Array<{ key: string, value: any }> {
        const properties = collection.properties;
        const resolvedRelations = resolveCollectionRelations(collection);

        const inverseRelations: Array<{ key: string, value: any }> = [];

        for (const [key, value] of Object.entries(entity)) {
            const property = properties[key as keyof M] as Property;
            if (property && property.type === "relation") {
                const relation = resolvedRelations[key];
                if (relation && relation.direction === "inverse" && relation.foreignKeyOnTarget) {
                    // Inverse relation: Add to updates
                    inverseRelations.push({ key, value });
                }
            }
        }

        return inverseRelations;
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

        const relationPromises = Object.entries(resolvedRelations).map(async ([key, relation]) => {
            if (relation.cardinality === "many") {
                const relatedEntities = await this.fetchRelatedEntities(
                    collectionPath,
                    parsedId,
                    key,
                    {}
                );
                (values as any)[key] = relatedEntities.map(e => ({
                    id: e.id,
                    path: e.path
                }));
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

        const collection = this.getCollectionByPath(collectionPath);

        if (options.searchString) {
            return this.searchEntities<M>(collectionPath, options.searchString, options.databaseId);
        }

        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        let query: any = this.db.select().from(table);

        // Apply filters
        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, table, collectionPath);
            if (filterConditions.length > 0) {
                query = query.where(and(...filterConditions));
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

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        const results = await query;

        const entityPromises = results.map(async (entity: any) => {
            const values = await parseDataFromServer(entity as M, collection, this.db, collectionRegistry);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath,
                values: values as M,
                databaseId: options.databaseId
            };
        });

        return Promise.all(entityPromises);
    }

    /**
     * Handle multi-segment paths by resolving through relations
     * e.g., "authors/70/posts" resolves to posts related to authors with id 70
     */
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
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        if (!relation.joins) {
            throw new Error(`Relation '${relation.relationName}' should have been normalized and have joins defined.`);
        }

        const targetCollection = relation.target();
        const targetTable = this.getTableForCollection(targetCollection);
        const targetIdInfo = this.getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Start query from target table
        let query: any = this.db.select().from(targetTable);
        let currentTable = targetTable; // represents the table currently at the end of the join chain

        // Process joins in reverse to walk back to parent
        for (const join of [...relation.joins].reverse()) {
            const joinTargetTable = collectionRegistry.getTable(join.table);
            if (!joinTargetTable) throw new Error(`Join table not found: ${join.table}`);

            // Get table names from source columns (handles both single and multi-column)
            const sourceTableNames = getTableNamesFromColumns(join.sourceColumn);
            const sourceTableName = sourceTableNames[0]; // Use first table name for navigation

            if (currentTable === joinTargetTable) {
                const sourceTable = collectionRegistry.getTable(sourceTableName);
                if (!sourceTable) throw new Error(`Source table not found: ${sourceTableName}`);

                const joinCondition = buildJoinCondition(sourceTable, joinTargetTable, join.sourceColumn, join.targetColumn);
                query = query.innerJoin(sourceTable, joinCondition);
                currentTable = sourceTable;
            } else if (currentTable === collectionRegistry.getTable(sourceTableName)) {
                const targetForwardTable = joinTargetTable;
                const joinCondition = buildJoinCondition(currentTable, targetForwardTable, join.sourceColumn, join.targetColumn);
                query = query.innerJoin(targetForwardTable, joinCondition);
                currentTable = targetForwardTable;
            } else {
                // We are missing an intermediate link; attempt to join both sides (fallback)
                const sourceTable = collectionRegistry.getTable(sourceTableName);
                if (sourceTable && currentTable !== sourceTable) {
                    // Prefer joining table that links to currentTable by matching either side
                    if (joinTargetTable === currentTable) {
                        const joinCondition = buildJoinCondition(sourceTable, joinTargetTable, join.sourceColumn, join.targetColumn);
                        query = query.innerJoin(sourceTable, joinCondition);
                        currentTable = sourceTable;
                    } else {
                        // Try to find matching columns in current table for the join
                        const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
                        const sourceColumnInCurrent = currentTable[sourceColumnNames[0] as keyof typeof currentTable] as AnyPgColumn;
                        if (sourceColumnInCurrent) {
                            const joinCondition = buildJoinCondition(currentTable, joinTargetTable, join.sourceColumn, join.targetColumn);
                            query = query.innerJoin(joinTargetTable, joinCondition);
                            currentTable = joinTargetTable;
                        }
                    }
                }
            }
        }

        // Filter by parent id (now that parent table should be part of the query plan)
        query = query.where(eq(parentIdCol, parsedParentId));

        // Additional filters on target table
        if (options.filter) {
            const conds = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
            if (conds.length > 0) {
                query = query.where(and(eq(parentIdCol, parsedParentId), ...conds));
            }
        }

        // Ordering
        const orderExpressions = [] as any[];
        if (options.orderBy) {
            const orderField = targetTable[options.orderBy as keyof typeof targetTable] as AnyPgColumn;
            if (orderField) orderExpressions.push(options.order === "asc" ? asc(orderField) : desc(orderField));
        }
        orderExpressions.push(desc(targetIdField));
        if (orderExpressions.length > 0) query = query.orderBy(...orderExpressions);

        if (options.limit) query = query.limit(options.limit);

        const results = await query;
        const entityPromises = results.map(async (row: any) => {
            const entity = row[getTableName(targetCollection)] || row;
            const values = await parseDataFromServer(entity as M, targetCollection, this.db, collectionRegistry);
            return {
                id: entity[targetIdInfo.fieldName].toString(),
                path: targetCollection.slug ?? targetCollection.dbPath,
                values: values as M,
                databaseId: options.databaseId
            };
        });
        return Promise.all(entityPromises);
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

        if (!relation.joins) {
            throw new Error(`Relation '${relation.relationName}' should have been normalized and have joins defined.`);
        }

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
        let currentTable = targetTable;

        // Process joins in reverse to walk back to parent
        for (const join of [...relation.joins].reverse()) {
            const joinTargetTable = collectionRegistry.getTable(join.table);
            if (!joinTargetTable) throw new Error(`Join table not found: ${join.table}`);
            const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
            const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
            const sourceColumnName = sourceColumnNames[0]; // Use first column for simple FK cases
            const targetColumnName = targetColumnNames[0]; // Use first column for simple FK cases

            if (currentTable === joinTargetTable) {
                const sourceTable = collectionRegistry.getTable(sourceColumnNames[0]);
                if (!sourceTable) throw new Error(`Source table not found: ${sourceColumnNames[0]}`);
                const sourceCol = sourceTable[sourceColumnName as keyof typeof sourceTable] as AnyPgColumn;
                const targetCol = joinTargetTable[targetColumnName as keyof typeof joinTargetTable] as AnyPgColumn;
                query = query.innerJoin(sourceTable, eq(sourceCol, targetCol));
                currentTable = sourceTable;
            } else if (currentTable === collectionRegistry.getTable(sourceColumnNames[0])) {
                const targetForwardTable = joinTargetTable;
                const sourceCol = currentTable[sourceColumnName as keyof typeof currentTable] as AnyPgColumn;
                const targetCol = targetForwardTable[targetColumnName as keyof typeof targetForwardTable] as AnyPgColumn;
                query = query.innerJoin(targetForwardTable, eq(sourceCol, targetCol));
                currentTable = targetForwardTable;
            } else {
                // We are missing an intermediate link; attempt to join both sides (fallback)
                const sourceTable = collectionRegistry.getTable(sourceColumnNames[0]);
                if (sourceTable && currentTable !== sourceTable) {
                    // Prefer joining table that links to currentTable by matching either side
                    if (joinTargetTable === currentTable) {
                        const joinCondition = buildJoinCondition(sourceTable, joinTargetTable, join.sourceColumn, join.targetColumn);
                        query = query.innerJoin(sourceTable, joinCondition);
                        currentTable = sourceTable;
                    } else {
                        // Try to find matching columns in current table for the join
                        const sourceColumnInCurrent = currentTable[sourceColumnName as keyof typeof currentTable] as AnyPgColumn;
                        if (sourceColumnInCurrent) {
                            const joinCondition = buildJoinCondition(currentTable, joinTargetTable, join.sourceColumn, join.targetColumn);
                            query = query.innerJoin(joinTargetTable, joinCondition);
                            currentTable = joinTargetTable;
                        }
                    }
                }
            }
        }

        // Apply filters & parent constraint
        const filterConditions: SQLWrapper[] = [eq(parentIdCol, parsedParentId)];
        if (options.filter) {
            const extra = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
            filterConditions.push(...extra);
        }
        query = query.where(and(...filterConditions));

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

                        if (!relation.joins || relation.joins.length === 0) {
                            throw new Error(`Relation '${relationKey}' in '${currentCollection.slug || currentCollection.dbPath}' should have been normalized and have at least one join defined.`);
                        }

                        // Find the join that connects to the target collection
                        // For path-based saving, we need to find the FK column that should store the parent ID
                        let targetColumnName: string;

                        if (relation.localKey) {
                            // Use localKey if available (preferred approach)
                            targetColumnName = relation.localKey;
                        } else {
                            // Find the join where the target table is the one we're saving to
                            const targetTableName = getTableName(targetCollection);
                            const relevantJoin = relation.joins.find(join => join.table === targetTableName);

                            if (relevantJoin) {
                                // For joins to the target table, targetColumn represents the FK column in target table
                                const targetColumnNames = getColumnNamesFromColumns(relevantJoin.targetColumn);
                                targetColumnName = targetColumnNames[0];
                            } else {
                                // Fallback: use the first join's targetColumn
                                console.warn(`Could not find specific join for target table ${targetTableName} in relation '${relationKey}'. Using first join as fallback.`);
                                const targetColumnNames = getColumnNamesFromColumns(relation.joins[0].targetColumn);
                                targetColumnName = targetColumnNames[0];
                            }
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

        // Extract inverse relation updates before sanitizing
        const inverseRelationUpdates = processedData.__inverseRelationUpdates || [];
        delete processedData.__inverseRelationUpdates;

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

            return currentId;
        });

        // Fetch the updated/created entity to return with proper relation objects
        const finalEntity = await this.fetchEntity<M>(collection.dbPath ?? collection.slug, savedId, databaseId);
        if (!finalEntity) throw new Error("Could not fetch entity after save.");
        return finalEntity;
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
            const { relation, newValue } = update;

            try {
                const targetCollection = relation.target();
                const targetTable = this.getTableForCollection(targetCollection);
                const targetIdInfo = this.getIdFieldInfo(targetCollection);
                const sourceIdInfo = this.getIdFieldInfo(sourceCollection);

                const foreignKeyColumn = targetTable[relation.foreignKeyOnTarget! as keyof typeof targetTable] as AnyPgColumn;
                if (!foreignKeyColumn) {
                    console.warn(`Foreign key column '${relation.foreignKeyOnTarget}' not found in target table for relation '${relation.relationName}'`);
                    continue;
                }

                const parsedSourceId = this.parseIdValue(sourceEntityId, sourceIdInfo.type);

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

            if (!relation.joins || relation.joins.length === 0) {
                throw new Error(`Relation '${key}' in collection '${collection.slug || collection.dbPath}' should have been normalized and have joins defined.`);
            }

            const targetEntityIds = (value && Array.isArray(value)) ? value.map((rel: any) => rel.id) : [];
            const targetCollection = relation.target();

            // Find the junction table - it should be the table that\'s not the parent or target
            const parentTableName = getTableName(collection);
            const targetTableName = getTableName(targetCollection);

            let junctionTable: PgTable<any> | null = null;
            let sourceJunctionColumn: AnyPgColumn | null = null;
            let targetJunctionColumn: AnyPgColumn | null = null;

            for (const join of relation.joins) {
                const joinTableObj = collectionRegistry.getTable(join.table);
                if (!joinTableObj) continue;

                // Check if this is the junction table (not parent or target table)
                if (join.table !== parentTableName && join.table !== targetTableName) {
                    junctionTable = joinTableObj;

                    const sourceColumnNames = getColumnNamesFromColumns(join.sourceColumn);
                    const targetColumnNames = getColumnNamesFromColumns(join.targetColumn);
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
        }
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

        if (!field) return true; // Field doesn\'t exist, consider it unique

        const conditions = [eq(field, value)];

        if (excludeEntityId) {
            const parsedExcludeId = this.parseIdValue(excludeEntityId, idInfo.type);
            conditions.push(sql`${idField} != ${parsedExcludeId}`);
        }

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

    async searchEntities<M extends Record<string, any>>(
        collectionPath: string,
        searchString: string,
        databaseId?: string
    ): Promise<Entity<M>[]> {
        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const searchConditions: SQLWrapper[] = [];
        for (const [key, prop] of Object.entries(collection.properties)) {
            if ((prop as Property).type === "string") {
                const fieldColumn = table[key as keyof typeof table] as AnyPgColumn;
                if (fieldColumn) {
                    searchConditions.push(ilike(fieldColumn, `%${searchString}%`));
                }
            }
        }

        if (searchConditions.length === 0) {
            return []; // No searchable fields found
        }

        const results = await this.db
            .select()
            .from(table)
            .where(or(...searchConditions))
            .orderBy(desc(idField))
            .limit(50);

        const entityPromises = results.map(async (entity: any) => {
            const values = await parseDataFromServer(entity as M, collection, this.db, collectionRegistry);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath,
                values: values as M,
                databaseId
            };
        });

        return Promise.all(entityPromises);
    }
}
