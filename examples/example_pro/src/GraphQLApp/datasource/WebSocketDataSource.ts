import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    FilterValues,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/core";
import ObjectID from "bson-objectid";
import WebSocketClient from "../utils/WebSocketClient";

/**
 * Transforms incoming data from WebSocket to CMS model format.
 * Modify as per your CMS's data structure and requirements.
 */
function transformIncomingData(data: any): any {
    if (data === null || data === undefined) return null;

    if (Array.isArray(data)) {
        return data.map(transformIncomingData).filter(v => v !== undefined);
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};

        // Map MongoDB _id to CMS id
        if (data.id) { // Assuming backend sends 'id'
            result.id = data.id;
        }

        for (const key of Object.keys(data)) {
            if (key !== "id") { // Avoid duplicating id
                const childValue = transformIncomingData(data[key]);
                if (childValue !== undefined) result[key] = childValue;
            }
        }
        return result;
    }

    return data; // Pass through simple data types as is
}

/**
 * Transforms CMS model data to MongoDB-compatible format.
 * Modify as per your CMS's data structure and requirements.
 */
function transformOutgoingData(data: any): any {
    if (data === undefined) return null;
    if (data === null) return null;

    if (Array.isArray(data)) {
        return data.map(transformOutgoingData);
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};

        // Map CMS id to MongoDB _id (if exists)
        if (data.id) {
            result.id = data.id;
        }

        Object.entries(data).forEach(([key, v]) => {
            if (key !== "id") { // Avoid duplicating id to _id
                const gqlModel = transformOutgoingData(v);
                if (gqlModel !== undefined) {
                    result[key] = gqlModel;
                }
            }
        });

        return result;
    }

    return data; // Pass through simple data types as is
}

type SubscriptionUpdate<T> = {
    type: "subscriptionUpdate";
    data: T;
    success: boolean;
    error?: any;
};

type SubscriptionDelete = {
    type: "subscriptionDelete";
    data: { id: string };
    success: boolean;
    error?: any;
};

type SubscriptionMessage<T> = SubscriptionUpdate<T> | SubscriptionDelete;

export class WebSocketDataSource implements DataSourceDelegate {
    key = "websocket";
    private wsClient: WebSocketClient;

    constructor(wsUrl = "ws://localhost:4000") {
        this.wsClient = new WebSocketClient(wsUrl);
    }

    delegateToCMSModel(data: any): any {
        return transformIncomingData(data);
    }

    cmsToDelegateModel(data: any): any {
        return transformOutgoingData(data);
    }

    /**
     * Fetch a single entity by path and entityId.
     */
    async fetchEntity<M extends Record<string, any> = any>({
                                                               path,
                                                               entityId,
                                                               collection
                                                           }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        try {
            const response = await this.wsClient.sendRequest("fetchEntity", {
                path,
                entityId
            });
            return {
                id: response.id,
                path,
                values: this.delegateToCMSModel(response)
            };
        } catch (error: any) {
            console.error("Fetch Entity Error:", error);
            return undefined;
        }
    }

    /**
     * Fetch a collection of entities with optional filtering, sorting, and pagination.
     */
    async fetchCollection<M extends Record<string, any> = any>({
                                                                   path,
                                                                   filter,
                                                                   limit,
                                                                   startAfter,
                                                                   orderBy,
                                                                   order,
                                                                   searchString
                                                               }: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        try {
            const response = await this.wsClient.sendRequest("fetchCollection", {
                path,
                filter,
                limit,
                sort: orderBy ? {
                    field: orderBy,
                    order
                } : undefined,
                startAfter,
                searchString
            });

            return response.map((item: any) => ({
                id: item.id, // Assuming backend sends 'id'
                path,
                values: this.delegateToCMSModel(item)
            }));
        } catch (error: any) {
            console.error("Fetch Collection Error:", error);
            return [];
        }
    }

    /**
     * Save (create or update) an entity.
     */
    async saveEntity<M extends Record<string, any> = any>({
                                                              path,
                                                              entityId,
                                                              values,
                                                              collection,
                                                              status
                                                          }: SaveEntityProps<M>): Promise<Entity<M>> {

        console.log("Save Entity:", path, entityId, values, status);
        try {
            // Prepare the payload
            const payload: any = {
                path,
                values: this.cmsToDelegateModel(values),
                status
            };
            if (entityId) {
                payload.entityId = entityId;
            }

            const response = await this.wsClient.sendRequest("saveEntity", payload);

            return {
                id: response.id,
                path,
                values: this.delegateToCMSModel(response)
            };
        } catch (error: any) {
            console.error("Save Entity Error:", error);
            throw error;
        }
    }

