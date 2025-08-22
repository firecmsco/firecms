import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { Database } from "../db/connection";

import { PgTable } from "drizzle-orm/pg-core";
import {
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/types";

export interface DataSourceDelegate {
    key: string;
    initialised?: boolean;

    fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]>;

    listenCollection?<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void;

    fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined>;

    listenEntity?<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void;

    saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>>;

    deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void>;

    checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean>;

    generateEntityId(path: string, collection?: EntityCollection): string;

    countEntities?<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number>;

    isFilterCombinationValid?(props: any): boolean;

    currentTime?: () => any;
    delegateToCMSModel: (data: any) => any;
    cmsToDelegateModel: (data: any) => any;
    setDateToMidnight: (input?: any) => any;
    initTextSearch?: (props: any) => Promise<boolean>;
}

export class PostgresDataSourceDelegate implements DataSourceDelegate {
    key = "postgres";
    initialised = true;

    private entityService: EntityService;
    private realtimeService: RealtimeService;

    constructor(
        private db: Database,
        realtimeService: RealtimeService,
        tables: Record<string, PgTable>
    ) {
        this.entityService = new EntityService(db, tables);
        this.realtimeService = realtimeService;
    }

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

        if (searchString) {
            return this.entityService.searchEntities<M>(
                path,
                searchString,
                collection?.databaseId
            );
        }

