import { and, eq, inArray, sql, SQL } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, FilterValues, Relation } from "@firecms/types";
import { getTableName, resolveCollectionRelations } from "@firecms/common";
import { DrizzleConditionBuilder } from "../../utils/drizzle-conditions";
import {
    getCollectionByPath,
    getTableForCollection,
    getIdFieldInfo,
    parseIdValue,
    collectionRegistry
} from "./entity-helpers";
import { parseDataFromServer } from "../data-transformer";

/**
 * Service for handling all relation-related operations.
 * Handles fetching, updating, and managing entity relations.
 */
export class RelationService {
    constructor(private db: NodePgDatabase<any>) { }

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
        const parentCollection = getCollectionByPath(parentCollectionPath);
        const resolvedRelations = resolveCollectionRelations(parentCollection);
        const relation = resolvedRelations[relationKey];

        if (!relation) {
            throw new Error(`Relation '${relationKey}' not found in collection '${parentCollectionPath}'`);
        }

        return this.fetchEntitiesUsingJoins<M>(parentCollection, parentEntityId, relation, options);
    }

    /**
     * Fetch entities using join paths for complex relations
     */
    async fetchEntitiesUsingJoins<M extends Record<string, any>>(
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
        const targetTable = getTableForCollection(targetCollection);
        const idInfo = getIdFieldInfo(targetCollection);
        const idField = targetTable[idInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = getIdFieldInfo(parentCollection);
        const parsedParentId = parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Handle join path relations
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
            query = query.where(eq(parentIdField, parsedParentId)) as any;

            if (options.limit) {
                query = query.limit(options.limit) as any;
            }

            const results = await query;
            const targetTableName = relation.joinPath[relation.joinPath.length - 1].table;

            // Process results
            const entities: Entity<M>[] = [];
            for (const row of results as any[]) {
                const targetEntity = row[targetTableName] || row;
                const entityId = targetEntity[idInfo.fieldName];
                const parsedValues = await parseDataFromServer(targetEntity, targetCollection, this.db, collectionRegistry);

                entities.push({
                    id: entityId?.toString() || "",
                    path: targetCollection.slug ?? targetCollection.dbPath,
                    values: parsedValues as M
                });
            }

            return entities;
        }

        // Handle other relation types
        let query: any = this.db.select().from(targetTable);

        // Build additional filter conditions
        const additionalFilters: SQL[] = [];

        // Handle search conditions if searchString is provided
        if (options.searchString) {
            const searchConditions = DrizzleConditionBuilder.buildSearchConditions(
                options.searchString,
                targetCollection.properties,
                targetTable
            );

            if (searchConditions.length === 0) {
                // No searchable fields found, return empty results
                return [];
            }

            const searchCombined = DrizzleConditionBuilder.combineConditionsWithOr(searchConditions);
            if (searchCombined) {
                additionalFilters.push(searchCombined);
            }
        }

        // Use unified relation query builder
        query = DrizzleConditionBuilder.buildRelationQuery(
            query,
            relation,
            parsedParentId,
            targetTable,
            parentTable,
            parentIdCol,
            idField,
            collectionRegistry,
            additionalFilters
        );

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const results = await query;

        // Process results - ensure results is iterable
        if (!results || !Array.isArray(results)) {
            return [];
        }

        const entities: Entity<M>[] = [];
        for (const row of results) {
            const targetEntity = row[getTableName(targetCollection)] || row;
            const entityId = targetEntity[idInfo.fieldName];
            const parsedValues = await parseDataFromServer(targetEntity, targetCollection, this.db, collectionRegistry);

            entities.push({
                id: entityId?.toString() || "",
                path: targetCollection.slug ?? targetCollection.dbPath,
                values: parsedValues as M
            });
        }

        return entities;
    }

    /**
     * Count related entities for a parent entity
     */
    async countRelatedEntities<M extends Record<string, any>>(
        parentCollectionPath: string,
        parentEntityId: string | number,
        relationKey: string,
        options: { filter?: FilterValues<Extract<keyof M, string>>; databaseId?: string } = {}
    ): Promise<number> {
        const parentCollection = getCollectionByPath(parentCollectionPath);
        const resolvedRelations = resolveCollectionRelations(parentCollection);
        const relation = resolvedRelations[relationKey];
        if (!relation) throw new Error(`Relation '${relationKey}' not found in collection '${parentCollectionPath}'`);

        const targetCollection = relation.target();
        const targetTable = getTableForCollection(targetCollection);
        const targetIdInfo = getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = getIdFieldInfo(parentCollection);
        const parsedParentId = parseIdValue(parentEntityId, parentIdInfo.type);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Start count with distinct to avoid duplicates from junction tables
        let query: any = this.db.select({ count: sql<number>`count(distinct ${targetIdField})` }).from(targetTable);

        // Build additional filter conditions
        const additionalFilters: SQL[] = [];

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

    /**
     * Batch fetch related entities for multiple parent entities to avoid N+1 queries
     */
    async batchFetchRelatedEntities(
        parentCollectionPath: string,
        parentEntityIds: (string | number)[],
        _relationKey: string,
        relation: Relation
    ): Promise<Map<string | number, Entity<any>>> {
        if (parentEntityIds.length === 0) return new Map();

        const parentCollection = getCollectionByPath(parentCollectionPath);
        const targetCollection = relation.target();
        const targetTable = getTableForCollection(targetCollection);
        const targetIdInfo = getIdFieldInfo(targetCollection);
        const targetIdField = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

        const parentIdInfo = getIdFieldInfo(parentCollection);
        const parentTable = collectionRegistry.getTable(getTableName(parentCollection));
        if (!parentTable) throw new Error("Parent table not found");
        const parentIdCol = parentTable[parentIdInfo.fieldName as keyof typeof parentTable] as AnyPgColumn;

        // Parse all parent IDs once
        const parsedParentIds = parentEntityIds.map(id => parseIdValue(id, parentIdInfo.type));

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
        results.forEach((row: any) => {
            const targetEntity = row[getTableName(targetCollection)] || row;

            // Determine the parent ID this result belongs to based on the relation type
            let parentId: string | number | undefined;

            if (relation.direction === "inverse" && relation.foreignKeyOnTarget) {
                parentId = targetEntity[relation.foreignKeyOnTarget];
            } else if (relation.direction === "inverse" && relation.cardinality === "one" && relation.inverseRelationName) {
                const inferredForeignKeyName = `${relation.inverseRelationName}_id`;
                parentId = targetEntity[inferredForeignKeyName];
            } else if (relation.direction === "owning" && relation.localKey) {
                for (const parsedParentId of parsedParentIds) {
                    if (!resultMap.has(parsedParentId)) {
                        parentId = parsedParentId;
                        break;
                    }
                }
            }

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

    /**
     * Update many-to-many and junction relations
     */
    async updateRelationsUsingJoins<M extends Record<string, any>>(
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

            // Use joinPath if available
            if (relation.joinPath && relation.joinPath.length > 0) {
                const parentTableName = getTableName(collection);
                const targetTableName = getTableName(targetCollection);

                let junctionTable: PgTable | undefined = undefined;
                let sourceJunctionColumn: AnyPgColumn | null = null;
                let targetJunctionColumn: AnyPgColumn | null = null;

                const junctionTableName = relation.joinPath.find(step =>
                    step.table !== parentTableName && step.table !== targetTableName
                )?.table;

                if (junctionTableName) {
                    junctionTable = collectionRegistry.getTable(junctionTableName);

                    if (junctionTable) {
                        for (const joinStep of relation.joinPath) {
                            const fromTable = DrizzleConditionBuilder.getTableNamesFromColumns(joinStep.on.from)[0];
                            const toTable = DrizzleConditionBuilder.getTableNamesFromColumns(joinStep.on.to)[0];

                            if (fromTable === parentTableName && toTable === junctionTableName) {
                                const columnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.to);
                                sourceJunctionColumn = junctionTable[columnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            } else if (fromTable === junctionTableName && toTable === parentTableName) {
                                const columnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.from);
                                sourceJunctionColumn = junctionTable[columnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            }

                            if (fromTable === junctionTableName && toTable === targetTableName) {
                                const columnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.from);
                                targetJunctionColumn = junctionTable[columnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            } else if (fromTable === targetTableName && toTable === junctionTableName) {
                                const columnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(joinStep.on.to);
                                targetJunctionColumn = junctionTable[columnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            }
                        }
                    }
                }

                if (!junctionTable || !sourceJunctionColumn || !targetJunctionColumn) {
                    console.warn(`Could not determine junction table for relation '${key}' in collection '${collection.slug || collection.dbPath}'`);
                    continue;
                }

                const parentIdInfo = getIdFieldInfo(collection);
                const parsedParentId = parseIdValue(entityId, parentIdInfo.type);

                // Delete existing relations for this entity
                await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedParentId));

                if (targetEntityIds.length > 0) {
                    const targetIdInfo = getIdFieldInfo(targetCollection);
                    const parsedTargetIds = targetEntityIds.map(id => parseIdValue(id, targetIdInfo.type));

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

                if (!sourceJunctionColumn || !targetJunctionColumn) {
                    console.warn(`Junction columns not found for relation '${key}'`);
                    continue;
                }

                const parentIdInfo = getIdFieldInfo(collection);
                const parsedParentId = parseIdValue(entityId, parentIdInfo.type);

                // Delete existing relations for this entity
                await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedParentId));

                if (targetEntityIds.length > 0) {
                    const targetIdInfo = getIdFieldInfo(targetCollection);
                    const parsedTargetIds = targetEntityIds.map(id => parseIdValue(id, targetIdInfo.type));

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
                const targetTable = getTableForCollection(targetCollection);
                const targetIdInfo = getIdFieldInfo(targetCollection);
                const targetIdCol = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;
                const fkCol = targetTable[relation.foreignKeyOnTarget as keyof typeof targetTable] as AnyPgColumn;

                if (!fkCol || !targetIdCol) {
                    console.warn(`Invalid inverse-many config for relation '${key}' in collection '${collection.slug || collection.dbPath}'`);
                    continue;
                }

                const parentIdInfo = getIdFieldInfo(collection);
                const parsedParentId = parseIdValue(entityId, parentIdInfo.type);

                // Clear existing links not in the new set
                if (targetEntityIds.length > 0) {
                    const parsedTargetIds = targetEntityIds.map(id => parseIdValue(id, targetIdInfo.type));
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
                console.warn(`Many relation '${key}' in collection '${collection.slug || collection.dbPath}' lacks write configuration and will be skipped during save.`);
            }
        }
    }

    /**
     * Update inverse relations (where FK is on the target table)
     */
    async updateInverseRelations(
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
                const targetTable = getTableForCollection(targetCollection);
                const targetIdInfo = getIdFieldInfo(targetCollection);
                const sourceIdInfo = getIdFieldInfo(sourceCollection);

                // Handle inverse relations with joinPath
                if (relation.direction === "inverse" && relation.joinPath && relation.joinPath.length > 0) {
                    await this.updateInverseJoinPathRelation(
                        tx,
                        sourceCollection,
                        sourceEntityId,
                        targetCollection,
                        relation,
                        newValue
                    );
                    continue;
                }

                // Check if this is a many-to-many inverse relation
                if (relation.cardinality === "many" && relation.direction === "inverse") {
                    const targetCollectionRelations = resolveCollectionRelations(targetCollection);
                    let junctionInfo: { table: string; sourceColumn: string; targetColumn: string } | null = null;

                    for (const [relationKey, targetRelation] of Object.entries(targetCollectionRelations)) {
                        if (targetRelation.cardinality === "many" &&
                            targetRelation.direction === "owning" &&
                            targetRelation.through &&
                            (targetRelation.relationName === relation.inverseRelationName || relationKey === relation.inverseRelationName)) {
                            junctionInfo = {
                                table: targetRelation.through.table,
                                sourceColumn: targetRelation.through.targetColumn,
                                targetColumn: targetRelation.through.sourceColumn
                            };
                            break;
                        }
                    }

                    if (junctionInfo) {
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

                // Handle simple inverse relations
                if (!relation.foreignKeyOnTarget) {
                    console.warn(`Inverse relation '${relation.relationName}' is missing foreignKeyOnTarget property. Skipping.`);
                    continue;
                }

                const foreignKeyColumn = targetTable[relation.foreignKeyOnTarget! as keyof typeof targetTable] as AnyPgColumn;
                if (!foreignKeyColumn) {
                    console.warn(`Foreign key column '${relation.foreignKeyOnTarget}' not found in target table for relation '${relation.relationName}'`);
                    continue;
                }

                const parsedSourceId = parseIdValue(sourceEntityId, sourceIdInfo.type);

                if (newValue === null || newValue === undefined) {
                    await tx
                        .update(targetTable)
                        .set({ [relation.foreignKeyOnTarget!]: null })
                        .where(eq(foreignKeyColumn, parsedSourceId));
                } else {
                    const parsedNewTargetId = parseIdValue(newValue, targetIdInfo.type);
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
     * Handle inverse relations with joinPath
     */
    private async updateInverseJoinPathRelation(
        tx: NodePgDatabase<any>,
        sourceCollection: EntityCollection,
        sourceEntityId: string | number,
        targetCollection: EntityCollection,
        relation: Relation,
        newValue: any
    ) {
        try {
            if (!relation.joinPath || relation.joinPath.length === 0) {
                console.warn(`Inverse relation '${relation.relationName}' missing joinPath`);
                return;
            }

            const sourceTableName = getTableName(sourceCollection);
            const targetTableName = getTableName(targetCollection);

            // Find intermediate tables that are neither source nor target
            const intermediateTables = relation.joinPath
                .map(step => step.table)
                .filter(table => table !== sourceTableName && table !== targetTableName);

            // If there's exactly one intermediate table, it's likely a junction table for many-to-many
            if (intermediateTables.length === 1 && relation.cardinality === "many") {
                const junctionTableName = intermediateTables[0];
                const junctionTable = collectionRegistry.getTable(junctionTableName);

                if (!junctionTable) {
                    console.warn(`Junction table '${junctionTableName}' not found for inverse joinPath relation '${relation.relationName}'`);
                    return;
                }

                let sourceJunctionColumn: AnyPgColumn | null = null;
                let targetJunctionColumn: AnyPgColumn | null = null;

                for (const step of relation.joinPath) {
                    if (step.table === junctionTableName) {
                        const fromTable = DrizzleConditionBuilder.getTableNamesFromColumns(step.on.from)[0];
                        const toColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(step.on.to);
                        const fromColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(step.on.from);

                        if (fromTable === sourceTableName) {
                            sourceJunctionColumn = junctionTable[toColumnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                        } else if (fromTable === targetTableName) {
                            targetJunctionColumn = junctionTable[toColumnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                        } else {
                            const toTable = DrizzleConditionBuilder.getTableNamesFromColumns(step.on.to)[0];
                            if (toTable === sourceTableName) {
                                sourceJunctionColumn = junctionTable[fromColumnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            } else if (toTable === targetTableName) {
                                targetJunctionColumn = junctionTable[fromColumnNames[0] as keyof typeof junctionTable] as AnyPgColumn;
                            }
                        }
                    }
                }

                if (!sourceJunctionColumn || !targetJunctionColumn) {
                    console.warn(`Could not determine junction columns for inverse joinPath relation '${relation.relationName}'`);
                    return;
                }

                // Perform the junction table update
                const sourceIdInfo = getIdFieldInfo(sourceCollection);
                const parsedSourceId = parseIdValue(sourceEntityId, sourceIdInfo.type);

                // Clear existing entries for this source entity
                await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedSourceId));

                // Add new entries if newValue is provided
                if (newValue && Array.isArray(newValue) && newValue.length > 0) {
                    const targetIdInfo = getIdFieldInfo(targetCollection);
                    const targetEntityIds = newValue.map((rel: any) => rel.id || rel);
                    const parsedTargetIds = targetEntityIds.map(id => parseIdValue(id, targetIdInfo.type));

                    const newLinks = parsedTargetIds.map(targetId => ({
                        [sourceJunctionColumn!.name]: parsedSourceId,
                        [targetJunctionColumn!.name]: targetId
                    }));

                    if (newLinks.length > 0) {
                        await tx.insert(junctionTable).values(newLinks);
                    }
                } else if (newValue && !Array.isArray(newValue)) {
                    // Single value for one-to-one
                    const targetIdInfo = getIdFieldInfo(targetCollection);
                    const targetId = typeof newValue === 'object' ? newValue.id : newValue;
                    const parsedTargetId = parseIdValue(targetId, targetIdInfo.type);

                    const newLink = {
                        [sourceJunctionColumn.name]: parsedSourceId,
                        [targetJunctionColumn.name]: parsedTargetId
                    };

                    await tx.insert(junctionTable).values(newLink);
                }
            }
        } catch (error) {
            console.error(`Failed to update inverse joinPath relation '${relation.relationName}':`, error);
            throw error;
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

            if (!sourceJunctionColumn || !targetJunctionColumn) {
                console.warn(`Junction columns not found for relation '${relation.relationName}'`);
                return;
            }

            const sourceIdInfo = getIdFieldInfo(sourceCollection);
            const parsedSourceId = parseIdValue(sourceEntityId, sourceIdInfo.type);

            // Clear existing entries for this source entity
            await tx.delete(junctionTable).where(eq(sourceJunctionColumn, parsedSourceId));

            // Add new entries if newValue is provided
            if (newValue && Array.isArray(newValue) && newValue.length > 0) {
                const targetIdInfo = getIdFieldInfo(targetCollection);
                const targetEntityIds = newValue.map((rel: any) => rel.id);
                const parsedTargetIds = targetEntityIds.map(id => parseIdValue(id, targetIdInfo.type));

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

    /**
     * Update one-to-one relations that use joinPath
     */
    async updateJoinPathOneToOneRelations(
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
            const { relation, newTargetId } = upd;
            const targetCollection = relation.target();
            const targetTable = getTableForCollection(targetCollection);
            const targetIdInfo = getIdFieldInfo(targetCollection);
            const targetIdCol = targetTable[targetIdInfo.fieldName as keyof typeof targetTable] as AnyPgColumn;

            // Determine mapping of columns
            const { targetFKColName, parentSourceColName } = this.resolveJoinPathWriteMapping(parentCollection, relation);
            const parentTable = getTableForCollection(parentCollection);
            const parentIdInfo = getIdFieldInfo(parentCollection);
            const parsedParentId = parseIdValue(parentEntityId, parentIdInfo.type);

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

            // Fetch the parent row to obtain the value for parentSourceCol
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
            const parsedTargetId = parseIdValue(newTargetId, targetIdInfo.type);

            // Ensure one-to-one by clearing existing link from any target rows with this parent FK
            if (parentFKValue !== null && parentFKValue !== undefined) {
                await tx.update(targetTable)
                    .set({ [targetFKColName]: null })
                    .where(eq(targetFKCol, parentFKValue as any));
            } else {
                console.warn(`Cannot set joinPath relation '${relation.relationName}' because parent FK value is null/undefined`);
                continue;
            }

            // Now set the FK on the target entity
            await tx.update(targetTable)
                .set({ [targetFKColName]: parentFKValue as any })
                .where(eq(targetIdCol, parsedTargetId));
        }
    }

    /**
     * Resolve joinPath write mapping for one-to-one relations
     */
    resolveJoinPathWriteMapping(
        parentCollection: EntityCollection,
        relation: Relation
    ): { targetFKColName: string; parentSourceColName: string } {
        if (!relation.joinPath || relation.joinPath.length === 0) {
            throw new Error("resolveJoinPathWriteMapping requires a joinPath relation");
        }
        const parentTableName = getTableName(parentCollection);
        const lastStep = relation.joinPath[relation.joinPath.length - 1];
        const targetFKColName = DrizzleConditionBuilder.getColumnNamesFromColumns(lastStep.on.to)[0];
        let currentFrom = lastStep.on.from;

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
        return { targetFKColName, parentSourceColName };
    }

    /**
     * Handle junction table creation for many-to-many path-based saves
     */
    async handleJunctionTableCreation(
        tx: NodePgDatabase<any>,
        newEntityId: string | number,
        junctionTableInfo: {
            parentCollection: EntityCollection;
            parentId: string | number;
            relation: Relation;
            relationKey: string;
        }
    ) {
        const { parentCollection, parentId, relation, relationKey } = junctionTableInfo;
        const targetCollection = relation.target();

        try {
            const junctionTable = collectionRegistry.getTable(relation.through!.table);
            if (!junctionTable) {
                console.warn(`Junction table '${relation.through!.table}' not found for relation '${relationKey}'`);
                return;
            }

            const sourceJunctionColumn = junctionTable[relation.through!.sourceColumn as keyof typeof junctionTable] as AnyPgColumn;
            const targetJunctionColumn = junctionTable[relation.through!.targetColumn as keyof typeof junctionTable] as AnyPgColumn;

            if (!sourceJunctionColumn || !targetJunctionColumn) {
                console.warn(`Junction columns not found for relation '${relationKey}'`);
                return;
            }

            // Parse the new entity ID to the correct type
            const targetIdInfo = getIdFieldInfo(targetCollection);
            const parsedNewEntityId = parseIdValue(newEntityId, targetIdInfo.type);

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
