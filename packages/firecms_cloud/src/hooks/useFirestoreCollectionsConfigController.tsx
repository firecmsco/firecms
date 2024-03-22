import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FirebaseApp } from "firebase/app";
import { collection, deleteDoc, doc, Firestore, getFirestore, onSnapshot, runTransaction } from "firebase/firestore";
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
    PermissionsBuilder,
    Property,
    PropertyConfig,
    removeFunctions,
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
export interface CollectionConfigControllerProps<EC extends PersistedCollection, UserType extends User = User> {

    firebaseApp?: FirebaseApp;

    /**
     * Firestore document where the configuration is saved. e.g. "projects/my_project"
     * Must be a 2 path string.
     */
    configPath: string;

    /**
     * Define what actions can be performed on data.
     */
    permissions?: PermissionsBuilder<EC, UserType>;

    propertyConfigs?: PropertyConfig[]

}

/**
 * Build a {@link CollectionsConfigController} that persists collection in
 * Firestore, but also allows including collections added in code.
 * @param firebaseApp
 * @param collections
 * @param configPath
 */
export function useFirestoreCollectionsConfigController<EC extends PersistedCollection, UserType extends User = User>({
                                                                                                                          firebaseApp,
                                                                                                                          configPath,
                                                                                                                          permissions,
                                                                                                                          propertyConfigs
                                                                                                                      }: CollectionConfigControllerProps<EC, UserType>): CollectionsConfigController {

    const propertyConfigsMap = useMemo(() => {
        const map: Record<string, any> = {};
        propertyConfigs?.forEach(field => {
            map[field.key] = field;
        });
        return map;
    }, [propertyConfigs]);

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [persistedCollections, setPersistedCollections] = React.useState<PersistedCollection[] | undefined>();

    const [collectionsError, setCollectionsError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore || !configPath) return;

        return onSnapshot(collection(firestore, configPath, "collections"),
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
    }, [configPath, firestore]);

    const deleteCollection = useCallback(({
                                              id,
                                              parentCollectionIds
                                          }: DeleteCollectionParams): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionId(id, parentCollectionIds);
        console.debug("!!Deleting collection", collectionPath);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const saveCollection = useCallback(<M extends Record<string, any>>({
                                                                           id,
                                                                           collectionData,
                                                                           previousId,
                                                                           parentCollectionIds
                                                                       }: SaveCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        if (!id)
            throw Error("Trying to save a collection with no id");
        if (!collectionData.path)
            throw Error("Trying to save a collection with no path");
        if (!collectionData.name)
            throw Error("Trying to save a collection with no name");
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedId = previousId ? buildCollectionId(previousId, parentCollectionIds) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);
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
                const previousRef = doc(firestore, configPath, "collections", previousStrippedId);
                transaction.delete(previousRef);
            }
        });
    }, [configPath, firestore, propertyConfigsMap]);

    const updateCollection = useCallback(<M extends Record<string, any>>({
                                                                             id,
                                                                             collectionData,
                                                                             previousId,
                                                                             parentCollectionIds
                                                                         }: UpdateCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedPath = previousId ? buildCollectionId(previousId, parentCollectionIds) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);

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
                const previousRef = doc(firestore, configPath, "collections", previousStrippedPath);
                transaction.delete(previousRef);
            }
        });
    }, [configPath, firestore, propertyConfigsMap]);

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

        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionId(path, parentCollectionIds);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return runTransaction(firestore, async (transaction) => {
            const data = {
                [namespaceToPropertiesPath(namespace) + "." + propertyKey]: setUndefinedToDelete(removeFunctions(removeUndefined(property))),
            };
            if (newPropertiesOrder) {
                data.propertiesOrder = newPropertiesOrder;
            }
            console.log("Saving property", {
                path,
                propertyKey,
                property,
                collectionPath,
                namespace,
                data
            });
            transaction.update(ref, data);
        });

    }, [configPath, firestore]);

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

        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionId(path, parentCollectionIds);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return runTransaction(firestore, async (transaction) => {
            const data: any = setUndefinedToDelete({
                [namespaceToPropertiesPath(namespace) + "." + propertyKey]: undefined,
            });
            if (newPropertiesOrder) {
                data.propertiesOrder = newPropertiesOrder;
            }
            console.log("Deleting property", {
                path,
                propertyKey,
                collectionPath,
                namespace,
                data
            });
            transaction.update(ref, data);
        });
    }, [configPath, firestore]);

    return useMemo(() => ({
        loading: collectionsLoading,
        collections,
        getCollection,
        saveCollection,
        updateCollection,
        deleteCollection,
        saveProperty,
        deleteProperty,
    }), [collectionsLoading, collections, getCollection, saveCollection, updateCollection, deleteCollection, saveProperty, deleteProperty])
}
