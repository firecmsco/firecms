import { useCallback } from "react";
import {
    AuthController,
    DataDriver,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityValues,
    FetchCollectionProps,
    FetchEntityProps,
    FilterValues,
    RebaseContext,
    ListenCollectionProps,
    ListenEntityProps,
    CollectionRegistryController,
    Properties,
    PropertyConfig,
    SaveEntityProps
} from "@rebasepro/types";
import { updateDateAutoValues } from "@rebasepro/common";

/**
 * Use this hook to build a {@link DataDriver} based on Firestore
 * @param firebaseApp
 * @group Firebase
 */
export function useBuildDataDriver({
    delegate,
    propertyConfigs,
    collectionRegistryController,
    authController
}: {
    delegate: DataDriver,
    propertyConfigs?: Record<string, PropertyConfig>;
    collectionRegistryController: CollectionRegistryController;
    authController: AuthController;
}): DataDriver {

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
            const usedDelegate = collection?.overrides?.driver ?? delegate;
            return usedDelegate.fetchCollection<M>({
                path,
                filter,
                limit,
                startAfter,
                searchString,
                orderBy,
                order,
                collection,
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

                const collection = collectionProp ?? collectionRegistryController.getCollection(path);
                const usedDelegate = collection?.overrides?.driver ?? delegate;

                if (!usedDelegate.listenCollection)
                    throw Error("useBuildDataDriver delegate not initialised");

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
            }, [delegate, collectionRegistryController.getCollection, collectionRegistryController])
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
            const usedDelegate = collection?.overrides?.driver ?? delegate;
            return usedDelegate.fetchEntity({
                path,
                entityId,
                collection,
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
                const usedDelegate = collection?.overrides?.driver ?? delegate;

                if (!usedDelegate.listenEntity)
                    throw Error("useBuildDataDriver delegate not initialised");

                return usedDelegate.listenEntity<M>({
                    path,
                    entityId,
                    onUpdate,
                    onError,
                    collection,
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
        saveEntity: useCallback(async <M extends Record<string, any>>(
            {
                path,
                entityId,
                values,
                collection: collectionProp,
                status
            }: SaveEntityProps<M>): Promise<Entity<M>> => {

            const collection = collectionProp ?? collectionRegistryController.getCollection(path);
            const usedDelegate = collection?.overrides?.driver ?? delegate;

            const properties: Properties | undefined = collection?.properties;

            const updatedValues: Partial<EntityValues<M>> = properties
                ? updateDateAutoValues(
                    {
                        inputValues: values,
                        properties,
                        status,
                        timestampNowValue: usedDelegate.currentTime?.() ?? new Date()
                    })
                : values;

            // Auto-assign order property value for new/copy entities
            let finalValues = updatedValues;
            const orderProperty = collection?.orderProperty;
            if (orderProperty && (status === "new" || status === "copy")) {
                const orderProp = properties?.[orderProperty as string];
                if (orderProp) {
                    const currentValue = updatedValues[orderProperty as keyof M];
                    if (currentValue === undefined || currentValue === null) {
                        try {
                            const entities = await usedDelegate.fetchCollection({
                                path,
                                orderBy: orderProperty,
                                order: "asc",
                                limit: 1,
                                collection
                            });
                            const minOrder = entities.length > 0
                                ? entities[0].values?.[orderProperty] ?? null
                                : null;
                            finalValues = {
                                ...updatedValues,
                                [orderProperty]: minOrder !== null ? minOrder - 1 : 0
                            } as EntityValues<M>;
                        } catch (e) {
                            console.error("Failed to fetch min order value:", e);
                            // Fallback to 0 if query fails
                            finalValues = {
                                ...updatedValues,
                                [orderProperty]: 0
                            } as EntityValues<M>;
                        }
                    }
                }
            }

            return usedDelegate.saveEntity({
                path,
                collection,
                entityId,
                values: finalValues,
                status,
            });
        }, [delegate.saveEntity, delegate.currentTime, delegate.fetchCollection, collectionRegistryController.getCollection]),

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
            const usedDelegate = collection?.overrides?.driver ?? delegate;
            return usedDelegate.deleteEntity({
                entity,
                collection,
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
            const usedDelegate = collection?.overrides?.driver ?? delegate;
            return usedDelegate.checkUniqueField(path, name, value, entityId, collection);
        }, [delegate.checkUniqueField]),


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
            const usedDelegate = collection?.overrides?.driver ?? delegate;
            return usedDelegate.countEntities!({
                path,
                filter,
                orderBy,
                order,
                collection,
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
                    sortBy,
                }
            )
        }, [delegate.isFilterCombinationValid]),

        initTextSearch: useCallback(async (props: {
            context: RebaseContext,
            path: string,
            collection: EntityCollection,
            parentCollectionIds?: string[]
        }): Promise<boolean> => {
            const usedDelegate = props.collection?.overrides?.driver ?? delegate;
            if (!usedDelegate.initTextSearch)
                return false;
            return usedDelegate.initTextSearch(props)
        }, [delegate.initTextSearch]),

        needsInitTextSearch: Boolean(delegate.initTextSearch),

        executeSql: delegate.executeSql ? (sql: string, options?: any) => {
            return delegate.executeSql!(sql, options);
        } : undefined,

        fetchAvailableDatabases: delegate.fetchAvailableDatabases ? () => {
            return delegate.fetchAvailableDatabases!();
        } : undefined,

        fetchAvailableRoles: delegate.fetchAvailableRoles ? () => {
            return delegate.fetchAvailableRoles!();
        } : undefined,

    };

}
