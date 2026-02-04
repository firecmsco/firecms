import React, { useCallback, useEffect, useMemo } from "react";
import { FirebaseApp } from "@firebase/app";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, runTransaction } from "@firebase/firestore";
import {
    CollectionsConfigController,
    CollectionsSetupInfo,
    DeleteCollectionParams,
    namespaceToPropertiesPath,
    PersistedCollection,
    SaveCollectionParams,
    UpdateCollectionParams,
    UpdatePropertiesOrderParams,
    UpdateKanbanColumnsOrderParams
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
    const [collectionsSetup, setCollectionsSetup] = React.useState<CollectionsSetupInfo | undefined>();

    useEffect(() => {
        if (!firebaseApp || !collectionsConfigPath) return;

        const firestore = getFirestore(firebaseApp);

        return onSnapshot(collection(firestore, collectionsConfigPath),
            {
                next: (snapshot) => {
                    try {
                        const newCollections = docsToCollectionTree(snapshot.docs);
                        setPersistedCollections(newCollections);
                    } catch (e) {
                        console.error(e);
                    }
                    setCollectionsLoading(false);
                },
                error: (e) => {
                    setCollectionsLoading(false);
                    console.error(e);
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

            if (data?.collectionsSetup) {
                setCollectionsSetup(data.collectionsSetup as CollectionsSetupInfo);
            } else {
                setCollectionsSetup(undefined);
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
        if (!collectionData.dbPath)
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
        const collection = collections.find(c => c.slug === id);
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
            const propertyPath = namespaceToPropertiesPath(namespace);
            const fullPath = propertyPath + "." + propertyKey;

            console.debug("Saving property", {
                path,
                propertyKey,
                property,
                collectionPath,
                namespace,
                propertyPath,
                fullPath
            });

            const docSnap = await transaction.get(ref);
            if (docSnap.exists()) {
                // For existing documents, use update with dot notation
                const data: Record<string, any> = {
                    id: path,
                    [fullPath]: setUndefinedToDelete(removeFunctions(removeUndefined(property))),
                };
                if (newPropertiesOrder) {
                    data.propertiesOrder = newPropertiesOrder;
                }
                transaction.update(ref, data);
            } else {
                // For new documents, build the nested structure
                const nestedData: any = {
                    id: path
                };
                const pathParts = propertyPath.split('.');
                let current = nestedData;
                for (let i = 0; i < pathParts.length; i++) {
                    if (i === pathParts.length - 1) {
                        current[pathParts[i]] = {
                            [propertyKey]: setUndefinedToDelete(removeFunctions(removeUndefined(property)))
                        };
                    } else {
                        current[pathParts[i]] = {};
                        current = current[pathParts[i]];
                    }
                }
                if (newPropertiesOrder) {
                    nestedData.propertiesOrder = newPropertiesOrder;
                }
                transaction.set(ref, nestedData);
            }
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

    const updatePropertiesOrder = useCallback(({
        collection,
        newPropertiesOrder,
        parentCollectionIds
    }: UpdatePropertiesOrderParams): Promise<void> => {
        // Only update if the collection is editable (persisted or code-defined collections that can be extended)
        if (collection.editable === false) {
            return Promise.resolve();
        }
        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const collectionPath = buildCollectionId(collection.id, parentCollectionIds);
        const ref = doc(firestore, collectionsConfigPath, collectionPath);
        // Use set with merge to handle both persisted collections and code-defined collections
        // that don't have a document yet. Also include id so the collection can be matched during merge.
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, { id: collection.id, propertiesOrder: newPropertiesOrder }, { merge: true });
        });
    }, [collectionsConfigPath, firebaseApp]);

    const updateKanbanColumnsOrder = useCallback(({
        collection,
        kanbanColumnProperty,
        newColumnsOrder,
        parentCollectionIds
    }: UpdateKanbanColumnsOrderParams): Promise<void> => {
        // Only update if the collection is editable
        if (collection.editable === false) {
            return Promise.resolve();
        }
        if (!firebaseApp || !collectionsConfigPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const firestore = getFirestore(firebaseApp);
        const collectionPath = buildCollectionId(collection.id, parentCollectionIds);
        const ref = doc(firestore, collectionsConfigPath, collectionPath);

        // Get the current property and its enumValues
        const currentProperty = collection.properties?.[kanbanColumnProperty];
        if (!currentProperty || !('enumValues' in currentProperty) || !currentProperty.enumValues) {
            console.warn("Cannot update Kanban column order: property not found or has no enumValues");
            return Promise.resolve();
        }

        const currentEnumValues = Array.isArray(currentProperty.enumValues)
            ? currentProperty.enumValues
            : Object.entries(currentProperty.enumValues).map(([enumId, value]) =>
                typeof value === 'string' ? { id: enumId, label: value } : { ...value, id: enumId }
            );

        // Reorder enumValues to match newColumnsOrder
        const reorderedEnumValues = newColumnsOrder
            .map(columnId => currentEnumValues.find(ev => String(ev.id) === columnId))
            .filter(Boolean);

        // Add any enum values that weren't in the new order (shouldn't happen, but be safe)
        const missingEnumValues = currentEnumValues.filter(
            ev => !newColumnsOrder.includes(String(ev.id))
        );
        const finalEnumValues = [...reorderedEnumValues, ...missingEnumValues];

        // Persist by updating the property's enumValues in the correct order
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, {
                id: collection.id,
                properties: {
                    [kanbanColumnProperty]: {
                        ...setUndefinedToDelete(removeFunctions(removeUndefined(currentProperty))),
                        enumValues: finalEnumValues
                    }
                }
            }, { merge: true });
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
        updatePropertiesOrder,
        updateKanbanColumnsOrder,
        navigationEntries,
        saveNavigationEntries,
        collectionsSetup
    }
}

