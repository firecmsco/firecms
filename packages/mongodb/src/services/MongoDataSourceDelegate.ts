/**
 * MongoDB DataSource Delegate
 *
 * Implements the DataSourceDelegate interface for FireCMS frontend integration.
 * This is the main entry point for FireCMS to interact with MongoDB.
 */

import { Db, ObjectId } from "mongodb";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/types";
import { MongoEntityService } from "../db/MongoEntityService";
import { MongoRealtimeService } from "./MongoRealtimeService";

/**
 * MongoDB DataSource Delegate
 *
 * Implements the DataSourceDelegate interface for FireCMS.
 * Provides all data operations needed by the FireCMS frontend.
 */
export class MongoDataSourceDelegate implements DataSourceDelegate {
    key = "mongodb";
    initialised = true;

    private entityService: MongoEntityService;
    private realtimeService: MongoRealtimeService;

    constructor(
        private db: Db,
        realtimeService?: MongoRealtimeService
    ) {
        this.entityService = new MongoEntityService(db);
        this.realtimeService = realtimeService ?? new MongoRealtimeService(db);
    }

    /**
     * Set a date to midnight (start of day) in UTC
     */
    setDateToMidnight(input?: any): any {
        if (!input) return input;
        if (!(input instanceof Date)) return input;
        const date = new Date(input);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Get the current timestamp
     */
    currentTime(): Date {
        return new Date();
    }

    /**
     * Fetch a collection of entities
     */
    async fetchCollection<M extends Record<string, any>>({
        path,
        collection,
        filter,
        limit,
        startAfter,
        orderBy,
        searchString,
        order
    }: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        return this.entityService.fetchCollection<M>(path, {
            filter,
            limit,
            startAfter,
            orderBy,
            order,
            searchString
        });
    }

    /**
     * Listen to collection changes
     */
    listenCollection<M extends Record<string, any>>({
        path,
        collection,
        filter,
        limit,
        startAfter,
        orderBy,
        searchString,
        order,
        onUpdate,
        onError
    }: ListenCollectionProps<M>): () => void {
        const subscriptionId = this.generateSubscriptionId();

        const callback = (entities: Entity<any>[]) => {
            try {
                onUpdate(entities as Entity<M>[]);
            } catch (error) {
                console.error("Error in collection update callback:", error);
                if (onError) {
                    onError(error instanceof Error ? error : new Error(String(error)));
                }
            }
        };

        this.realtimeService.subscribeToCollection(
            subscriptionId,
            {
                clientId: "datasource",
                path,
                filter,
                orderBy,
                order,
                limit,
                startAfter,
                searchString
            },
            callback
        );

        // Return unsubscribe function
        return () => {
            this.realtimeService.unsubscribe(subscriptionId);
        };
    }

    /**
     * Fetch a single entity
     */
    async fetchEntity<M extends Record<string, any>>({
        path,
        entityId,
        databaseId,
        collection
    }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        return this.entityService.fetchEntity<M>(path, entityId, databaseId);
    }

    /**
     * Listen to entity changes
     */
    listenEntity<M extends Record<string, any>>({
        path,
        entityId,
        collection,
        onUpdate,
        onError
    }: ListenEntityProps<M>): () => void {
        const subscriptionId = this.generateSubscriptionId();

        const callback = (entity: Entity<any> | null) => {
            try {
                onUpdate(entity as Entity<M>);
            } catch (error) {
                console.error("Error in entity update callback:", error);
                if (onError) {
                    onError(error instanceof Error ? error : new Error(String(error)));
                }
            }
        };

        this.realtimeService.subscribeToEntity(
            subscriptionId,
            {
                clientId: "datasource",
                path,
                entityId
            },
            callback
        );

        // Return unsubscribe function
        return () => {
            this.realtimeService.unsubscribe(subscriptionId);
        };
    }

    /**
     * Save an entity (create or update)
     */
    async saveEntity<M extends Record<string, any>>({
        path,
        entityId,
        values,
        collection,
        status
    }: SaveEntityProps<M>): Promise<Entity<M>> {
        const entity = await this.entityService.saveEntity<M>(path, values, entityId);

        // Notify subscribers of the update
        await this.realtimeService.notifyEntityUpdate(path, String(entity.id), entity);

        return entity;
    }

    /**
     * Delete an entity
     */
    async deleteEntity<M extends Record<string, any>>({
        entity,
        collection
    }: DeleteEntityProps<M>): Promise<void> {
        await this.entityService.deleteEntity(entity.path, entity.id);

        // Notify subscribers of the deletion
        await this.realtimeService.notifyEntityUpdate(entity.path, String(entity.id), null);
    }

    /**
     * Check if a field value is unique
     */
    async checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        return this.entityService.checkUniqueField(path, name, value, entityId);
    }

    /**
     * Generate a new entity ID
     */
    generateEntityId(path: string, collection?: EntityCollection): string {
        return this.entityService.generateEntityId();
    }

    /**
     * Count entities in a collection
     */
    async countEntities<M extends Record<string, any>>({
        path,
        collection,
        filter
    }: FetchCollectionProps<M>): Promise<number> {
        return this.entityService.countEntities<M>(path, { filter });
    }

    /**
     * Generate a unique subscription ID
     */
    private generateSubscriptionId(): string {
        return `mongo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if the delegate is ready
     */
    isReady(): boolean {
        return this.initialised;
    }

    /**
     * Get the underlying entity service for direct access
     */
    getEntityService(): MongoEntityService {
        return this.entityService;
    }

    /**
     * Get the underlying realtime service for direct access
     */
    getRealtimeService(): MongoRealtimeService {
        return this.realtimeService;
    }
}
