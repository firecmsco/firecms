// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Entity, FilterValues } from "@firecms/types";
import { EntityFetchService, EntityPersistService, RelationService } from "./services";
import { EntityRepository, FetchCollectionOptions, SearchOptions, CountOptions, DrizzleClient } from "./interfaces";

// Re-export data transformer functions for external use
export { sanitizeAndConvertDates, serializeDataToServer, parseDataFromServer } from "./data-transformer";

// Re-export service classes for direct use
export { EntityFetchService, EntityPersistService, RelationService } from "./services";

// Re-export interfaces
export * from "./interfaces";

/**
 * EntityService - Facade for entity operations.
 * 
 * This class provides a unified API for entity CRUD operations by delegating
 * to specialized services:
 * - EntityFetchService: Read operations (fetch, search, count)
 * - EntityPersistService: Write operations (save, delete)
 * - RelationService: Relation operations (fetch related, update relations)
 * 
 * Implements the EntityRepository interface for database abstraction.
 */
export class EntityService implements EntityRepository {
    private fetchService: EntityFetchService;
    private persistService: EntityPersistService;

    constructor(private db: DrizzleClient) {
        this.fetchService = new EntityFetchService(db);
        this.persistService = new EntityPersistService(db);
    }

    // =============================================================
    // READ OPERATIONS - Delegated to EntityFetchService
    // =============================================================

    /**
     * Fetch a single entity by ID
     */
    async fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> {
        return this.fetchService.fetchEntity<M>(collectionPath, entityId, databaseId);
    }

    /**
     * Fetch a collection of entities with optional filtering, ordering, and pagination
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
        return this.fetchService.fetchCollection<M>(collectionPath, options);
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
        return this.fetchService.searchEntities<M>(collectionPath, searchString, options);
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
        return this.fetchService.countEntities<M>(collectionPath, options);
    }

    /**
     * Check if a field value is unique in a collection
     */
    async checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        databaseId?: string
    ): Promise<boolean> {
        return this.fetchService.checkUniqueField(collectionPath, fieldName, value, excludeEntityId, databaseId);
    }

    /**
     * Fetch entities related to a parent entity
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
        return this.fetchService.getRelationService().fetchRelatedEntities<M>(
            parentCollectionPath,
            parentEntityId,
            relationKey,
            options
        );
    }

    // =============================================================
    // WRITE OPERATIONS - Delegated to EntityPersistService
    // =============================================================

    /**
     * Save an entity (create or update)
     */
    async saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>> {
        return this.persistService.saveEntity<M>(collectionPath, values, entityId, databaseId);
    }

    /**
     * Delete an entity by ID
     */
    async deleteEntity(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<void> {
        return this.persistService.deleteEntity(collectionPath, entityId, databaseId);
    }

    /**
     * Generate a new entity ID
     */
    generateEntityId(): string {
        return this.persistService.generateEntityId();
    }

    // =============================================================
    // SERVICE ACCESSORS
    // =============================================================

    /**
     * Get the underlying EntityFetchService for advanced use
     */
    getFetchService(): EntityFetchService {
        return this.fetchService;
    }

    /**
     * Get the underlying EntityPersistService for advanced use
     */
    getPersistService(): EntityPersistService {
        return this.persistService;
    }

    /**
     * Get the underlying RelationService for advanced use
     */
    getRelationService(): RelationService {
        return this.fetchService.getRelationService();
    }
}
