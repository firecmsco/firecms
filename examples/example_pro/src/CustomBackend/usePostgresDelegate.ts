import { useCallback, useEffect, useRef } from "react";
import { PostgresDataSourceClient } from "./postgres_client";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
    FetchCollectionProps,
    FetchEntityProps,
    FilterCombinationValidProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/core";

export interface PostgresDataSourceProps {
    baseUrl: string;
    websocketUrl?: string;
    headers?: Record<string, string>;
}

export interface PostgresDelegate extends DataSourceDelegate {
    client: PostgresDataSourceClient;
}

/**
 * Use this hook to build a DataSourceDelegate based on PostgreSQL
 * This is a drop-in replacement for useFirestoreDelegate
 */
export function usePostgresDelegate({
                                        baseUrl,
                                        websocketUrl,
                                        headers
                                    }: PostgresDataSourceProps): PostgresDelegate {

    const clientRef = useRef<PostgresDataSourceClient>();

    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = new PostgresDataSourceClient({
                baseUrl,
                websocketUrl,
                headers
            });
        }
    }, [baseUrl, websocketUrl, headers]);

    const client = clientRef.current!;

    return {
        key: "postgres",
        initialised: true,
        client,

        // Required methods matching FireCMS DataSourceDelegate interface
        fetchCollection: useCallback(async <M extends Record<string, any>>({
                                                                               path,
                                                                               filter,
                                                                               limit,
                                                                               startAfter,
                                                                               searchString,
                                                                               orderBy,
                                                                               order,
                                                                               collection
                                                                           }: FetchCollectionProps<M>): Promise<Entity<M>[]> => {
            return client.fetchCollection({
                path,
                collection,
                filter,
                limit,
                startAfter,
                orderBy,
                searchString,
                order
            });
        }, [client]),

        listenCollection: useCallback(<M extends Record<string, any>>({
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
                                                                      }: ListenCollectionProps<M>): () => void => {
            return client.listenCollection(
                {
                    path,
                    collection,
                    filter,
                    limit,
                    startAfter,
                    orderBy,
                    searchString,
                    order
                },
                (data) => onUpdate(data.map(delegateToCMSModel)),
                onError
            );
        }, [client]),

        fetchEntity: useCallback(async <M extends Record<string, any>>({
                                                                           path,
                                                                           entityId,
                                                                           collection
                                                                       }: FetchEntityProps<M>): Promise<Entity<M> | undefined> => {
            return client.fetchEntity({
                path,
                entityId,
                collection
            });
        }, [client]),

        listenEntity: useCallback(<M extends Record<string, any>>({
                                                                      path,
                                                                      entityId,
                                                                      onUpdate,
                                                                      onError,
                                                                      collection
                                                                  }: ListenEntityProps<M>): () => void => {
            return client.listenEntity(
                {
                    path,
                    entityId,
                    collection
                },
                (entity) => entity && onUpdate(entity),
                onError
            );
        }, [client]),

        saveEntity: useCallback(async <M extends Record<string, any>>({
                                                                          path,
                                                                          entityId,
                                                                          values,
                                                                          collection,
                                                                          status
                                                                      }: SaveEntityProps<M>): Promise<Entity<M>> => {
            return client.saveEntity({
                path,
                entityId,
                values,
                collection,
                status
            });
        }, [client]),

        deleteEntity: useCallback(async <M extends Record<string, any>>({
                                                                            entity,
                                                                            collection
                                                                        }: DeleteEntityProps<M>): Promise<void> => {
            return client.deleteEntity({
                entity,
                collection
            });
        }, [client]),

        checkUniqueField: useCallback(async (
            path: string,
            name: string,
            value: any,
            entityId?: string,
            collection?: EntityCollection
        ): Promise<boolean> => {
            return client.checkUniqueField(path, name, value, entityId, collection);
        }, [client]),

        countEntities: useCallback(async <M extends Record<string, any>>(
            props: FetchCollectionProps<M>
        ): Promise<number> => {
            return client.countEntities(props);
        }, [client]),

        isFilterCombinationValid: useCallback((props: FilterCombinationValidProps) => {
            return true;
        }, []),

        currentTime: useCallback(() => new Date(), []),

        // Data transformation methods
        delegateToCMSModel: useCallback((data: any) => {
            return delegateToCMSModel(data);
        }, []),

        cmsToDelegateModel: useCallback((data: any) => {
            return cmsToDelegateModel(data);
        }, []),

        setDateToMidnight: useCallback((input?: Date): Date | undefined => {
            if (!input) return input;
            const date = new Date(input);
            date.setHours(0, 0, 0, 0);
            return date;
        }, []),

        initTextSearch: useCallback(async (): Promise<boolean> => {
            // Text search is always available with PostgreSQL JSONB
            return true;
        }, [])
    };
}

// Helper functions for recursive data transformation
function delegateToCMSModel(data: any): any {
    if (data === null || data === undefined) return data;

    if (data instanceof Date) return data;

    // Check if this is a reference object that should be converted to EntityReference
    if (typeof data === "object" &&
        !Array.isArray(data) &&
        Object.prototype.hasOwnProperty.call(data, "id") &&
        Object.prototype.hasOwnProperty.call(data, "path") &&
        Object.prototype.hasOwnProperty.call(data, "type") &&
        data.type === "reference" &&
        typeof data.id !== "undefined" &&
        typeof data.path === "string") {
        // Convert reference object to EntityReference instance
        return new EntityReference(data.id, data.path);
    }

    if (Array.isArray(data)) {
        return data.map(item => delegateToCMSModel(item));
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = delegateToCMSModel(value);
        }
        return result;
    }

    return data;
}

function cmsToDelegateModel(data: any): any {
    if (data === undefined) return null;
    if (data === null) return data;

    if (data instanceof Date) return data;

    // Convert EntityReference instances back to reference objects for the backend
    if (data instanceof EntityReference) {
        return {
            id: data.id,
            path: data.path,
            type: "reference"
        };
    }

    if (Array.isArray(data)) {
        return data.map(item => cmsToDelegateModel(item));
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            const converted = cmsToDelegateModel(value);
            if (converted !== null) {
                result[key] = converted;
            }
        }
        return result;
    }

    return data;
}
