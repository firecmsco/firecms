import { and, asc, count, desc, eq, getTableName, gt, lt, or, SQL } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { Entity, EntityCollection, FilterValues } from "@rebasepro/types";
import { resolveCollectionRelations } from "@rebasepro/common";
import { DrizzleConditionBuilder } from "../../utils/drizzle-conditions";
import {
    getCollectionByPath,
    getTableForCollection,
    getPrimaryKeys,
    parseIdValues,
    buildCompositeId
} from "./entity-helpers";
import { parseDataFromServer } from "../data-transformer";
import { RelationService } from "./RelationService";
import { DrizzleClient } from "../interfaces";
import { BackendCollectionRegistry } from "../../collections/BackendCollectionRegistry";

/**
 * Service for handling all entity read operations.
 * Handles fetching, searching, counting, and filtering entities.
 */
export class EntityFetchService {
    private relationService: RelationService;

    constructor(private db: DrizzleClient, private registry: BackendCollectionRegistry) {
        this.relationService = new RelationService(db, registry);
    }

    /**
     * Build filter conditions from FilterValues
     * Delegates to DrizzleConditionBuilder.buildFilterConditions
     */
    buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        table: PgTable<any>,
        collectionPath: string
    ): SQL[] {
        return DrizzleConditionBuilder.buildFilterConditions(filter, table, collectionPath);
    }

    /**
     * Fetch a single entity by ID
     */
    async fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> {
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const parsedIdObj = parseIdValues(entityId, idInfoArray);
        const parsedId = parsedIdObj[idInfo.fieldName];

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return undefined;

        const raw = result[0] as M;
        const values = await parseDataFromServer(raw, collection, this.db, this.registry);

        // Load relations based on cardinality
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties));

        const relationPromises = Object.entries(resolvedRelations)
            .filter(([key]) => propertyKeys.has(key))
            .map(async ([key, relation]) => {
                if (relation.cardinality === "many") {
                    const relatedEntities = await this.relationService.fetchRelatedEntities(
                        collectionPath,
                        parsedId,
                        key,
                        {}
                    );
                    (values as Record<string, unknown>)[key] = relatedEntities.map(e => ({
                        id: e.id,
                        path: e.path,
                        __type: "relation"
                    }));
                } else if (relation.cardinality === "one") {
                    if ((values as Record<string, unknown>)[key] == null) {
                        try {
                            const relatedEntities = await this.relationService.fetchRelatedEntities(
                                collectionPath,
                                parsedId,
                                key,
                                { limit: 1 }
                            );
                            if (relatedEntities.length > 0) {
                                const e = relatedEntities[0];
                                (values as Record<string, unknown>)[key] = {
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
    async fetchEntitiesWithConditions<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        let query = this.db.select().from(table).$dynamic();
        const allConditions: SQL[] = [];

        // Add search conditions if search string is provided
        if (options.searchString) {
            const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                options.searchString,
                collection.properties,
                table
            );

            if (searchConditions.length === 0) {
                return []; // No searchable fields found
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

        // Default ordering by ID
        orderExpressions.push(desc(idField));

        if (orderExpressions.length > 0) {
            query = query.orderBy(...orderExpressions);
        }

        // Apply startAfter pagination
        if (options.startAfter) {
            const startAfterConditions: SQL[] = [];

            if (options.orderBy) {
                const orderByField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
                if (orderByField) {
                    const cursor = options.startAfter as Record<string, unknown>;
                    const startAfterOrderValue = (cursor.values as Record<string, unknown> | undefined)?.[options.orderBy] ?? cursor[options.orderBy];
                    const startAfterId = cursor.id ?? cursor[idInfo.fieldName];

                    if (startAfterOrderValue !== undefined && startAfterId !== undefined) {
                        if (options.order === "asc") {
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
                const cursor = options.startAfter as Record<string, unknown>;
                const startAfterId = cursor.id ?? cursor[idInfo.fieldName];
                if (startAfterId !== undefined && startAfterId !== null) {
                    const parsedStartAfterIdObj = parseIdValues(startAfterId as string | number, idInfoArray);
                    const parsedStartAfterId = parsedStartAfterIdObj[idInfo.fieldName];
                    startAfterConditions.push(lt(idField, parsedStartAfterId));
                }
            }

            if (startAfterConditions.length > 0) {
                const startAfterCondition = DrizzleConditionBuilder.combineConditionsWithAnd(startAfterConditions);
                if (startAfterCondition) {
                    allConditions.push(startAfterCondition);
                    const finalCondition = DrizzleConditionBuilder.combineConditionsWithAnd(allConditions);
                    if (finalCondition) {
                        query = query.where(finalCondition);
                    }
                }
            }
        }

        // Apply limit
        const limitValue = options.searchString ? (options.limit || 50) : options.limit;
        if (limitValue) {
            query = query.limit(limitValue);
        }

        const results = await query;

        return this.processEntityResults<M>(results, collection, collectionPath, idInfo, options.databaseId, false);
    }

    /**
     * Process raw database results into Entity objects with relations
     */
    private async processEntityResults<M extends Record<string, any>>(
        results: Record<string, unknown>[],
        collection: EntityCollection,
        collectionPath: string,
        idInfo: { fieldName: string; type: "string" | "number" },
        databaseId?: string,
        skipRelations: boolean = false
    ): Promise<Entity<M>[]> {
        if (results.length === 0) return [];

        // First pass: parse all entities
        const entitiesWithValues = await Promise.all(results.map(async (entity: Record<string, unknown>) => {
            const values = await parseDataFromServer(entity as M, collection, this.db, this.registry);
            return {
                entity,
                values,
                id: String(entity[idInfo.fieldName]),
                path: collectionPath
            };
        }));

        if (!skipRelations) {
            // Second pass: batch load missing one-to-one relations
            const resolvedRelations = resolveCollectionRelations(collection);
            const propertyKeys = new Set(Object.keys(collection.properties));

            for (const [key, relation] of Object.entries(resolvedRelations)) {
                if (!propertyKeys.has(key) || relation.cardinality !== "one") continue;

                const entitiesMissingRelation = entitiesWithValues.filter(item =>
                    (item.values as Record<string, unknown>)[key] == null
                );

                if (entitiesMissingRelation.length === 0) continue;

                try {
                    const entityIds = entitiesMissingRelation.map(item => item.entity[idInfo.fieldName] as string | number);
                    const relationResults = await this.relationService.batchFetchRelatedEntities(
                        collectionPath,
                        entityIds,
                        key,
                        relation
                    );

                    entitiesMissingRelation.forEach(item => {
                        const entityId = item.entity[idInfo.fieldName] as string | number;
                        const relatedEntity = relationResults.get(entityId);
                        if (relatedEntity) {
                            (item.values as Record<string, unknown>)[key] = {
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

            // Handle many relations
            const manyRelationPromises = entitiesWithValues.map(async (item) => {
                const manyRelationQueries = Object.entries(resolvedRelations)
                    .filter(([key, relation]) => propertyKeys.has(key) && relation.cardinality === "many")
                    .map(async ([key]) => {
                        try {
                            const relatedEntities = await this.relationService.fetchRelatedEntities(
                                collectionPath,
                                item.entity[idInfo.fieldName] as string | number,
                                key,
                                {}
                            );
                            (item.values as Record<string, unknown>)[key] = relatedEntities.map(e => ({
                                id: e.id,
                                path: e.path,
                                __type: "relation"
                            }));
                        } catch (e) {
                            console.warn(`Could not resolve many relation property: ${key}`, e);
                        }
                    });
                await Promise.all(manyRelationQueries);
            });

            await Promise.all(manyRelationPromises);
        }

        return entitiesWithValues.map(item => ({
            id: item.id,
            path: item.path,
            values: item.values as M,
            databaseId
        }));
    }

    /**
     * Fetch a collection of entities
     */
    async fetchCollection<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        // Handle multi-segment paths by resolving through relations
        if (collectionPath.includes("/")) {
            return this.fetchCollectionFromPath<M>(collectionPath, options);
        }

        return this.fetchEntitiesWithConditions<M>(collectionPath, options);
    }

    /**
     * Search entities by text
     */
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
        return this.fetchEntitiesWithConditions<M>(collectionPath, {
            ...options,
            searchString
        });
    }

    /**
     * Fetch collection from multi-segment path
     */
    private async fetchCollectionFromPath<M extends Record<string, any>>(
        path: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${path}. Expected format: collection/id/relation`);
        }

        const rootCollectionPath = pathSegments[0];
        let currentCollection = getCollectionByPath(rootCollectionPath, this.registry);
        let currentEntityId: string | number = pathSegments[1];

        for (let i = 2; i < pathSegments.length; i += 2) {
            const relationKey = pathSegments[i];
            const resolvedRelations = resolveCollectionRelations(currentCollection);
            const relation = resolvedRelations[relationKey];

            if (!relation) {
                throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
            }

            if (i === pathSegments.length - 1) {
                return this.relationService.fetchRelatedEntities<M>(
                    currentCollection.slug ?? currentCollection.dbPath,
                    currentEntityId,
                    relationKey,
                    options
                );
            }

            if (i + 1 < pathSegments.length) {
                const nextEntityId = pathSegments[i + 1];
                currentCollection = relation.target();
                currentEntityId = nextEntityId;
            }
        }

        throw new Error(`Unable to resolve path: ${path}`);
    }

    /**
     * Count entities in a collection
     */
    async countEntities<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            databaseId?: string;
        } = {}
    ): Promise<number> {
        if (collectionPath.includes("/")) {
            return this.countEntitiesFromPath<M>(collectionPath, options);
        }

        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);

        let query = this.db.select({ count: count() }).from(table).$dynamic();

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
     * Count entities from multi-segment path
     */
    private async countEntitiesFromPath<M extends Record<string, any>>(
        path: string,
        options: { filter?: FilterValues<Extract<keyof M, string>>; databaseId?: string } = {}
    ): Promise<number> {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${path}`);
        }

        const rootCollectionPath = pathSegments[0];
        let currentCollection = getCollectionByPath(rootCollectionPath, this.registry);
        let currentEntityId: string | number = pathSegments[1];

        for (let i = 2; i < pathSegments.length; i += 2) {
            const relationKey = pathSegments[i];
            const resolvedRelations = resolveCollectionRelations(currentCollection);
            const relation = resolvedRelations[relationKey];

            if (!relation) {
                throw new Error(`Relation '${relationKey}' not found`);
            }

            if (i === pathSegments.length - 1) {
                return this.relationService.countRelatedEntities(
                    currentCollection.slug ?? currentCollection.dbPath,
                    currentEntityId,
                    relationKey,
                    options
                );
            }

            if (i + 1 < pathSegments.length) {
                currentCollection = relation.target();
                currentEntityId = pathSegments[i + 1];
            }
        }

        throw new Error(`Unable to count for path: ${path}`);
    }

    /**
     * Check if a field value is unique
     */
    async checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: unknown,
        excludeEntityId?: string,
        _databaseId?: string
    ): Promise<boolean> {
        if (value === undefined || value === null) return true;

        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        const field = table[fieldName as keyof typeof table] as AnyPgColumn;

        if (!field) return true;

        const parsedExcludeId = excludeEntityId ? parseIdValues(excludeEntityId, idInfoArray)[idInfo.fieldName] : undefined;
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

    /**
     * Get the RelationService instance for external use
     */
    getRelationService(): RelationService {
        return this.relationService;
    }

    // =============================================================
    // REST API INCLUDE-AWARE METHODS
    // =============================================================

    /**
     * Fetch a collection of entities with optional relation includes.
     * When `include` is provided, only the specified relations are populated
     * with full entity data (not just { id, path, __type }).
     * When `include` is absent, no relation queries are made (fast path).
     *
     * @param include - Array of relation keys to populate, or ["*"] for all
     */
    async fetchCollectionForRest<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            searchString?: string;
            databaseId?: string;
        } = {},
        include?: string[]
    ): Promise<Record<string, unknown>[]> {
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];

        // First, try Drizzle relational query API (db.query) if include is requested
        if (include && include.length > 0 && this.hasDrizzleQueryAPI(collectionPath)) {
            const result = await this.fetchWithDrizzleQuery<M>(collectionPath, collection, options, include, idInfo);
            if (result) return result;
        }

        // Fallback: fetch base entities without relations
        const entities = await this.fetchEntitiesWithConditionsRaw<M>(collectionPath, options);

        if (!include || include.length === 0) {
            // Fast path: no relations, just return flat entities
            return entities.map(entity => ({
                id: String(entity[idInfo.fieldName]),
                ...entity
            }));
        }

        // Resolve which relation keys to include
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties || {}));
        const shouldInclude = (key: string) =>
            include[0] === "*" || include.includes(key);

        const entityIds = entities.map(e => e[idInfo.fieldName] as string | number);

        // Batch load requested one-to-one relations
        for (const [key, relation] of Object.entries(resolvedRelations)) {
            if (!propertyKeys.has(key) || !shouldInclude(key) || relation.cardinality !== "one") continue;

            try {
                const batchResults = await this.relationService.batchFetchRelatedEntities(
                    collectionPath, entityIds, key, relation
                );

                for (const entity of entities) {
                    const eid = entity[idInfo.fieldName] as string | number;
                    const related = batchResults.get(eid);
                    if (related) {
                        (entity as Record<string, unknown>)[key] = {
                            id: related.id,
                            ...related.values
                        };
                    }
                }
            } catch (e) {
                console.warn(`[include] Failed to batch load one-to-one '${key}':`, e);
            }
        }

        // Batch load requested many relations
        for (const [key, relation] of Object.entries(resolvedRelations)) {
            if (!propertyKeys.has(key) || !shouldInclude(key) || relation.cardinality !== "many") continue;

            try {
                // Use batchFetchManyRelatedEntities for efficiency
                const batchResults = await this.batchFetchManyRelatedEntities(
                    collectionPath, entityIds, key
                );

                for (const entity of entities) {
                    const eid = entity[idInfo.fieldName] as string | number;
                    const relatedList = batchResults.get(String(eid)) || [];
                    (entity as Record<string, unknown>)[key] = relatedList.map(e => ({
                        id: e.id,
                        ...e.values
                    }));
                }
            } catch (e) {
                console.warn(`[include] Failed to batch load many '${key}':`, e);
            }
        }

        return entities.map(entity => ({
            id: String(entity[idInfo.fieldName]),
            ...entity
        }));
    }

    /**
     * Fetch a single entity with optional relation includes for REST API.
     */
    async fetchEntityForRest<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        include?: string[],
        databaseId?: string
    ): Promise<Record<string, unknown> | null> {
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        const parsedIdObj = parseIdValues(entityId, idInfoArray);
        const parsedId = parsedIdObj[idInfo.fieldName];

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return null;

        const raw = result[0] as Record<string, unknown>;
        const flatEntity: Record<string, unknown> = { id: String(raw[idInfo.fieldName]), ...raw };

        if (!include || include.length === 0) {
            return flatEntity;
        }

        // Populate requested relations
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties || {}));
        const shouldInclude = (key: string) =>
            include[0] === "*" || include.includes(key);

        for (const [key, relation] of Object.entries(resolvedRelations)) {
            if (!propertyKeys.has(key) || !shouldInclude(key)) continue;

            try {
                const relatedEntities = await this.relationService.fetchRelatedEntities(
                    collectionPath, parsedId, key, {}
                );

                if (relation.cardinality === "one") {
                    if (relatedEntities.length > 0) {
                        const e = relatedEntities[0];
                        flatEntity[key] = { id: e.id, ...e.values };
                    }
                } else {
                    flatEntity[key] = relatedEntities.map(e => ({
                        id: e.id, ...e.values
                    }));
                }
            } catch (e) {
                console.warn(`[include] Failed to load relation '${key}':`, e);
            }
        }

        return flatEntity;
    }

    /**
     * Fetch raw rows without any relation processing (for REST fast path)
     */
    private async fetchEntitiesWithConditionsRaw<M extends Record<string, any>>(
        collectionPath: string,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            searchString?: string;
        } = {}
    ): Promise<Record<string, unknown>[]> {
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const idInfoArray = getPrimaryKeys(collection, this.registry);
        const idInfo = idInfoArray[0];
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        let query = this.db.select().from(table).$dynamic();
        const allConditions: SQL[] = [];

        if (options.searchString) {
            const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                options.searchString, collection.properties, table
            );
            if (searchConditions.length === 0) return [];
            allConditions.push(DrizzleConditionBuilder.combineConditionsWithOr(searchConditions)!);
        }

        if (options.filter) {
            const filterConditions = this.buildFilterConditions(options.filter, table, collectionPath);
            if (filterConditions.length > 0) allConditions.push(...filterConditions);
        }

        if (allConditions.length > 0) {
            const finalCondition = DrizzleConditionBuilder.combineConditionsWithAnd(allConditions);
            if (finalCondition) query = query.where(finalCondition);
        }

        const orderExpressions = [];
        if (options.orderBy) {
            const orderByField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
            if (orderByField) {
                orderExpressions.push(options.order === "asc" ? asc(orderByField) : desc(orderByField));
            }
        }
        orderExpressions.push(desc(idField));
        if (orderExpressions.length > 0) query = query.orderBy(...orderExpressions);

        const limitValue = options.searchString ? (options.limit || 50) : options.limit;
        if (limitValue) query = query.limit(limitValue);

        return await query as Record<string, unknown>[];
    }

    /**
     * Check if the Drizzle instance has the relational query API available
     * for a given collection path.
     */
    private hasDrizzleQueryAPI(collectionPath: string): boolean {
        const dbAny = this.db as any;
        if (!dbAny.query) return false;
        const collection = getCollectionByPath(collectionPath, this.registry);
        const table = getTableForCollection(collection, this.registry);
        const tableName = getTableName(table);
        return !!dbAny.query[tableName];
    }

    /**
     * Attempt to use Drizzle's relational query API (db.query.<table>.findMany)
     * for efficient JOIN-based relation loading.
     * Returns null if the API is not available or the query fails.
     */
    private async fetchWithDrizzleQuery<M extends Record<string, any>>(
        collectionPath: string,
        collection: EntityCollection,
        options: {
            filter?: FilterValues<Extract<keyof M, string>>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
        },
        include: string[],
        idInfo: { fieldName: string; type: "string" | "number" }
    ): Promise<Record<string, unknown>[] | null> {
        try {
            const dbAny = this.db as any;
            const table = getTableForCollection(collection, this.registry);
            const tableName = getTableName(table);
            const queryTarget = dbAny.query[tableName];

            if (!queryTarget?.findMany) return null;

            // Build the `with` config from include array
            const resolvedRelations = resolveCollectionRelations(collection);
            const withConfig: Record<string, boolean> = {};
            for (const [key, relation] of Object.entries(resolvedRelations)) {
                if (include[0] === "*" || include.includes(key)) {
                    // Use the Drizzle relation name (from the schema)
                    const drizzleRelName = relation.relationName || key;
                    withConfig[drizzleRelName] = true;
                }
            }

            // Build query options
            const queryOpts: Record<string, unknown> = { with: withConfig };
            if (options.limit) queryOpts.limit = options.limit;

            // Build where clause
            if (options.filter) {
                const filterConditions = this.buildFilterConditions(
                    options.filter as any, table, collectionPath
                );
                if (filterConditions.length > 0) {
                    queryOpts.where = and(...filterConditions);
                }
            }

            // Build orderBy
            if (options.orderBy) {
                const orderByField = table[options.orderBy as keyof typeof table] as AnyPgColumn;
                if (orderByField) {
                    queryOpts.orderBy = options.order === "asc" ? asc(orderByField) : desc(orderByField);
                }
            }

            const results = await queryTarget.findMany(queryOpts);

            // Flatten the nested Drizzle results into REST format
            return results.map((row: Record<string, unknown>) => {
                const flat: Record<string, unknown> = { id: String(row[idInfo.fieldName]) };
                for (const [k, v] of Object.entries(row)) {
                    if (k === idInfo.fieldName) continue;
                    if (Array.isArray(v)) {
                        // Many relation — flatten each nested entity
                        flat[k] = v.map((item: Record<string, unknown>) => {
                            // Junction table rows may have the target nested, flatten those
                            const keys = Object.keys(item);
                            // If it looks like a junction row (only FKs + nested objects), extract nested
                            const nestedObj = keys.find(nk => typeof item[nk] === "object" && item[nk] !== null && !Array.isArray(item[nk]));
                            if (nestedObj && keys.length <= 3) {
                                const nested = item[nestedObj] as Record<string, unknown>;
                                return { id: String(nested.id ?? nested[Object.keys(nested)[0]]), ...nested };
                            }
                            return { id: String(item.id ?? item[Object.keys(item)[0]]), ...item };
                        });
                    } else if (typeof v === "object" && v !== null) {
                        // One-to-one relation — inline the object
                        const relObj = v as Record<string, unknown>;
                        flat[k] = { id: String(relObj.id ?? relObj[Object.keys(relObj)[0]]), ...relObj };
                    } else {
                        flat[k] = v;
                    }
                }
                return flat;
            });
        } catch (e) {
            console.warn(`[include] Drizzle relational query failed for '${collectionPath}', falling back:`, e);
            return null;
        }
    }

    /**
     * Batch fetch many-to-many related entities for multiple parent IDs.
     * Groups results by parent ID to avoid N+1.
     */
    private async batchFetchManyRelatedEntities(
        parentCollectionPath: string,
        parentIds: (string | number)[],
        relationKey: string
    ): Promise<Map<string, Entity[]>> {
        const resultMap = new Map<string, Entity[]>();

        // Fetch for all parents using Promise.all (limited batch)
        const batchPromises = parentIds.map(async (parentId) => {
            try {
                const related = await this.relationService.fetchRelatedEntities(
                    parentCollectionPath, parentId, relationKey, {}
                );
                resultMap.set(String(parentId), related);
            } catch (e) {
                resultMap.set(String(parentId), []);
            }
        });

        await Promise.all(batchPromises);
        return resultMap;
    }
}