        return this.entityService.fetchCollection<M>(path, {
            filter,
            orderBy,
            order,
            limit,
            startAfter,
            databaseId: collection?.databaseId
        });
    }

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

        console.log("🔄 [DataSourceDelegate] Setting up collection subscription:", subscriptionId);
        console.log("🔄 [DataSourceDelegate] Collection path:", path);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entities: Entity<M>[]) => {
            console.log("🔄 [DataSourceDelegate] Received collection update for path:", path);
            console.log("🔄 [DataSourceDelegate] Updated entities count:", entities.length);
            console.log("🔄 [DataSourceDelegate] Updated entity IDs:", entities.map(e => e.id));
            console.log("🔄 [DataSourceDelegate] Calling onUpdate callback...");
            onUpdate(entities);
            console.log("🔄 [DataSourceDelegate] onUpdate callback completed");
        };

        // Store the subscription in RealtimeService properly using the new public method
        this.realtimeService.registerDataSourceSubscription(subscriptionId, {
            clientId: "datasource",
            type: "collection" as const,
            path,
            collectionRequest: {
                filter,
                orderBy,
                order,
                limit,
                startAfter,
                databaseId: collection?.databaseId,
                searchString
            }
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper);

        console.log("🔄 [DataSourceDelegate] Subscription registered with RealtimeService");
        console.log("🔄 [DataSourceDelegate] Total subscriptions:", this.realtimeService.subscriptions.size);

        // Send initial data immediately
        this.fetchCollection({
            path: path,
            collection,
            filter,
            limit,
            startAfter,
            orderBy,
            searchString,
            order
        }).then(entities => {
            console.log("🔄 [DataSourceDelegate] Initial data fetched for subscription:", subscriptionId);
            console.log("🔄 [DataSourceDelegate] Initial entities count:", entities.length);
            callbackWrapper(entities);
        }).catch(error => {
            console.error("🔄 [DataSourceDelegate] Error fetching initial data:", error);
            if (onError) onError(error);
        });

        console.log("🔄 [DataSourceDelegate] Collection subscription setup complete:", subscriptionId);

        return () => {
            console.log("🔄 [DataSourceDelegate] Unsubscribing from collection:", subscriptionId);
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
            console.log("🔄 [DataSourceDelegate] Unsubscription complete");
        };
    }

    async fetchEntity<M extends Record<string, any>>({
                                                         path,
                                                         entityId,
                                                         databaseId,
                                                         collection
                                                     }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        return this.entityService.fetchEntity<M>(
            path,
            entityId,
            databaseId || collection?.databaseId
        );
    }

    listenEntity<M extends Record<string, any>>({
                                                    path,
                                                    entityId,
                                                    collection,
                                                    onUpdate,
                                                    onError
                                                }: ListenEntityProps<M>): () => void {

        const subscriptionId = this.generateSubscriptionId();
        console.log("🔄 [DataSourceDelegate] Setting up ENTITY subscription:", subscriptionId);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entity: Entity<M> | null) => {
            console.log("🔄 [DataSourceDelegate] Received entity update for path:", path, "ID:", entityId);
            if (entity)
                onUpdate(entity);
        };

        // Register the subscription with the RealtimeService
        this.realtimeService.registerDataSourceSubscription(subscriptionId, {
            clientId: "datasource",
            type: "entity" as const,
            path,
            entityId
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper);

        // Fetch initial data
        this.fetchEntity({
            path,
            entityId,
            collection
        })
            .then(entity => {
                if (entity) onUpdate(entity);
            })
            .catch(error => {
                if (onError) onError(error as Error);
            });

        // Return the unsubscribe function
        return () => {
            console.log("🔄 [DataSourceDelegate] Unsubscribing from entity:", subscriptionId);
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
        };
    }

    async saveEntity<M extends Record<string, any>>({
                                                        path,
                                                        entityId,
                                                        values,
                                                        collection,
                                                        status
                                                    }: SaveEntityProps<M>): Promise<Entity<M>> {

        const savedEntity = await this.entityService.saveEntity<M>(
            path,
            values,
            entityId,
            collection?.databaseId
        );

        // Notify real-time subscribers
        await this.realtimeService.notifyEntityUpdate(
            path,
            savedEntity.id.toString(),
            savedEntity,
            collection?.databaseId
        );

        return savedEntity;
    }

    async deleteEntity<M extends Record<string, any>>({
                                                          entity,
                                                          collection
                                                      }: DeleteEntityProps<M>): Promise<void> {

        console.log("🗑️ [DataSourceDelegate] Starting delete for entity:", entity.id, "in path:", entity.path);

        await this.entityService.deleteEntity(
            entity.path,
            entity.id,
            entity.databaseId || collection?.databaseId
        );

        console.log("🗑️ [DataSourceDelegate] Entity deleted from database, now notifying real-time subscribers");

        // Use the EXACT SAME notification system as saveEntity - this is the key!
        await this.realtimeService.notifyEntityUpdate(
            entity.path,
            entity.id.toString(),
            null, // null indicates deletion
            entity.databaseId || collection?.databaseId
        );

        console.log("🗑️ [DataSourceDelegate] Real-time notification sent for deletion");
    }

    async checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        return this.entityService.checkUniqueField(
            path,
            name,
            value,
            entityId,
            collection?.databaseId
        );
    }

    generateEntityId(path: string, collection?: EntityCollection): string {
        return this.entityService.generateEntityId();
    }

    async countEntities<M extends Record<string, any>>({
                                                           path,
                                                           collection
                                                       }: FetchCollectionProps<M>): Promise<number> {
        return this.entityService.countEntities(path, collection?.databaseId);
    }

    isFilterCombinationValid(): boolean {
        // PostgreSQL with proper indexing supports most filter combinations
        return true;
    }

    currentTime(): Date {
        return new Date();
    }

    // Data transformation methods to maintain compatibility with FireCMS
    delegateToCMSModel(data: any): any {
        if (data === null || data === undefined) return data;

        if (data instanceof Date) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.delegateToCMSModel(item));
        }

        if (typeof data === "object") {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                result[key] = this.delegateToCMSModel(value);
            }
            return result;
        }

        return data;
    }

    cmsToDelegateModel(data: any): any {
        if (data === undefined) {
            return null; // PostgreSQL doesn't support undefined
        }

        if (data === null) return data;

        if (data instanceof Date) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.cmsToDelegateModel(item));
        }

        if (typeof data === "object") {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                const converted = this.cmsToDelegateModel(value);
                if (converted !== null) {
                    result[key] = converted;
                }
            }
            return result;
        }

        return data;
    }

    setDateToMidnight(input?: Date): Date | undefined {
        if (!input || !(input instanceof Date)) return input;
        const date = new Date(input);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    async initTextSearch(): Promise<boolean> {
        // Text search is implemented in the searchEntities method
        return true;
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
