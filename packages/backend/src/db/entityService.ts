import { and, asc, count, desc, eq, ilike, or, sql, SQLWrapper } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "../collections/registry";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
    Entity,
    EntityCollection,
    FilterValues,
    ManyRelation,
    ManyToManyRelation,
    OneRelation,
    Properties,
    Property,
    WhereFilterOp
} from "@firecms/types";
import { getTableNameFromCollection, resolveJunctionTableName, toSnakeCase } from "../utils/collection-utils";
import { resolveCollectionRelations } from "@firecms/common";

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
function serializeDataToServer<M extends Record<string, any>>(entity: M, properties: Properties<M>): any {
    if (!entity || !properties) return entity;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(entity)) {
        const property = properties[key as keyof M] as Property;
        if (!property) {
            result[key] = value;
            continue;
        }

        result[key] = serializePropertyToServer(value, property);
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
function parseDataFromServer<M extends Record<string, any>>(data: M, properties: Properties<M>): M {
    if (!data || !properties) return data;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        const property = properties[key as keyof M] as Property;
        if (!property) {
            result[key] = value;
            continue;
        }

        result[key] = parsePropertyFromServer(value, property);
    }

    return result as M;
}

function parsePropertyFromServer(value: any, property: Property): any {
    if (value === null || value === undefined) {
        return value;
    }

    switch (property.type) {
        case "relation":
            // Transform ID back to relation object with type information
            if (typeof value === "string" || typeof value === "number") {
                return {
                    id: value.toString(),
                    path: property.relation.target().slug,
                    __type: "relation"
                };
            }
            return value;

        case "array":
            if (Array.isArray(value) && property.of) {
                return value.map(item => parsePropertyFromServer(item, property.of as Property));
            }
            return value;

        case "map":
            if (typeof value === "object" && property.properties) {
                const result: Record<string, any> = {};
                for (const [subKey, subValue] of Object.entries(value)) {
                    const subProperty = (property.properties as Properties)[subKey];
                    if (subProperty) {
                        result[subKey] = parsePropertyFromServer(subValue, subProperty);
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
        const collection = collectionRegistry.getCollectionByPath(collectionPath) ?? collectionRegistry.getBySlug(collectionPath);
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
        const values = parseDataFromServer(raw, collection.properties as Properties<M>);

        // Load many-to-many relations
        const allCollections = collectionRegistry.getAllCollectionsRecursively();
        const resolvedRelations = resolveCollectionRelations(collection, allCollections);

        const m2mPromises = Object.entries(resolvedRelations).map(async ([key, relation]) => {
            if (relation.type === "manyToMany") {
                const relatedEntities = await this.fetchManyToManyRelation(collection, parsedId, relation as ManyToManyRelation, {});
                (values as any)[key] = relatedEntities.map(e => ({
                    id: e.id,
                    path: e.path
                }));
            }
        });

        await Promise.all(m2mPromises);

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

        return results.map((entity: any) => {
            const values = parseDataFromServer(entity as M, collection.properties as Properties<M>);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath,
                values: values as M,
                databaseId: options.databaseId
            };
        });
    }

    /**
     * Handle multi-segment paths by resolving through relations
     * e.g., "maquinaria/70/alquileres" resolves to alquileres related to maquinaria with id 70
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
            const allCollections = collectionRegistry.getAllCollectionsRecursively();
            const resolvedRelations = resolveCollectionRelations(currentCollection, allCollections);
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
        const allCollections = collectionRegistry.getAllCollectionsRecursively();
        const resolvedRelations = resolveCollectionRelations(parentCollection, allCollections);
        const relation = resolvedRelations[relationKey];

        if (!relation) {
            throw new Error(`Relation '${relationKey}' not found in collection '${parentCollectionPath}'`);
        }

        switch (relation.type) {
            case "one": {
                const oneResults = await this.fetchOneRelation<M>(parentCollection, parentEntityId, relation as OneRelation, options);
                return oneResults;
            }
            case "many": {
                const manyResults = await this.fetchManyRelation<M>(parentCollection, parentEntityId, relation as ManyRelation, options);
                return manyResults;
            }
            case "manyToMany": {
                const manyToManyResults = await this.fetchManyToManyRelation<M>(parentCollection, parentEntityId, relation as ManyToManyRelation, options);
                return manyToManyResults;
            }
            default:
                throw new Error(`Unsupported relation type: ${(relation as any).type}`);
        }
    }

    private async fetchOneRelation<M extends Record<string, any>>(
        parentCollection: EntityCollection,
        parentEntityId: string | number,
        relation: OneRelation,
        options: any
    ): Promise<Entity<M>[]> {
        // For one relations, we need to get the foreign key value from the parent entity
        const parentEntity = await this.fetchEntity(parentCollection.slug ?? parentCollection.dbPath, parentEntityId);
        if (!parentEntity) {
            return [];
        }

        const sourceField = relation.sourceFields[0];
        const targetField = relation.targetFields[0];
        const foreignKeyValue = parentEntity.values[sourceField as keyof typeof parentEntity.values];

        if (!foreignKeyValue) {
            return [];
        }

        const targetCollection = relation.target();
        const targetCollectionPath = targetCollection.slug ?? targetCollection.dbPath;

        // Fetch the related entity
        const relatedEntity = await this.fetchEntity<M>(targetCollectionPath, foreignKeyValue, options.databaseId);
        return relatedEntity ? [relatedEntity] : [];
    }

    private async fetchManyRelation<M extends Record<string, any>>(
        parentCollection: EntityCollection,
        parentEntityId: string | number,
        relation: ManyRelation,
        options: any
    ): Promise<Entity<M>[]> {
        const targetCollection = relation.target();
        const targetCollectionPath = targetCollection.slug ?? targetCollection.dbPath;

        // Use explicit targetForeignKey if provided, otherwise fall back to guessing
        let foreignKeyField: string | null = null;

        if (relation.targetForeignKey) {
            foreignKeyField = relation.targetForeignKey;
        } else {
            // Fall back to the old method of finding the foreign key field
            foreignKeyField = this.findForeignKeyFieldForRelation(targetCollection, parentCollection);
        }

        if (!foreignKeyField) {
            throw new Error(`Could not find foreign key field in ${targetCollectionPath} pointing to ${parentCollection.slug ?? parentCollection.dbPath}. Please specify targetForeignKey in the relation definition.`);
        }

        // Use explicit localKey if provided, otherwise use the default ID field
        const localKeyField = relation.localKey || this.getIdFieldInfo(parentCollection).fieldName;

        // Get the value from the parent entity's localKey field
        let localKeyValue: string | number;
        if (localKeyField === this.getIdFieldInfo(parentCollection).fieldName) {
            // If we're using the ID field, we can use the provided parentEntityId directly
            localKeyValue = parentEntityId;
        } else {
            // If we're using a different field, we need to fetch the parent entity to get that field's value
            const parentEntity = await this.fetchEntity(parentCollection.slug ?? parentCollection.dbPath, parentEntityId);
            if (!parentEntity) {
                return [];
            }
            const rawValue = parentEntity.values[localKeyField as keyof typeof parentEntity.values];
            if (rawValue === null || rawValue === undefined) {
                return [];
            }
            localKeyValue = rawValue as string | number;
        }

        const existingFilter = options.filter ?? {};
        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedLocalKeyValue = this.parseIdValue(localKeyValue, parentIdInfo.type);

        // Add a filter condition to match the local key value
        const newFilter: FilterValues<Extract<keyof M, string>> = {
            ...existingFilter,
            [foreignKeyField as Extract<keyof M, string>]: ["==", parsedLocalKeyValue]
        };

        // Delegate to the main fetchCollection method with the new filter
        return this.fetchCollection<M>(targetCollectionPath, {
            ...options,
            filter: newFilter
        });
    }

    private async fetchManyToManyRelation<M extends Record<string, any>>(
        parentCollection: EntityCollection,
        parentEntityId: string | number,
        relation: ManyToManyRelation,
        options: any
    ): Promise<Entity<M>[]> {
        const targetCollection = relation.target();
        const targetTablePath = targetCollection.slug ?? targetCollection.dbPath;
        const targetTable = this.getTableForCollection(targetCollection);

        // Resolve junction table name and keys
        const junctionDbPath = resolveJunctionTableName(relation.through, parentCollection, targetCollection);
        const junctionTable = collectionRegistry.getTable(junctionDbPath);
        if (!junctionTable) {
            throw new Error(`Junction table not found for dbPath: ${junctionDbPath}`);
        }

        const parentIdInfo = this.getIdFieldInfo(parentCollection);
        const parsedParentId = this.parseIdValue(parentEntityId, parentIdInfo.type);

        const defaultSourceKey = `${toSnakeCase(getTableNameFromCollection(parentCollection))}_id`;
        const defaultTargetKey = `${toSnakeCase(getTableNameFromCollection(targetCollection))}_id`;
        const sourceJunctionKeyName = Array.isArray(relation.through?.sourceJunctionKey)
            ? (relation.through?.sourceJunctionKey as string[])[0]
            : (relation.through?.sourceJunctionKey ?? defaultSourceKey);
        const targetJunctionKeyName = Array.isArray(relation.through?.targetJunctionKey)
            ? (relation.through?.targetJunctionKey as string[])[0]
            : (relation.through?.targetJunctionKey ?? defaultTargetKey);

        const sourceJunctionKey = junctionTable[sourceJunctionKeyName as keyof typeof junctionTable] as AnyPgColumn;
        const targetJunctionKey = junctionTable[targetJunctionKeyName as keyof typeof junctionTable] as AnyPgColumn;

        if (!sourceJunctionKey || !targetJunctionKey) {
            throw new Error(`Junction keys not found in table '${junctionDbPath}'`);
        }

        const targetIdInfo = this.getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        if (!targetIdField) {
            throw new Error(`ID field '${targetIdInfo.fieldName}' not found in target table`);
        }

        let query: any = this.db
            .select()
            .from(targetTable)
            .innerJoin(junctionTable, eq(targetIdField, targetJunctionKey));

        // Base condition for the join
        const allConditions: SQLWrapper[] = [eq(sourceJunctionKey, parsedParentId)];

        // Apply additional filters
        if (options.filter) {
            const conditions = this.buildFilterConditions(options.filter, targetTable, targetTablePath);
            if (conditions.length > 0) {
                allConditions.push(...conditions);
            }
        }

        query = query.where(and(...allConditions));

        // Apply ordering
        const orderExpressions = [];
        if (options.orderBy) {
            const orderField = targetTable[options.orderBy as keyof typeof targetTable] as AnyPgColumn;
            if (orderField) {
                if (options.order === "desc") {
                    orderExpressions.push(desc(orderField));
                } else {
                    orderExpressions.push(asc(orderField));
                }
            }
        }
        orderExpressions.push(desc(targetIdField));

        if (orderExpressions.length > 0) {
            query = query.orderBy(...orderExpressions);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const results = await query;

        return results.map((row: any) => {
            const entity = row[getTableNameFromCollection(targetCollection)];
            const values = parseDataFromServer(entity as M, targetCollection.properties as Properties<M>);

            return {
                id: entity[targetIdInfo.fieldName].toString(),
                path: targetTablePath,
                values: values as M,
                databaseId: options.databaseId
            };
        });
    }

    /**
     * Find the foreign key field that links target collection to parent collection
     */
    private findForeignKeyFieldForRelation(
        targetCollection: EntityCollection,
        parentCollection: EntityCollection
    ): string | null {

        // Try naming conventions
        const parentName = parentCollection.slug || parentCollection.dbPath.split("/").pop();
        if (!parentName) return null;

        const possibleForeignKeys = [
            `${parentName}_id`,
            `${toSnakeCase(parentName)}_id`,
            `${parentName}_referencia`,
            `${toSnakeCase(parentName)}_referencia`,
        ];

        for (const possibleKey of possibleForeignKeys) {
            if (targetCollection.properties[possibleKey]) {
                const property = targetCollection.properties[possibleKey] as Property;
                if (property.type === "number" || property.type === "string" || property.type === "relation") {
                    return possibleKey;
                }
            }
        }

        return null;
    }

    async saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>> {
        const collection = this.getCollectionByPath(collectionPath);
        const table = this.getTableForCollection(collection);
        const idInfo = this.getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        // Separate many-to-many relations
        const manyToManyValues: Record<string, any> = {};
        const otherValues: Partial<M> = { ...values };

        const allCollections = collectionRegistry.getAllCollectionsRecursively();
        const resolvedRelations = resolveCollectionRelations(collection, allCollections);

        for (const key in resolvedRelations) {
            const relation = resolvedRelations[key];
            if (relation && relation.type === "manyToMany") {
                if (Object.prototype.hasOwnProperty.call(otherValues, key)) {
                    manyToManyValues[key] = otherValues[key as keyof M];
                    delete otherValues[key as keyof M];
                }
            }
        }

        // Transform relations to IDs, then sanitize
        const processedData = serializeDataToServer(otherValues as M, collection.properties as Properties<M>);
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
                    delete dataForInsert[idInfo.fieldName];
                }

                const result = await tx
                    .insert(table)
                    .values(dataForInsert)
                    .returning({ id: idField });

                currentId = result[0].id as string | number;
            }

            // Update many-to-many relations
            if (Object.keys(manyToManyValues).length > 0) {
                await this.updateManyToManyRelations(tx, collection, currentId, manyToManyValues);
            }

            return currentId;
        });

        // Fetch the updated/created entity to return with proper relation objects
        const finalEntity = await this.fetchEntity<M>(collectionPath, savedId, databaseId);
        if (!finalEntity) throw new Error("Could not fetch entity after save.");
        return finalEntity;
    }

    private async updateManyToManyRelations<M extends Record<string, any>>(
        tx: NodePgDatabase<any>,
        collection: EntityCollection,
        entityId: string | number,
        manyToManyValues: Partial<M>
    ) {
        const allCollections = collectionRegistry.getAllCollectionsRecursively();
        const resolvedRelations = resolveCollectionRelations(collection, allCollections);

        for (const [key, value] of Object.entries(manyToManyValues)) {
            const relation = resolvedRelations[key];
            if (!relation || relation.type !== "manyToMany") continue;

            const manyToManyRelation = relation as ManyToManyRelation;
            const targetEntityIds = (value && Array.isArray(value)) ? value.map((rel: any) => rel.id) : [];
            const targetCollection = manyToManyRelation.target();
            const junctionDbPath = resolveJunctionTableName(manyToManyRelation.through, collection, targetCollection);
            const junctionTable = collectionRegistry.getTable(junctionDbPath);

            if (!junctionTable) {
                throw new Error(`Junction table not found for dbPath: ${junctionDbPath}`);
            }

            const parentIdInfo = this.getIdFieldInfo(collection);
            const parsedParentId = this.parseIdValue(entityId, parentIdInfo.type);

            const defaultSourceKey = `${toSnakeCase(getTableNameFromCollection(collection))}_id`;
            const sourceJunctionKeyName = Array.isArray(manyToManyRelation.through?.sourceJunctionKey)
                ? (manyToManyRelation.through.sourceJunctionKey as string[])[0]
                : (manyToManyRelation.through?.sourceJunctionKey ?? defaultSourceKey);
            const sourceJunctionKey = junctionTable[sourceJunctionKeyName as keyof typeof junctionTable] as AnyPgColumn;

            if (!sourceJunctionKey) {
                throw new Error(`Source junction key '${sourceJunctionKeyName}' not found in table '${junctionDbPath}'`);
            }

            // Delete existing relations for this entity
            await tx.delete(junctionTable).where(eq(sourceJunctionKey, parsedParentId));

            if (targetEntityIds.length > 0) {
                const targetIdInfo = this.getIdFieldInfo(targetCollection);
                const parsedTargetIds = targetEntityIds.map(id => this.parseIdValue(id, targetIdInfo.type));

                const defaultTargetKey = `${toSnakeCase(getTableNameFromCollection(targetCollection))}_id`;
                const targetJunctionKeyName = Array.isArray(manyToManyRelation.through?.targetJunctionKey)
                    ? (manyToManyRelation.through.targetJunctionKey as string[])[0]
                    : (manyToManyRelation.through?.targetJunctionKey ?? defaultTargetKey);

                const newLinks = parsedTargetIds.map(targetId => ({
                    [sourceJunctionKeyName]: parsedParentId,
                    [targetJunctionKeyName]: targetId
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

        if (!field) return true; // Field doesn't exist, consider it unique

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
            const allCollections = collectionRegistry.getAllCollectionsRecursively();
            const resolvedRelations = resolveCollectionRelations(currentCollection, allCollections);
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
        // For PostgreSQL with auto-increment IDs, we don't need to pre-generate
        // The database will assign the ID on insert
        return Date.now().toString() + Math.random().toString(36).substring(2, 7);
    }

    private async searchEntities<M extends Record<string, any>>(
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

        return results.map((entity: any) => {
            const values = parseDataFromServer(entity as M, collection.properties as Properties<M>);

            return {
                id: entity[idInfo.fieldName].toString(),
                path: collectionPath,
                values: values as M,
                databaseId
            };
        });
    }
}

