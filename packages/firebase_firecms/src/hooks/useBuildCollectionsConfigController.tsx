import { FirebaseApp } from "firebase/app";
import { collection, deleteDoc, doc, Firestore, getFirestore, onSnapshot, runTransaction } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
    CollectionsConfigController,
    DeleteCollectionParams,
    namespaceToPropertiesPath,
    PersistedCollection,
    SaveCollectionParams
} from "@firecms/collection_editor";
import { PermissionsBuilder, Property, removeFunctions, removeUndefined, User } from "@firecms/core";
import {
    applyPermissionsFunction,
    buildCollectionPath,
    docsToCollectionTree,
    prepareCollectionForPersistence,
    setUndefinedToDelete
} from "../utils";

/**
 * @category Firebase
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
                                                                                                                      permissions
                                                                                                                  }: CollectionConfigControllerProps<EC, UserType>): CollectionsConfigController {

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
                                              parentPathSegments
                                          }: DeleteCollectionParams): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionPath(path, parentPathSegments);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const saveCollection = useCallback(<M extends Record<string, any>>({
                                                                           path,
                                                                           collectionData,
                                                                           previousPath,
                                                                           parentPathSegments
                                                                       }: SaveCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData);
        const strippedPath = buildCollectionPath(path, parentPathSegments);
        const previousStrippedPath = previousPath ? buildCollectionPath(previousPath, parentPathSegments) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);
        console.debug("Saving collection", {
            collectionData,
            path,
            previousPath,
            parentPathSegments,
            cleanedCollection
        });
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, cleanedCollection, { merge: true });
            if (previousStrippedPath && previousStrippedPath !== strippedPath) {
                const previousRef = doc(firestore, configPath, "collections", previousStrippedPath);
                transaction.delete(previousRef);
            }
        });
    }, [configPath, firestore]);

    const collections = persistedCollections !== undefined ? applyPermissionsFunction(persistedCollections, permissions as PermissionsBuilder) : undefined;

    const saveProperty = useCallback(({
                                          path,
                                          propertyKey,
                                          property,
                                          newPropertiesOrder,
                                          parentPathSegments,
                                          namespace
                                      }: {
        path: string,
        propertyKey: string,
        property: Property,
        newPropertiesOrder?: string[],
        parentPathSegments?: string[],
        namespace?: string
    }): Promise<void> => {

        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionPath(path, parentPathSegments);
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
                                            parentPathSegments,
                                            namespace
                                        }: {
        path: string,
        propertyKey: string,
        newPropertiesOrder?: string[],
        parentPathSegments?: string[],
        namespace?: string
    }): Promise<void> => {

        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionPath(path, parentPathSegments);
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
        saveCollection,
        deleteCollection,
        saveProperty,
        deleteProperty,
    }), [collections, collectionsLoading, deleteCollection, saveCollection, saveProperty])
}
