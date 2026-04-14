import { useMemo, useEffect } from "react";
import {
    DataDriver,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference, EntityRelation,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps,
    TableMetadata
} from "@rebasepro/types";
import { RebaseWebSocketClient } from "@rebasepro/client";

export interface PostgresDataDriverConfig {
    wsClient?: RebaseWebSocketClient;
}

export interface PostgresDataDriver extends DataDriver {
    client?: RebaseWebSocketClient;
}


export function usePostgresClientDriver(config: PostgresDataDriverConfig): PostgresDataDriver {
    const client = config.wsClient;

    return useMemo(() => {
        if (!client) throw new Error("RebaseWebSocketClient must be provided in config.wsClient");
        
        return {

        key: "postgres",

        name: "PostgreSQL",

        client,

        async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            // Pick only the fields the client needs, ignoring extra fields from the CMS layer
            const { path, filter, limit, startAfter, orderBy, searchString, order } = props;
            return client.fetchCollection({ path, filter, limit, startAfter, orderBy, searchString, order }) as Promise<Entity<M>[]>;
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            const { path, entityId, databaseId } = props;
            return client.fetchEntity({ path, entityId, databaseId }) as Promise<Entity<M> | undefined>;
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            return client.saveEntity({
                path: props.path,
                values: props.values,
                entityId: props.entityId,
                previousValues: props.previousValues,
                status: props.status
            }) as Promise<Entity<M>>;
        },

        async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
            const { entity } = props;
            return client.deleteEntity({ entity });
        },

        async checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean> {
            return client.checkUniqueField(path, name, value, entityId, collection);
        },

        async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
            const { path, filter, limit, startAfter, orderBy, searchString, order } = props;
            return client.countEntities({ path, filter, limit, startAfter, orderBy, searchString, order });
        },

        listenCollection<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void {
            const { path, filter, limit, startAfter, orderBy, searchString, order, onUpdate, onError } = props;
            return client.listenCollection(
                { path, filter, limit, startAfter, orderBy, searchString, order },
                (entities: Entity[]) => props.onUpdate(entities as Entity<M>[]),
                props.onError
            );
        },

        listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
            const { path, entityId, databaseId, onUpdate, onError } = props;
            return client.listenEntity(
                { path, entityId, databaseId },
                (entity: Entity | null) => {
                    props.onUpdate(entity as Entity<M> | null);
                },
                props.onError
            );
        },

        isFilterCombinationValid(): boolean {
            return true; // PostgreSQL supports complex filter combinations
        },

        async executeSql(sql: string, options?: { database?: string, role?: string }): Promise<any[]> {
            return client.executeSql(sql, options);
        },

        async fetchAvailableDatabases(): Promise<string[]> {
            return client.fetchAvailableDatabases();
        },

        async fetchAvailableRoles(): Promise<string[]> {
            return client.fetchAvailableRoles();
        },

        async fetchCurrentDatabase(): Promise<string | undefined> {
            return client.fetchCurrentDatabase();
        },

        async fetchUnmappedTables(mappedPaths?: string[]): Promise<string[]> {
            return client.fetchUnmappedTables(mappedPaths);
        },

        async fetchTableMetadata(tableName: string): Promise<TableMetadata> {
            return client.fetchTableMetadata(tableName);
        }
    } as PostgresDataDriver;
    }, [client]);

}
