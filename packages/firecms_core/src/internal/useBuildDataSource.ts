import { useCallback } from "react";
import {
    AuthController,
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
                                       navigationController,
                                       authController
                                   }: {
    delegate: DataSourceDelegate,
    propertyConfigs?: Record<string, PropertyConfig>;
    navigationController: NavigationController;
    authController: AuthController;
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
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.fetchCollection<M>({
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
                const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;

                if (!usedDelegate.listenCollection)
                    throw Error("useBuildDataSource delegate not initialised");

                return usedDelegate.listenCollection<M>({
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
        ): Promise<Entity<M> | undefined> => {
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.fetchEntity({
                path,
                entityId,
                collection
            });
        }, [delegate.fetchEntity]),

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
                const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;

                if (!usedDelegate.listenEntity)
                    throw Error("useBuildDataSource delegate not initialised");

                return usedDelegate.listenEntity<M>({
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
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;

            const resolvedCollection = collection
                ? resolveCollection<M>({
                    collection,
                    path,
                    entityId,
                    propertyConfigs: propertyConfigs,
                    authController
                })
                : undefined;

            const properties: ResolvedProperties<M> | undefined = resolvedCollection?.properties;

            const delegateValues = usedDelegate.cmsToDelegateModel(
                values,
            );

            const updatedValues: EntityValues<M> = properties
                ? updateDateAutoValues(
                    {
                        inputValues: delegateValues,
                        properties,
                        status,
                        timestampNowValue: usedDelegate.currentTime?.() ?? new Date(),
                        setDateToMidnight: usedDelegate.setDateToMidnight
                    })
                : delegateValues;

            return usedDelegate.saveEntity({
                path,
                collection,
                entityId,
                values: updatedValues,
                status
            }).then((res) => {
                return {
                    id: res.id,
                    path: res.path,
                    values: usedDelegate.delegateToCMSModel(updatedValues)
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
                entity,
                collection
            }: DeleteEntityProps<M>
        ): Promise<void> => {
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.deleteEntity({
                entity,
                collection
            });
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
            entityId?: string | number,
            collection?: EntityCollection
        ): Promise<boolean> => {
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.checkUniqueField(path, name, value, entityId, collection);
        }, [delegate.checkUniqueField]),

        generateEntityId: useCallback((path: string, collection: EntityCollection): string => {
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.generateEntityId(path, collection);
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
            const usedDelegate = collection?.overrides?.dataSourceDelegate ?? delegate;
            return usedDelegate.countEntities!({
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
            const usedDelegate = props.collection?.overrides?.dataSourceDelegate ?? delegate;
            if (!usedDelegate.initTextSearch)
                return false;
            return usedDelegate.initTextSearch(props)
        }, [delegate.initTextSearch]),

    };

}
