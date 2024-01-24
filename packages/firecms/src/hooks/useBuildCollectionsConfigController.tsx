import { FirebaseApp } from "firebase/app";
import { collection, deleteDoc, doc, Firestore, getFirestore, onSnapshot, runTransaction } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
    CollectionsConfigController,
    DeleteCollectionParams,
    namespaceToPropertiesPath,
    PersistedCollection,
    SaveCollectionParams,
    UpdateCollectionParams
} from "@firecms/collection_editor";
import { PermissionsBuilder, Property, PropertyConfig, removeFunctions, removeUndefined, User } from "@firecms/core";
import {
    applyPermissionsFunctionIfEmpty,
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
     * Firestore collection where the configuration is saved.
     */
    projectId: string;

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
 * @param projectId
 */
export function useBuildCollectionsConfigController<EC extends PersistedCollection, UserType extends User = User>({
                                                                                                                      firebaseApp,
                                                                                                                      projectId,
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

    const configPath = projectId ? `projects/${projectId}` : undefined;

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
                                              path,
                                              parentCollectionIds
                                          }: DeleteCollectionParams): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionId(path, parentCollectionIds);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const saveCollection = useCallback(<M extends Record<string, any>>({
                                                                           id,
                                                                           collectionData,
                                                                           previousPath,
                                                                           parentCollectionIds
                                                                       }: SaveCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedPath = previousPath ? buildCollectionId(previousPath, parentCollectionIds) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);
        console.debug("Saving collection", {
            id,
            collectionData,
            previousPath,
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

    const updateCollection = useCallback(<M extends Record<string, any>>({
                                                                             id,
                                                                             collectionData,
                                                                             previousPath,
                                                                             parentCollectionIds
                                                                         }: UpdateCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData, propertyConfigsMap);
        const strippedPath = buildCollectionId(id, parentCollectionIds);
        const previousStrippedPath = previousPath ? buildCollectionId(previousPath, parentCollectionIds) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);

        console.debug("Saving collection", {
            id,
            collectionData,
            previousPath,
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

    const collections = persistedCollections !== undefined ? applyPermissionsFunctionIfEmpty(persistedCollections, permissions as PermissionsBuilder) : undefined;

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
