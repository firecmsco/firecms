import React, { useCallback, useEffect, useMemo } from "react";
import { FirebaseApp } from "@firebase/app";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, runTransaction } from "@firebase/firestore";
import {
    CollectionsConfigController,
    DeleteCollectionParams,
    namespaceToPropertiesPath,
    PersistedCollection,
    SaveCollectionParams,
    UpdateCollectionParams
} from "@firecms/collection_editor";
import {
    applyPermissionsFunctionIfEmpty,
    NavigationGroupMapping,
    PermissionsBuilder,
    Property,
    PropertyConfig,
    removeFunctions,
    removeInitialAndTrailingSlashes,
    removeUndefined,
    User
} from "@firecms/core";
import {
    buildCollectionId,
    docsToCollectionTree,
    prepareCollectionForPersistence,
    setUndefinedToDelete
} from "@firecms/firebase";

/**
 * @group Firebase
 */
export interface CollectionConfigControllerProps<EC extends PersistedCollection, USER extends User = User> {

    firebaseApp?: FirebaseApp;

    /**
     * Path where the configuration is stored.
     * This must be a 2 segment path, like `__FIRECMS/config/`.
     * Defaults to `__FIRECMS/config/`
     */
    generalConfigPath?: string;

    /**
     * Path where the collections configuration is stored.
     * This must be a 3 segment path, like `__FIRECMS/config/collections`.
     * Defaults to `__FIRECMS/config/collections`
     */
    configPath?: string;

    /**
     * Define what actions can be performed on data.
     */
    permissions?: PermissionsBuilder<EC, USER>;

    /**
     * If you are defining custom properties, you can pass them here.
     */
    propertyConfigs?: PropertyConfig[]

}

/**
 * Build a {@link CollectionsConfigController} that persists collection in
 * Firestore, but also allows including collections added in code.
 * @param firebaseApp
 * @param collections
 * @param configPath
 */