    /**
     * Delete an entity by its path and id.
     */
    async deleteEntity<M extends Record<string, any> = any>({
                                                                entity,
                                                                collection
                                                            }: DeleteEntityProps<M>): Promise<void> {
        try {
            await this.wsClient.sendRequest("deleteEntity", {
                path: entity.path,
                entityId: entity.id
            });
        } catch (error: any) {
            console.error("Delete Entity Error:", error);
            throw error;
        }
    }

    /**
     * Check if a field value is unique within a collection.
     */
    async checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        try {
            const filter: FilterValues<string> = { [name]: ["==", value] };
            if (entityId) {
                // The backend handles exclusion via the 'deleteEntity' handler
            }
            const collectionData = await this.fetchCollection({
                path,
                filter,
                limit: 1
            });
            if (collectionData.length === 0) return true;
            if (entityId) {
                return collectionData[0].id === entityId;
            }
            return false;
        } catch (error: any) {
            console.error("Check Unique Field Error:", error);
            return false;
        }
    }

    /**
     * Generate a unique entity ID.
     */
    generateEntityId(path: string, collection: EntityCollection): string {
        return ObjectID().toHexString();
    }

    /**
     * Normalize Date objects to midnight.
     */
    setDateToMidnight(input?: any): any {
        if (input instanceof Date) {
            input.setHours(0, 0, 0, 0);
            return input;
        }
        return input;
    }

    /**
     * Listen to a collection for real-time updates.
     */
    listenCollection<M extends Record<string, any> = any>({
                                                              path,
                                                              filter,
                                                              limit,
                                                              startAfter,
                                                              searchString,
                                                              orderBy,
                                                              order,
                                                              onUpdate,
                                                              onError,
                                                              collection
                                                          }: ListenCollectionProps<M>): () => void {
        const sort = orderBy ? {
            field: orderBy,
            order
        } : undefined;

        // Initialize a cache for the entities
        const entityCache = new Map<string, Entity<M>>();

        const subscriptionId = this.wsClient.subscribe(
            "listenCollection",
            {
                path,
                filter,
                limit,
                sort,
                startAfter,
                searchString,
                fields: collection?.properties ? Object.keys(collection.properties) : []
            },
            (update: SubscriptionMessage<any>) => {
                console.log("Listen Collection Update:", update);
                if (update.type === "subscriptionUpdate") {
                    if (Array.isArray(update.data)) {
                        // Initial data is an array of entities
                        update.data.forEach((item: any) => {
                            const entity: Entity<M> = {
                                id: item.id,
                                path,
                                values: this.delegateToCMSModel(item)
                            };
                            entityCache.set(entity.id, entity);
                        });
                    } else {
                        // Subsequent updates are single entities
                        const item = update.data;
                        const entity: Entity<M> = {
                            id: item.id,
                            path,
                            values: this.delegateToCMSModel(item)
                        };
                        entityCache.set(entity.id, entity);
                    }
                } else if (update.type === "subscriptionDelete") {
                    const entityId = update.data.id;
                    entityCache.delete(entityId);
                }

                // After processing the update, call onUpdate with the full array of entities
                const entities = Array.from(entityCache.values());

                // Optionally, sort the entities if needed
                if (orderBy) {
                    entities.sort((a, b) => {
                        const aValue = a.values[orderBy];
                        const bValue = b.values[orderBy];
                        if (aValue < bValue) return order === "desc" ? 1 : -1;
                        if (aValue > bValue) return order === "desc" ? -1 : 1;
                        return 0;
                    });
                }

                // Apply limit if specified
                const limitedEntities = limit ? entities.slice(0, limit) : entities;

                onUpdate(limitedEntities);
            }
        );

        return () => {
            this.wsClient.unsubscribe(subscriptionId);
        };
    }

    /**
     * Listen to a single entity for real-time updates.
     */
    listenEntity<M extends Record<string, any> = any>({
                                                          path,
                                                          entityId,
                                                          collection,
                                                          onUpdate,
                                                          onError
                                                      }: ListenEntityProps<M>): () => void {
        const subscriptionId = this.wsClient.subscribe(
            "listenEntity",
            {
                path,
                entityId
            },
            (update: SubscriptionMessage<any>) => {
                console.log("Listen Entity Update:", update);
                if (update.type === "subscriptionUpdate") {
                    if (update.success) {
                        const entity: Entity<M> = {
                            id: update.data.id,
                            path,
                            values: this.delegateToCMSModel(update.data)
                        };
                        onUpdate(entity);
                    } else {
                        console.warn(update.error);
                        const entity: Entity<M> = {
                            id: entityId,
                            path,
                            values: {} as M
                        };
                        onUpdate(entity);
                    }
                } else if (update.type === "subscriptionDelete") {
                    const entityId = update.data.id;
                    // onUpdate(undefined); // or handle as per your logic
                }
            }
        );

        return () => {
            this.wsClient.unsubscribe(subscriptionId);
        };
    }

    initTextSearch() {
        return Promise.resolve(true)
    }
}

