import { useCallback } from "react";
import {
    DataSource,
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityValues,
    FetchCollectionProps,
    FetchEntityProps,
    FilterValues,
    FireCMSContext,
    ListenCollectionProps,
    ListenEntityProps,
    NavigationController,
    PropertyConfig,
    ResolvedProperties,
    SaveEntityProps
} from "../types";
import { resolveCollection, updateDateAutoValues } from "../util";

/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 * @group Firebase
 */
export function useBuildDataSource({
                                       delegate,
                                       propertyConfigs,
                                       navigationController
                                   }: {
    delegate: DataSourceDelegate,
    propertyConfigs?: Record<string, PropertyConfig>;
    navigationController: NavigationController;
}): DataSource {

    return {

        /**
         * Fetch entities in a Firestore path
         * @param path
         * @param collection
         * @param filter
         * @param limit
         * @param startAfter
         * @param searchString
         * @param orderBy
         * @param order
         * @return Function to cancel subscription
         * @see useCollectionFetch if you need this functionality implemented as a hook
         * @group Firestore
         */
        fetchCollection: useCallback(<M extends Record<string, any>>({
                                                                         path,
                                                                         collection,
                                                                         filter,
                                                                         limit,
                                                                         startAfter,
                                                                         searchString,
                                                                         orderBy,
                                                                         order,
                                                                     }: FetchCollectionProps<M>
        ): Promise<Entity<M>[]> => {
            return delegate.fetchCollection<M>({
                path,
                filter,
                limit,
                startAfter,
                searchString,
                orderBy,
                order,
                collection
            });
        }, [delegate]),

        /**
         * Listen to a entities in a given path
         * @param path
         * @param collection
         * @param onError
         * @param filter
         * @param limit
         * @param startAfter
         * @param searchString
         * @param orderBy
         * @param order
         * @param onUpdate
         * @return Function to cancel subscription
         * @see useCollectionFetch if you need this functionality implemented as a hook
         * @group Firestore
         */
        listenCollection: delegate.listenCollection
            ? useCallback(<M extends Record<string, any>>(
                {
                    path,
                    collection: collectionProp,
                    filter,
                    limit,
                    startAfter,
                    searchString,
                    orderBy,
                    order,
                    onUpdate,
                    onError
                }: ListenCollectionProps<M>
            ): () => void => {

                const collection = collectionProp ?? navigationController.getCollection(path);
                const isCollectionGroup = Boolean(collection?.collectionGroup);
                if (!delegate.listenCollection)
                    throw Error("useBuildDataSource delegate not initialised");

                return delegate.listenCollection<M>({
                    path,
                    filter,
                    limit,
                    startAfter,
                    searchString,
                    orderBy,
                    order,
                    onUpdate,
                    onError,
                    collection,
                });
            }, [delegate, navigationController.getCollection])
            : undefined,

        /**
         * Retrieve an entity given a path and a collection
         * @param path
         * @param entityId
         * @param collection
         * @group Firestore
         */
        fetchEntity: useCallback(<M extends Record<string, any>>({
                                                                     path,
                                                                     entityId,
                                                                     collection
                                                                 }: FetchEntityProps<M>
        ): Promise<Entity<M> | undefined> => delegate.fetchEntity({
            path,
            entityId,
            collection
        }), [delegate]),

        /**
         *
         * @param path
         * @param entityId
         * @param collection
         * @param onUpdate
         * @param onError
         * @return Function to cancel subscription
         * @group Firestore
         */
        listenEntity: delegate.listenEntity
            ? useCallback(<M extends Record<string, any>>(
                {
                    path,
                    entityId,
                    collection,
                    onUpdate,
                    onError
                }: ListenEntityProps<M>): () => void => {
                if (!delegate.listenEntity)
                    throw Error("useBuildDataSource delegate not initialised");

                return delegate.listenEntity<M>({
                    path,
                    entityId,
                    onUpdate,
                    onError,
                    collection
                })
            }, [delegate.listenEntity]) : undefined,

        /**
         * Save entity to the specified path. Note that Firestore does not allow
         * undefined values.
         * @param path
         * @param entityId
         * @param values
         * @param schemaId
         * @param collection
         * @param status
         * @group Firestore
         */
        saveEntity: useCallback(<M extends Record<string, any>>(
            {
                path,
                entityId,
                values,
                collection: collectionProp,
                status
            }: SaveEntityProps<M>): Promise<Entity<M>> => {

            const collection = collectionProp ?? navigationController.getCollection(path);

            console.log("useBuildDatasource save", {
                path,
                entityId,
                values,
                collectionProp,
                collection,
                status
            });

            const resolvedCollection = collection
                ? resolveCollection<M>({
                    collection,
                    path,
                    entityId,
                    fields: propertyConfigs
                })
                : undefined;

            const properties: ResolvedProperties<M> | undefined = resolvedCollection?.properties;

            const firestoreValues = delegate.cmsToDelegateModel(
                values,
            );

            const updatedFirestoreValues: EntityValues<M> = properties
                ? updateDateAutoValues(
                    {
                        inputValues: firestoreValues,
                        properties,
                        status,
                        timestampNowValue: delegate.currentTime?.() ?? new Date(),
                        setDateToMidnight: delegate.setDateToMidnight
                    })
                : firestoreValues;

            return delegate.saveEntity({
                path,
                collection,
                entityId,
                values: updatedFirestoreValues,
                status
            }).then((res) => {
                return {
                    id: res.id,
                    path: res.path,
                    values: delegate.delegateToCMSModel(updatedFirestoreValues)
                } as Entity<M>;
            });
        }, [delegate.saveEntity, navigationController.getCollection]),

        /**
         * Delete an entity
         * @param entity
         * @param collection
         * @group Firestore
         */
        deleteEntity: useCallback(<M extends Record<string, any>>(
            {
                entity
            }: DeleteEntityProps<M>
        ): Promise<void> => {
            return delegate.deleteEntity({ entity });
        }, [delegate.deleteEntity]),

        /**
         * Check if the given property is unique in the given collection
         * @param path Collection path
         * @param name of the property
         * @param value
         * @param property
         * @param entityId
         * @return `true` if there are no other fields besides the given entity
         * @group Firestore
         */
        checkUniqueField: useCallback((
            path: string,
            name: string,
            value: any,
            entityId?: string,
            databaseId?: string
        ): Promise<boolean> => {
            return delegate.checkUniqueField(path, name, value, entityId, databaseId);
        }, [delegate.checkUniqueField]),

        generateEntityId: useCallback((path: string): string => {
            return delegate.generateEntityId(path,);
        }, [delegate.generateEntityId]),

        countEntities: delegate.countEntities ? async ({
                                                           path,
                                                           collection,
                                                           filter,
                                                           order,
                                                           orderBy
                                                       }: {
            path: string,
            collection: EntityCollection<any>,
            filter?: FilterValues<Extract<keyof any, string>>,
            orderBy?: string,
            order?: "desc" | "asc",
        }): Promise<number> => {
            return delegate.countEntities!({
                path,
                filter,
                orderBy,
                order,
                collection
            });
        } : undefined,

        isFilterCombinationValid: useCallback(({
                                                   path,
                                                   databaseId,
                                                   filterValues,
                                                   sortBy
                                               }: {
            path: string,
            databaseId?: string,
            filterValues: FilterValues<any>,
            sortBy?: [string, "asc" | "desc"]
        }): boolean => {
            if (!delegate.isFilterCombinationValid)
                return true;
            return delegate.isFilterCombinationValid(
                {
                    path,
                    databaseId,
                    filterValues,
                    sortBy
                }
            )
        }, [delegate.isFilterCombinationValid]),

        initTextSearch: useCallback(async (props: {
            context: FireCMSContext,
            path: string,
            collection: EntityCollection,
            parentCollectionIds?: string[]
        }): Promise<boolean> => {
            if (!delegate.initTextSearch)
                return false;
            return delegate.initTextSearch(props)
        }, [delegate.initTextSearch]),

    };

}

