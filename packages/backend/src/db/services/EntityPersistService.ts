import { eq } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, EntityCollection, Properties } from "@firecms/types";
import { getTableName, resolveCollectionRelations } from "@firecms/common";
import { DrizzleConditionBuilder } from "../../utils/drizzle-conditions";
import {
    getCollectionByPath,
    getTableForCollection,
    getIdFieldInfo,
    parseIdValue,
    generateEntityId as genEntityId
} from "./entity-helpers";
import { sanitizeAndConvertDates, serializeDataToServer } from "../data-transformer";
import { RelationService } from "./RelationService";
import { EntityFetchService } from "./EntityFetchService";
import { DrizzleClient } from "../interfaces";

/**
 * Service for handling all entity write operations.
 * Handles saving, deleting, and updating entities.
 */
export class EntityPersistService {
    private relationService: RelationService;
    private fetchService: EntityFetchService;

    constructor(private db: DrizzleClient) {
        this.relationService = new RelationService(db);
        this.fetchService = new EntityFetchService(db);
    }

    /**
     * Generate a new entity ID
     */
    generateEntityId(): string {
        return genEntityId();
    }

    /**
     * Delete an entity by ID
     */
    async deleteEntity(collectionPath: string, entityId: string | number, _databaseId?: string): Promise<void> {
        const collection = getCollectionByPath(collectionPath);
        const table = getTableForCollection(collection);
        const idInfo = getIdFieldInfo(collection);
        const idField = table[idInfo.fieldName as keyof typeof table] as AnyPgColumn;

        if (!idField) {
            throw new Error(`ID field '${idInfo.fieldName}' not found in table for collection '${collectionPath}'`);
        }

        const parsedId = parseIdValue(entityId, idInfo.type);

        await this.db
            .delete(table)
            .where(eq(idField, parsedId));
    }

    /**
     * Save an entity (create or update)
     */
    async saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>> {
        // If saving under a nested relation path, resolve the parent and inject FK
        let effectiveCollectionPath = collectionPath;
        const effectiveValues: Partial<M> = { ...values };

        if (collectionPath.includes("/")) {
            const segments = collectionPath.split("/").filter(Boolean);
            if (segments.length >= 3 && segments.length % 2 === 1) {
                const rootSegment = segments[0];
                let currentCollection = getCollectionByPath(rootSegment);
                let currentEntityId: string | number = segments[1];

                for (let i = 2; i < segments.length; i += 2) {
                    const relationKey = segments[i];
                    const resolvedRelations = resolveCollectionRelations(currentCollection);
                    const relation = resolvedRelations[relationKey];

                    if (!relation) {
                        throw new Error(`Relation '${relationKey}' not found in collection '${currentCollection.slug || currentCollection.dbPath}'`);
                    }

                    if (i === segments.length - 1) {
                        const targetCollection = relation.target();
                        effectiveCollectionPath = targetCollection.slug ?? targetCollection.dbPath;

                        // Handle many-to-many with junction table
                        if (relation.cardinality === "many" && relation.through) {
                            const parentIdInfo = getIdFieldInfo(currentCollection);
                            const parsedParentId = parseIdValue(currentEntityId, parentIdInfo.type);

                            (effectiveValues as any).__junction_table_info = {
                                parentCollection: currentCollection,
                                parentId: parsedParentId,
                                relation: relation,
                                relationKey: relationKey
                            };
                            break;
                        }

                        // Find the FK column that should store the parent ID
                        let targetColumnName: string;

                        if (relation.localKey) {
                            targetColumnName = relation.localKey;
                        } else if (relation.foreignKeyOnTarget) {
                            targetColumnName = relation.foreignKeyOnTarget;
                        } else if (relation.joinPath && relation.joinPath.length > 0) {
                            const targetTableName = getTableName(targetCollection);
                            const relevantJoinStep = relation.joinPath.find(joinStep => joinStep.table === targetTableName);

                            if (relevantJoinStep) {
                                const targetColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(relevantJoinStep.on.to);
                                targetColumnName = targetColumnNames[0];
                            } else {
                                console.warn(`Could not find specific join step for target table ${targetTableName} in relation '${relationKey}'.`);
                                const targetColumnNames = DrizzleConditionBuilder.getColumnNamesFromColumns(relation.joinPath[0].on.to);
                                targetColumnName = targetColumnNames[0];
                            }
                        } else {
                            throw new Error(`Relation '${relationKey}' lacks configuration for path-based saving.`);
                        }

                        const parentIdInfo = getIdFieldInfo(currentCollection);
                        const parsedParentId = parseIdValue(currentEntityId, parentIdInfo.type);

                        const existingValue = (effectiveValues as any)[targetColumnName];
                        if (existingValue !== undefined && existingValue !== null && existingValue !== parsedParentId) {
                            console.warn(`Overriding provided value '${existingValue}' for FK '${targetColumnName}' with path parent id '${parsedParentId}'.`);
                        }
                        (effectiveValues as any)[targetColumnName] = parsedParentId;
                        break;
                    } else {
                        const nextEntityId = segments[i + 1];
                        currentCollection = relation.target();
                        currentEntityId = nextEntityId;
                    }
                }
            }
        }

        const collection = getCollectionByPath(effectiveCollectionPath);
        const table = getTableForCollection(collection);
        const idInfo = getIdFieldInfo(collection);
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
                currentId = parseIdValue(entityId, idInfo.type);
                await tx
                    .update(table)
                    .set(entityData)
                    .where(eq(idField, currentId));
            } else {
                const dataForInsert = { ...entityData };
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
                await this.relationService.updateInverseRelations(tx, collection, currentId, inverseRelationUpdates);
            }

            // Update many-to-many relations
            if (Object.keys(relationValues).length > 0) {
                await this.relationService.updateRelationsUsingJoins(tx, collection, currentId, relationValues);
            }

            // Apply joinPath one-to-one relation updates
            if (joinPathRelationUpdates.length > 0) {
                await this.relationService.updateJoinPathOneToOneRelations(tx, collection, currentId, joinPathRelationUpdates);
            }

            // Handle junction table creation for many-to-many path-based saves
            if (junctionTableInfo && !entityId) {
                await this.relationService.handleJunctionTableCreation(tx, currentId, junctionTableInfo);
            }

            return currentId;
        });

        // Fetch the updated/created entity to return with proper relation objects
        const finalEntity = await this.fetchService.fetchEntity<M>(collection.dbPath ?? collection.slug, savedId, databaseId);
        if (!finalEntity) throw new Error("Could not fetch entity after save.");
        return finalEntity;
    }

    /**
     * Get the RelationService instance for external use
     */
    getRelationService(): RelationService {
        return this.relationService;
    }

    /**
     * Get the FetchService instance for external use
     */
    getFetchService(): EntityFetchService {
        return this.fetchService;
    }
}
