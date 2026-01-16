import { and, asc, count, desc, eq, gt, lt, or, SQL } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, FilterValues } from "@firecms/types";
import { resolveCollectionRelations } from "@firecms/common";
import { DrizzleConditionBuilder } from "../../utils/drizzle-conditions";
import {
    getCollectionByPath,
    getTableForCollection,
    getIdFieldInfo,
    parseIdValue,
    collectionRegistry
} from "./entity-helpers";
import { parseDataFromServer } from "../data-transformer";
import { RelationService } from "./RelationService";

/**
 * Service for handling all entity read operations.
 * Handles fetching, searching, counting, and filtering entities.
 */
export class EntityFetchService {
    private relationService: RelationService;

    constructor(private db: NodePgDatabase<any>) {
        this.relationService = new RelationService(db);
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
        const collection = getCollectionByPath(collectionPath);
        const table = getTableForCollection(collection);
        const idInfo = getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const parsedId = parseIdValue(entityId, idInfo.type);

        const result = await this.db
            .select()
            .from(table)
            .where(eq(idField, parsedId))
            .limit(1);

        if (result.length === 0) return undefined;

        const raw = result[0] as M;
        const values = await parseDataFromServer(raw, collection, this.db, collectionRegistry);

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
                    (values as any)[key] = relatedEntities.map(e => ({
                        id: e.id,
                        path: e.path,
                        __type: "relation"
                    }));
                } else if (relation.cardinality === "one") {
                    if ((values as any)[key] == null) {
                        try {
                            const relatedEntities = await this.relationService.fetchRelatedEntities(
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
    async fetchEntitiesWithConditions<M extends Record<string, any>>(
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
        const collection = getCollectionByPath(collectionPath);
        const table = getTableForCollection(collection);
        const idInfo = getIdFieldInfo(collection);
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
                    const startAfterOrderValue = options.startAfter.values?.[options.orderBy] ?? options.startAfter[options.orderBy];
                    const startAfterId = options.startAfter.id ?? options.startAfter[idInfo.fieldName];

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
                const startAfterId = options.startAfter.id ?? options.startAfter[idInfo.fieldName];
                if (startAfterId !== undefined) {
                    const parsedStartAfterId = parseIdValue(startAfterId, idInfo.type);
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

        // Second pass: batch load missing one-to-one relations
        const resolvedRelations = resolveCollectionRelations(collection);
        const propertyKeys = new Set(Object.keys(collection.properties));

        for (const [key, relation] of Object.entries(resolvedRelations)) {
            if (!propertyKeys.has(key) || relation.cardinality !== "one") continue;

            const entitiesMissingRelation = entitiesWithValues.filter(item =>
                (item.values as any)[key] == null
            );

            if (entitiesMissingRelation.length === 0) continue;

            try {
                const entityIds = entitiesMissingRelation.map(item => item.entity[idInfo.fieldName]);
                const relationResults = await this.relationService.batchFetchRelatedEntities(
                    collectionPath,
                    entityIds,
                    key,
                    relation
                );

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

        // Handle many relations
        const manyRelationPromises = entitiesWithValues.map(async (item) => {
            const manyRelationQueries = Object.entries(resolvedRelations)
                .filter(([key, relation]) => propertyKeys.has(key) && relation.cardinality === "many")
                .map(async ([key]) => {
                    try {
                        const relatedEntities = await this.relationService.fetchRelatedEntities(
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
            await Promise.all(manyRelationQueries);
        });

        await Promise.all(manyRelationPromises);

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
            startAfter?: any;
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
            startAfter?: any;
            searchString?: string;
            databaseId?: string;
        } = {}
    ): Promise<Entity<M>[]> {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length < 3 || pathSegments.length % 2 === 0) {
            throw new Error(`Invalid relation path: ${path}. Expected format: collection/id/relation`);
        }

        const rootCollectionPath = pathSegments[0];
        let currentCollection = getCollectionByPath(rootCollectionPath);
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

        const collection = getCollectionByPath(collectionPath);
        const table = getTableForCollection(collection);

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
        let currentCollection = getCollectionByPath(rootCollectionPath);
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
        value: any,
        excludeEntityId?: string,
        _databaseId?: string
    ): Promise<boolean> {
        if (value === undefined || value === null) return true;

        const collection = getCollectionByPath(collectionPath);
        const table = getTableForCollection(collection);
        const idInfo = getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;
        const field = table[fieldName as keyof typeof table] as AnyPgColumn;

        if (!field) return true;

        const parsedExcludeId = excludeEntityId ? parseIdValue(excludeEntityId, idInfo.type) : undefined;
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
}
