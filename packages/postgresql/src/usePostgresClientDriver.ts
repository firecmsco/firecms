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
    TableColumnInfo
} from "@rebasepro/types";
import { RebaseWebSocketClient } from "@rebasepro/client";

export interface PostgresDataDriverConfig {
    wsClient?: RebaseWebSocketClient;
}

export interface PostgresDataDriver extends DataDriver {
    client?: RebaseWebSocketClient;
}

function recursivelyMap(
    data: any,
    mapFn: (value: any) => any
): any {
    if (Array.isArray(data)) {
        return data.map((item: any) => recursivelyMap(item, mapFn));
    } else if (data && data instanceof EntityReference) {
        return mapFn(data);
    } else if (data && data instanceof Date) {
        return mapFn(data);
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
            return new EntityReference({ id: value.id, path: value.path });
        }
        if (value && value.__type === "relation" && value.id !== undefined && value.path !== undefined) {
            return new EntityRelation(value.id, value.path);
        }
        return value;
    });
}

function cmsToDelegateModel(data: any): any {
    return recursivelyMap(data, (value) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (value instanceof EntityRelation) {
            return {
                id: value.id,
                path: value.path,
                __type: "relation"
            };
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
            const entities = await client.fetchCollection({ path, filter, limit, startAfter, orderBy, searchString, order });
            return entities.map((e: Entity<any>) => ({
                ...e,
                values: delegateToCMSModel(e.values)
            }));
        },

        async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            const { path, entityId, databaseId } = props;
            const entity = await client.fetchEntity({ path, entityId, databaseId });
            if (!entity) return undefined;
            return {
                ...entity,
                values: delegateToCMSModel(entity.values)
            };
        },

        async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
            const updatedValues = cmsToDelegateModel(props.values);
            console.log("Saving entity", props.path, props.values, updatedValues);
            const entity = await client.saveEntity({
                path: props.path,
                values: updatedValues,
                entityId: props.entityId,
                previousValues: props.previousValues,
                status: props.status
            });
            return {
                ...entity,
                values: delegateToCMSModel(entity.values)
            };
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
                (entities: Entity[]) => props.onUpdate(entities.map(e => ({
                    ...e,
                    values: delegateToCMSModel(e.values)
                }))),
                props.onError
            );
        },

        listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
            const { path, entityId, databaseId, onUpdate, onError } = props;
            return client.listenEntity(
                { path, entityId, databaseId },
                (entity: Entity | null) => {
                    if (entity !== null) {
                        props.onUpdate({
                            ...entity,
                            values: delegateToCMSModel(entity.values)
                        });
                    } else {
                        // Handle null case - some Rebase listeners expect only non-null entities
                        // We'll skip the update for null entities to match Rebase expectations
                    }
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

        async fetchTableColumns(tableName: string): Promise<TableColumnInfo[]> {
            return client.fetchTableColumns(tableName);
        }
    } as PostgresDataDriver;
    }, [client]);

}