export function useFirestoreCollectionsConfigController<EC extends PersistedCollection, USER extends User = User>({
                                                                                                                      firebaseApp,
                                                                                                                      generalConfigPath = "__FIRECMS/config",
                                                                                                                      configPath,
                                                                                                                      permissions,
                                                                                                                      propertyConfigs
                                                                                                                  }: CollectionConfigControllerProps<EC, USER>): CollectionsConfigController {

    const collectionsConfigPath = configPath
        ?? (generalConfigPath ? removeInitialAndTrailingSlashes(generalConfigPath) + "/collections" : undefined)
        ?? "__FIRECMS/config/collections";

    const propertyConfigsMap = useMemo(() => {
        const map: Record<string, any> = {};
        propertyConfigs?.forEach(field => {
            map[field.key] = field;
        });
        return map;
    }, [propertyConfigs]);

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [persistedCollections, setPersistedCollections] = React.useState<PersistedCollection[] | undefined>();

    const [configLoading, setConfigLoading] = React.useState<boolean>(true);
    const [navigationEntries, setNavigationEntries] = React.useState<NavigationGroupMapping[]>([]);

    const [collectionsError, setCollectionsError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp || !collectionsConfigPath) return;

        const firestore = getFirestore(firebaseApp);

        return onSnapshot(collection(firestore, collectionsConfigPath),
            {
                next: (snapshot) => {
                    setCollectionsError(undefined);
                    try {
                        const newCollections = docsToCollectionTree(snapshot.docs);
                        setPersistedCollections(newCollections);
                    } catch (e) {
                        console.error(e);
                        setCollectionsError(e as Error);
                    }
                    setCollectionsLoading(false);
                },
                error: (e) => {
                    setCollectionsLoading(false);
                    setCollectionsError(e);
                }
            }
        );
    }, [collectionsConfigPath, firebaseApp]);

    useEffect(() => {
        if (!firebaseApp || !generalConfigPath) return;

        const firestore = getFirestore(firebaseApp);
        const ref = doc(firestore, generalConfigPath);

        return onSnapshot(ref, (snapshot) => {
            const data = snapshot.data();
            if (data?.homePage?.navigationEntries) {
                const entries = data.homePage.navigationEntries as NavigationGroupMapping[];
                setNavigationEntries(entries);
            } else {
                setNavigationEntries([]);
            }
            setConfigLoading(false);
        }, (e) => {
            console.error("Error loading homepage groups", e);
            setConfigLoading(false);
        });
    }, [generalConfigPath, firebaseApp]);

    const deleteCollection = useCallback(({
                                              id,
                                              parentCollectionIds
                                          }: DeleteCollectionParams): Promise<void> => {

        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const collectionPath = buildCollectionId(id, parentCollectionIds);
        console.debug("Deleting collection", collectionPath);
        const ref = doc(firestore, collectionsConfigPath, collectionPath);
        return deleteDoc(ref);
    }, [collectionsConfigPath, firebaseApp]);

    const saveNavigationEntries = useCallback((navigationEntries: NavigationGroupMapping[]): Promise<void> => {
        if (!firebaseApp) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        if (!generalConfigPath) {
            console.warn("No generalConfigPath provided in useFirestoreConfigurationPersistence, cannot save homepage navigation entries order");
            return Promise.resolve();
        }
        const firestore = getFirestore(firebaseApp);
        const ref = doc(firestore, generalConfigPath);
        console.debug("Saving homepage navigation entries order", navigationEntries);
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, { homePage: { navigationEntries: navigationEntries } }, { merge: true });
        });
    }, [generalConfigPath, firebaseApp]);

    const saveCollection = useCallback(<M extends Record<string, any>>({
                                                                           id,
                                                                           collectionData,
                                                                           previousId,
                                                                           parentCollectionIds
                                                                       }: SaveCollectionParams<M>): Promise<void> => {
        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!id)
            throw Error("Trying to save a collection with no id");
        if (!collectionData.path)
            throw Error("Trying to save a collection with no path");
        if (!collectionData.name)
            throw Error("Trying to save a collection with no name");
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedId = previousId ? buildCollectionId(previousId, parentCollectionIds) : undefined;
        const ref = doc(firestore, collectionsConfigPath, strippedPath);
        console.debug("Saving collection", {
            id,
            collectionData,
            previousId,
            parentCollectionIds,
            cleanedCollection
        });
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, cleanedCollection, { merge: true });
            if (previousStrippedId && previousStrippedId !== strippedPath) {
                const previousRef = doc(firestore, collectionsConfigPath, previousStrippedId);
                transaction.delete(previousRef);
            }
        });
    }, [collectionsConfigPath, firebaseApp, propertyConfigsMap]);

    const updateCollection = useCallback(<M extends Record<string, any>>({
                                                                             id,
                                                                             collectionData,
                                                                             previousId,
                                                                             parentCollectionIds
                                                                         }: UpdateCollectionParams<M>): Promise<void> => {
        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedPath = previousId ? buildCollectionId(previousId, parentCollectionIds) : undefined;
        const ref = doc(firestore, collectionsConfigPath, strippedPath);

        console.debug("Updating collection", {
            id,
            collectionData,
            previousId,
            parentCollectionIds,
            cleanedCollection
        });

        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, cleanedCollection, { merge: true });
            if (previousStrippedPath && previousStrippedPath !== strippedPath) {
                const previousRef = doc(firestore, collectionsConfigPath, previousStrippedPath);
                transaction.delete(previousRef);
            }
        });
    }, [collectionsConfigPath, firebaseApp, propertyConfigsMap]);

    const collections = persistedCollections !== undefined ? applyPermissionsFunctionIfEmpty(persistedCollections, permissions as PermissionsBuilder<any, any>) : undefined;

    const getCollection = useCallback((id: string) => {
        if (!collections) throw Error("Collections not initialised");
        const collection = collections.find(c => c.id === id);
        if (!collection) throw Error(`Collection with id ${id} not found`);
        return collection;
    }, [collections]);

    const saveProperty = useCallback(({
                                          path,
                                          propertyKey,
                                          property,
                                          newPropertiesOrder,
                                          parentCollectionIds,
                                          namespace
                                      }: {
        path: string,
        propertyKey: string,
        property: Property,
        newPropertiesOrder?: string[],
        parentCollectionIds?: string[],
        namespace?: string
    }): Promise<void> => {

        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const collectionPath = buildCollectionId(path, parentCollectionIds);
        const ref = doc(firestore, collectionsConfigPath, collectionPath);
        return runTransaction(firestore, async (transaction) => {
            const data = {
                [namespaceToPropertiesPath(namespace) + "." + propertyKey]: setUndefinedToDelete(removeFunctions(removeUndefined(property))),
            };
            if (newPropertiesOrder) {
                data.propertiesOrder = newPropertiesOrder;
            }
            console.debug("Saving property", {
                path,
                propertyKey,
                property,
                collectionPath,
                namespace,
                data
            });
            transaction.update(ref, data);
        });

    }, [collectionsConfigPath, firebaseApp]);

    const deleteProperty = useCallback(({
                                            path,
                                            propertyKey,
                                            newPropertiesOrder,
                                            parentCollectionIds,
                                            namespace
                                        }: {
        path: string,
        propertyKey: string,
        newPropertiesOrder?: string[],
        parentCollectionIds?: string[],
        namespace?: string
    }): Promise<void> => {

        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const collectionPath = buildCollectionId(path, parentCollectionIds);
        const ref = doc(firestore, collectionsConfigPath, collectionPath);
        return runTransaction(firestore, async (transaction) => {
            const data: any = setUndefinedToDelete({
                [namespaceToPropertiesPath(namespace) + "." + propertyKey]: undefined,
            });
            if (newPropertiesOrder) {
                data.propertiesOrder = newPropertiesOrder;
            }
            console.debug("Deleting property", {
                path,
                propertyKey,
                collectionPath,
                namespace,
                data
            });
            transaction.update(ref, data);
        });
    }, [collectionsConfigPath, firebaseApp]);

    return {
        loading: collectionsLoading || configLoading,
        collections,
        getCollection,
        saveCollection,
        updateCollection,
        deleteCollection,
        saveProperty,
        deleteProperty,
        navigationEntries,
        saveNavigationEntries
    }
}