// /**
//  * Recursive function that converts Firestore data types into CMS or plain
//  * JS types.
//  * FireCMS uses Javascript dates internally instead of Firestore timestamps.
//  * This makes it easier to interact with the rest of the libraries and
//  * bindings.
//  * Also, Firestore references are replaced with {@link EntityReference}
//  * @param data
//  * @param buildReference
//  * @param buildGeoPoint
//  * @param buildDate
//  * @param buildDelete
//  * @group Firestore
//  */
// export function cmsToDelegateModel(data: any,
//                                    buildReference: (reference: EntityReference) => any,
//                                    buildGeoPoint: (geoPoint: GeoPoint) => any,
//                                    buildDate: (date: Date) => any,
//                                    buildDelete: () => any
// ): any {
//     if (data === undefined) {
//         return buildDelete();
//     } else if (data === null) {
//         return null;
//     } else if (Array.isArray(data)) {
//         return data.map(v => cmsToDelegateModel(v, buildReference, buildGeoPoint, buildDate, buildDelete));
//     } else if (data.isEntityReference && data.isEntityReference()) {
//         return buildReference(data);
//     } else if (data instanceof GeoPoint) {
//         return buildGeoPoint(data);
//     } else if (data instanceof Date) {
//         return buildDate(data);
//     } else if (data && typeof data === "object") {
//         return Object.entries(data)
//             .map(([key, v]) => ({ [key]: cmsToDelegateModel(v, buildReference, buildGeoPoint, buildDate, buildDelete) }))
//             .reduce((a, b) => ({ ...a, ...b }), {});
//     }
//     return data;
// }
