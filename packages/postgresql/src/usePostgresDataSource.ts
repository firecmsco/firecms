import { useMemo } from "react";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
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

function recursivelyMap(
    data: any,
    mapFn: (value: any) => any
): any {
    if (Array.isArray(data)) {
        return data.map((item: any) => recursivelyMap(item, mapFn));
    } else if (data && typeof data === "object") {
        const result: Record<string, any> = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = recursivelyMap(data[key], mapFn);
            }
        }
        return mapFn(result);
    }
    return mapFn(data);
}

function delegateToCMSModel(data: any): any {
    return recursivelyMap(data, (value) => {
        if (value && value.__type === "date" && value.value) {
            const date = new Date(value.value);
            return isNaN(date.getTime()) ? null : date;
        }
        if (value && value.__type === "reference" && value.id !== undefined && value.path !== undefined) {
            return new EntityReference(value.id, value.path);
        }
        return value;
    });
}

function cmsToDelegateModel(data: any): any {
    return recursivelyMap(data, (value) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (value instanceof EntityReference) {
            return {
                id: value.id,
                path: value.path,
                __type: "reference"
            };
        }
        return value;
    });
}

export function usePostgresDataSource(config: PostgresDataSourceConfig): PostgresDataSourceDelegate {
    const client = useMemo(() => new PostgresDataSourceClient(config), [config.websocketUrl]);

    return useMemo(() => ({

        key: "postgres",

        name: "PostgreSQL",

        client,

        delegateToCMSModel: (data: any) => {
            console.log("Mapping data from delegate to CMS model:", data);
            return delegateToCMSModel(data);
        },

        cmsToDelegateModel: (data: any) => {
            console.log("Mapping data from CMS to delegate model:", data);
            return cmsToDelegateModel(data);
        },

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
            const entities = await client.fetchCollection(cleanProps);
            return entities.map(e => ({
                ...e,
                values: delegateToCMSModel(e.values)
            }));
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            const entity = await client.fetchEntity(cleanProps);
            if (!entity) return undefined;
            return {
                ...entity,
                values: delegateToCMSModel(entity.values)
            };
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            // Strip out navigationController and any other unnecessary props before sending to client
            const {
                navigationController,
                collection,
                ...cleanProps
            } = props as any;
            const entity = await client.saveEntity(cleanProps);
            return {
                ...entity,
                values: delegateToCMSModel(entity.values)
            };
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
                (entities: Entity<M>[]) => props.onUpdate(entities.map(e => ({
                    ...e,
                    values: delegateToCMSModel(e.values)
                }))),
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
                        props.onUpdate({
                            ...entity,
                            values: delegateToCMSModel(entity.values)
                        });
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

}
