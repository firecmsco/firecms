import { and, asc, count, desc, eq, inArray, sql, SQLWrapper } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, FilterValues, Properties, Property, Relation } from "@firecms/types";
import { getColumnName, getTableName, resolveCollectionRelations } from "@firecms/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import { DrizzleConditionBuilder } from "../utils/drizzle-conditions";

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
        return DrizzleConditionBuilder.buildFilterConditions(filter, table, collectionPath);
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
            return this.searchEntities<M>(collectionPath, options.searchString, {
                filter: options.filter,
                orderBy: options.orderBy,
                order: options.order,
                limit: options.limit,
                databaseId: options.databaseId
            });
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

            // Additionally, for one-to-one relations (owning or inverse) that use joinPath (or otherwise),
            // populate a relation ref if not already set by parseDataFromServer
            const resolvedRelations = resolveCollectionRelations(collection);
            const propertyKeys = new Set(Object.keys(collection.properties));
            const singleOnePromises = Object.entries(resolvedRelations)
                .filter(([key]) => propertyKeys.has(key))
                .map(async ([key, relation]) => {
                    if (relation.cardinality === "one") {
                        if ((values as any)[key] == null) {
                            try {
                                const related = await this.fetchRelatedEntities(
                                    collectionPath,
                                    entity[idInfo.fieldName],
                                    key,
                                    { limit: 1 }
                                );
                                if (related.length > 0) {
                                    const e = related[0];
                                    (values as any)[key] = {
                                        id: e.id,
                                        path: e.path,
                                        __type: "relation"
                                    };
                                }
                            } catch (e) {
                                console.warn(`Could not resolve one-to-one relation property in list: ${key}`, e);
                            }
                        }
                    }
                });
            await Promise.all(singleOnePromises);

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
        const targetCollection = relation.target();
        const targetTable = this.getTableForCollection(targetCollection);
        const idInfo = this.getIdFieldInfo(targetCollection);
        const idField = targetTable[idInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

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
            relationKeyValue = typeof foreignKeyValue === 'string' || typeof foreignKeyValue === 'number'
                ? foreignKeyValue
                : String(foreignKeyValue);
        }

        // Start query from target table
        let query: any = this.db.select().from(targetTable);

        // Build additional filter conditions
        const additionalFilters: SQLWrapper[] = [];
        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, targetTable, targetCollection.slug ?? targetCollection.dbPath);
            additionalFilters.push(...filterConditions);
        }

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
            additionalFilters
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

        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        // Build search conditions using the unified utility
        const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
            searchString,
            collection.properties,
            table
        );

        if (searchConditions.length === 0) {
            return []; // No searchable fields found
        }

        // Start building the query
        let query: any = this.db.select().from(table);

        // Combine search conditions with any additional filters
        const allConditions: SQLWrapper[] = [
            DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!
        ];

        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, table, collectionPath);
            if (filterConditions.length > 0) {
                allConditions.push(...filterConditions);
            }
        }

        // Apply all conditions
        const finalCondition = DrizzleConditionBuilder.combineConditionsWithAnd(allConditions);
        if (finalCondition) {
            query = query.where(finalCondition);
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

        // Apply limit (default to 50 if not specified)
        const searchLimit = options.limit || 50;
        query = query.limit(searchLimit);

        const results = await query;

        const entityPromises = results.map(async (entity: any) => {
            const values = await parseDataFromServer(entity as M, collection, this.db, collectionRegistry);

            // Populate relations like in fetchCollection
            const resolvedRelations = resolveCollectionRelations(collection);
            const propertyKeys = new Set(Object.keys(collection.properties));

            const relationPromises = Object.entries(resolvedRelations)
                .filter(([key]) => propertyKeys.has(key))
                .map(async ([key, relation]) => {
                    if (relation.cardinality === "many") {
                        try {
                            const relatedEntities = await this.fetchRelatedEntities(
                                collectionPath,
                                entity[idInfo.fieldName],
                                key,
                                {}
                            );
                            (values as any)[key] = relatedEntities.map(e => ({
                                id: e.id,
                                path: e.path,
                                __type: "relation"
                            }));
                        } catch (e) {
                            console.warn(`Could not resolve many relation property in search: ${key}`, e);
                        }
                    } else if (relation.cardinality === "one") {
                        // Populate any missing one-to-one relation (owning or inverse), including joinPath-based
                        if ((values as any)[key] == null) {
                            try {
                                const relatedEntities = await this.fetchRelatedEntities(
                                    collectionPath,
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
                                console.warn(`Could not resolve one-to-one relation property in search: ${key}`, e);
                            }
                        }
                    }
                });

            await Promise.all(relationPromises);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath,
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
        const additionalFilters: SQLWrapper[] = [];
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
                                const targetColumnNames = getColumnNamesFromColumns(relevantJoinStep.on.to);
                                targetColumnName = targetColumnNames[0];
                            } else {
                                // Fallback: use the first join step's to column
                                console.warn(`Could not find specific join step for target table ${targetTableName} in relation '${relationKey}'. Using first join step as fallback.`);
                                const targetColumnNames = getColumnNamesFromColumns(relation.joinPath[0].on.to);
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
        delete (processedData as any).__inverseRelationUpdates;
        delete (processedData as any).__joinPathRelationUpdates;

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

            return currentId;
        });

        // Fetch the updated/created entity to return with proper relation objects
        const finalEntity = await this.fetchEntity<M>(collection.dbPath ?? collection.slug, savedId, databaseId);
        if (!finalEntity) throw new Error("Could not fetch entity after save.");
        return finalEntity;
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

                        const sourceColumnNames = getColumnNamesFromColumns(joinStep.on.from);
                        const targetColumnNames = getColumnNamesFromColumns(joinStep.on.to);
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
        const targetFKColName = getColumnNamesFromColumns(lastStep.on.to)[0];
        let currentFrom = lastStep.on.from; // fully-qualified

        // Walk back until we reach a column on the parent table
        // Each iteration finds the previous step whose 'to' matches currentFrom
        // and sets currentFrom to that step's 'from'
        // Stop when currentFrom belongs to parent table
        // Safety to avoid infinite loops
        let safety = 0;
        while (safety++ < 10) {
            const currentFromTable = getTableNamesFromColumns(currentFrom)[0];
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
        const parentSourceColName = getColumnNamesFromColumns(currentFrom)[0];
        return {
            targetFKColName,
            parentSourceColName
        };
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
}
