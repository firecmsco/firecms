import {
    DataSource,
    DeleteEntityProps,
    Entity,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps
} from "@rebasepro/core";

export function useBuildMockDataSource(): DataSource {
    return {
        checkUniqueField(path: string, name: string, value: any, entityId?: string | number): Promise<boolean> {
            return Promise.resolve(false);
        },

        countEntities: (props: FetchCollectionProps<any>): Promise<number> => Promise.resolve(0),

        deleteEntity({
            entity
        }: DeleteEntityProps<any>): Promise<void> {
            return Promise.resolve(undefined);
        },

        fetchCollection({
            path,
            collection,
            filter,
            limit,
            startAfter,
            orderBy,
            order,
            searchString
        }: FetchCollectionProps<any>): Promise<Entity<any>[]> {
            return Promise.resolve([]);
        },

        fetchEntity({
            path,
            entityId,
            collection
        }: FetchEntityProps<any>): Promise<Entity<any> | undefined> {
            return Promise.resolve(undefined);
        },

        saveEntity({
            path,
            entityId,
            values,
            collection,
            status
        }: SaveEntityProps<any>): Promise<Entity<any>> {
            throw new Error("Function not implemented.");
        }
    };
}
