import { useMemo } from "react";
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
import { PostgresDataSourceClient, PostgresDataSourceConfig } from "./postgres_client";

export interface PostgresDataSourceDelegate extends DataSourceDelegate {
    client: PostgresDataSourceClient;
}

export function usePostgresDataSource(config: PostgresDataSourceConfig): PostgresDataSourceDelegate {
    const client = useMemo(() => new PostgresDataSourceClient(config), [config.baseUrl, config.websocketUrl]);

    const dataSource: PostgresDataSourceDelegate = useMemo(() => ({

        key: "postgres",

        name: "PostgreSQL",

        client,

        delegateToCMSModel: (data: any) => data,

        cmsToDelegateModel: (data: any) => data,

        setDateToMidnight: (date: Date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        },

        async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.fetchCollection(cleanProps);
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.fetchEntity(cleanProps);
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.saveEntity(cleanProps);
        },

        async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.deleteEntity(cleanProps);
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
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.countEntities(cleanProps);
        },

        listenCollection<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.listenCollection(
                cleanProps,
                (entities: Entity<M>[]) => props.onUpdate(entities),
                props.onError
            );
        },

        listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            return client.listenEntity(
                cleanProps,
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
