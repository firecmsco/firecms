import { useMemo } from "react";
import {
    DataSource,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps,
    DeleteEntityProps,
    ListenCollectionProps,
    ListenEntityProps
} from "@firecms/core";
import { PostgresDataSourceClient, PostgresDataSourceConfig } from "./postgres_client";

export interface PostgresDataSourceDelegate extends DataSource {
    client: PostgresDataSourceClient;
}

export function usePostgresDataSource(config: PostgresDataSourceConfig): PostgresDataSourceDelegate {
    const client = useMemo(() => new PostgresDataSourceClient(config), [config.baseUrl, config.websocketUrl]);

    const dataSource: PostgresDataSourceDelegate = useMemo(() => ({
        client,

        async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            return client.fetchCollection(props);
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            return client.fetchEntity(props);
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            return client.saveEntity(props);
        },

        async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
            return client.deleteEntity(props);
        },

        async checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean> {
            return client.checkUniqueField(path, name, value, entityId, collection);
        },

        generateEntityId(path: string, collection?: EntityCollection): string {
            // For async ID generation, we'll need to handle this differently
            // For now, generate a simple timestamp-based ID
            return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
            return client.countEntities(props);
        },

        listenCollection<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void {
            return client.listenCollection(
                props,
                (entities: Entity<M>[]) => props.onUpdate(entities),
                props.onError
            );
        },

        listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
            return client.listenEntity(
                props,
                (entity: Entity<M> | null) => {
                    if (entity !== null) {
                        props.onUpdate(entity);
                    } else {
                        // Handle null case - some FireCMS listeners expect only non-null entities
                        // We'll skip the update for null entities to match FireCMS expectations
                    }
                },
                props.onError
            );
        },

        isFilterCombinationValid(): boolean {
            return true; // PostgreSQL supports complex filter combinations
        }
    }), [client]);

    return dataSource;
}

export function createPostgresDataSource(config: PostgresDataSourceConfig): PostgresDataSourceDelegate {
    const client = new PostgresDataSourceClient(config);

    return {
        client,

        async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            return client.fetchCollection(props);
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            return client.fetchEntity(props);
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            return client.saveEntity(props);
        },

        async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
            return client.deleteEntity(props);
        },

        async checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean> {
            return client.checkUniqueField(path, name, value, entityId, collection);
        },

        generateEntityId(path: string, collection?: EntityCollection): string {
            return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
            return client.countEntities(props);
        },

        listenCollection<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void {
            return client.listenCollection(
                props,
                (entities: Entity<M>[]) => props.onUpdate(entities),
                props.onError
            );
        },

        listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
            return client.listenEntity(
                props,
                (entity: Entity<M> | null) => {
                    if (entity !== null) {
                        props.onUpdate(entity);
                    } else {
                        // Handle null case - some FireCMS listeners expect only non-null entities
                        // We'll skip the update for null entities to match FireCMS expectations
                    }
                },
                props.onError
            );
        },

        isFilterCombinationValid(): boolean {
            return true;
        }
    };
}
