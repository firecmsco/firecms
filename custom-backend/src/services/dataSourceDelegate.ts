import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { Database } from "../db/connection";
import {
    DeleteEntityRequest,
    Entity,
    EntityCollection,
    FetchCollectionRequest,
    FetchEntityRequest,
    ListenCollectionRequest,
    ListenEntityRequest,
    SaveEntityRequest
} from "../types";
import { PgTable } from "drizzle-orm/pg-core";

export interface DataSourceDelegate {
    key: string;
    initialised?: boolean;

    fetchCollection<M extends Record<string, any>>(props: FetchCollectionRequest<M>): Promise<Entity<M>[]>;

    listenCollection?<M extends Record<string, any>>(props: ListenCollectionRequest<M>): () => void;

    fetchEntity<M extends Record<string, any>>(props: FetchEntityRequest<M>): Promise<Entity<M> | undefined>;

    listenEntity?<M extends Record<string, any>>(props: ListenEntityRequest<M>): () => void;

    saveEntity<M extends Record<string, any>>(props: SaveEntityRequest<M>): Promise<Entity<M>>;

    deleteEntity<M extends Record<string, any>>(props: DeleteEntityRequest<M>): Promise<void>;

    checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean>;

    generateEntityId(path: string, collection?: EntityCollection): string;

    countEntities?<M extends Record<string, any>>(props: FetchCollectionRequest<M>): Promise<number>;

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
                                                         }: FetchCollectionRequest<M>): Promise<Entity<M>[]> {

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
                                                    }: ListenCollectionRequest<M>): () => void {

        const subscriptionId = this.generateSubscriptionId();

        // For now, use polling instead of real WebSocket integration
        // You can enhance this later to use actual WebSocket subscriptions
        const pollInterval = setInterval(async () => {
            try {
                const entities = await this.fetchCollection({
                    path,
                    collection,
                    filter,
                    limit,
                    startAfter,
                    orderBy,
                    searchString,
                    order
                });
                onUpdate(entities);
            } catch (error) {
                if (onError) onError(error as Error);
            }
        }, 2000); // Poll every 2 seconds

        // Initial fetch
        this.fetchCollection({
            path,
            collection,
            filter,
            limit,
            startAfter,
            orderBy,
            searchString,
            order
        }).then(onUpdate).catch(error => {
            if (onError) onError(error);
        });

        return () => {
            clearInterval(pollInterval);
        };
    }

    async fetchEntity<M extends Record<string, any>>({
                                                         path,
                                                         entityId,
                                                         databaseId,
                                                         collection
                                                     }: FetchEntityRequest<M>): Promise<Entity<M> | undefined> {
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
                                                }: ListenEntityRequest<M>): () => void {

        // Polling-based approach for entity updates
        const pollInterval = setInterval(async () => {
            try {
                const entity = await this.fetchEntity({
                    path,
                    entityId,
                    collection
                });
                if (entity) {
                    onUpdate(entity);
                }
            } catch (error) {
                if (onError) onError(error as Error);
            }
        }, 2000);

        // Initial fetch
        this.fetchEntity({
            path,
            entityId,
            collection
        })
            .then(entity => {
                if (entity) onUpdate(entity);
            })
            .catch(error => {
                if (onError) onError(error);
            });

        return () => {
            clearInterval(pollInterval);
        };
    }

    async saveEntity<M extends Record<string, any>>({
                                                        path,
                                                        entityId,
                                                        values,
                                                        collection,
                                                        status
                                                    }: SaveEntityRequest<M>): Promise<Entity<M>> {

        const savedEntity = await this.entityService.saveEntity<M>(
            path,
            values,
            entityId,
            collection?.databaseId
        );

        // Notify real-time subscribers
        await this.realtimeService.notifyEntityUpdate(
            path,
            savedEntity.id,
            savedEntity,
            collection?.databaseId
        );

        return savedEntity;
    }

    async deleteEntity<M extends Record<string, any>>({
                                                          entity,
                                                          collection
                                                      }: DeleteEntityRequest<M>): Promise<void> {

        await this.entityService.deleteEntity(
            entity.path,
            entity.id,
            entity.databaseId || collection?.databaseId
        );

        // Notify real-time subscribers
        await this.realtimeService.notifyEntityUpdate(
            entity.path,
            entity.id,
            null,
            entity.databaseId || collection?.databaseId
        );
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
                                                       }: FetchCollectionRequest<M>): Promise<number> {
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
