import {
    DataSource, DataSourceDelegate,
    DeleteEntityProps,
    Entity, EntityReference,
    FetchCollectionProps,
    FetchEntityProps, GeoPoint,
    ResolvedProperty,
    SaveEntityProps
} from "@firecms/core";

export function useBuildMockDataSourceDelegate(): DataSourceDelegate {
    return {
        buildDate(date: Date): any {
        }, buildDeleteFieldValue(): any {
        }, buildGeoPoint(geoPoint: GeoPoint): any {
        }, buildReference(reference: EntityReference): any {
        }, delegateToCMSModel(data: any): any {
        }, setDateToMidnight(input: any): any {
        }, currentTime(): any {
        },
        checkUniqueField(path: string, name: string, value: any, entityId?: string): Promise<boolean> {
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

        generateEntityId(path: string): string {
            return "mock_id_" + Math.floor(Math.random() * 10000);
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
