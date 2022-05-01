import { FirebaseApp } from "firebase/app";
import {
    collection,
    deleteDoc,
    deleteField,
    doc,
    DocumentSnapshot,
    Firestore,
    getDoc,
    getFirestore,
    onSnapshot,
    setDoc
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef } from "react";
import { CollectionsController } from "../../models/collections_controller";
import { AuthController, EntityCollection, Properties } from "../../models";
import {
    mergeCollections,
    removeNonEditableProperties,
    sortProperties
} from "../../core";
import {
    COLLECTION_PATH_SEPARATOR,
    stripCollectionPath
} from "../../core/util/paths";
import { removeFunctions } from "../../core/util/objects";
import {
    resolveNavigationCollections
} from "../../core/internal/useBuildNavigationContext";

/**
 * @category Firebase
 */
export interface FirestoreConfigurationPersistenceProps {
    firebaseApp?: FirebaseApp;
    /**
     * Firestore collection where the configuration is saved.
     */
    configPath?: string;

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[] | ((params: { authController: AuthController }) => EntityCollection[] | Promise<EntityCollection[]>);

}

const DEFAULT_CONFIG_PATH = "__FIRECMS";

export function useBuildFirestoreCollectionsController({
                                                              firebaseApp,
                                                              collections: baseCollections,
                                                              configPath = DEFAULT_CONFIG_PATH,
                                                          }: FirestoreConfigurationPersistenceProps): CollectionsController {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [loading, setLoading] = React.useState<boolean>(true);
    const [persistedCollections, setPersistedCollections] = React.useState<EntityCollection[] | undefined>();

    const [error, setError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore) return;

        return onSnapshot(collection(firestore, configPath, "config", "collections"),
            {
                next: (snapshot) => {
                    setError(undefined);
                    setLoading(false);
                    try {
                        const newCollections = docsToCollectionTree(snapshot.docs);
                        setPersistedCollections(newCollections);
                    } catch (e) {
                        console.error(e);
                        setError(e as Error);
                    }
                },
                error: (e) => {
                    setLoading(false);
                    setError(e);
                }
            }
        );
    }, [firestore]);

    const getCollection = useCallback(<M extends { [Key: string]: any }>(path: string): Promise<EntityCollection<M>> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const strippedPath = stripCollectionPath(path);
        const ref = doc(firestore, configPath, "config", "collections", strippedPath);
        return getDoc(ref).then((doc) => doc.data() as EntityCollection<M>);
    }, [firestore]);

    const deleteCollection = useCallback(<M extends { [Key: string]: any }>(path: string): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", path);
        return deleteDoc(ref);
    }, [firestore]);

    const saveCollection = useCallback(<M extends { [Key: string]: any }>(path: string, collectionData: EntityCollection<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData);
        const strippedPath = stripCollectionPath(path);
        const ref = doc(firestore, configPath, "config", "collections", strippedPath);
        return setDoc(ref, cleanedCollection, { merge: true });
    }, [firestore]);

    const getCollections = useCallback(async ({ authController }: { authController: AuthController }) => {
        const baseCollectionsResolved = baseCollections ? await resolveNavigationCollections(baseCollections, authController) : [];
        return joinCollections(persistedCollections ?? [], baseCollectionsResolved);
    }, [baseCollections, persistedCollections]);

    return {
        loading,
        getCollections: getCollections,
        getCollection,
        saveCollection,
        deleteCollection
    }
}

export function setUndefinedToDelete(data: Record<string, unknown>): Record<string, unknown> {
    if (typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return { [key]: value.map(v => setUndefinedToDelete(v)) };
                } else if (typeof value === "object") {
                    return { [key]: setUndefinedToDelete(value as Record<string, unknown>) };
                } else {
                    if (value === undefined) {
                        return { [key]: deleteField() }
                    } else {
                        return { [key]: value };
                    }
                }
            })
            .reduce((a, b) => ({ ...a, ...b }), {});
    }
    return data;
}

const docsToCollectionTree = (docs: DocumentSnapshot[]): EntityCollection[] => {

    const collectionsMap = docs.map((doc) => {
        const id: string = doc.id;
        const collection = docToCollection(doc);
        return { [id]: collection };
    }).reduce((a, b) => ({ ...a, ...b }), {});

    Object.entries(collectionsMap).forEach(([id, collection]) => {
        if (id.includes(COLLECTION_PATH_SEPARATOR)) {
            const parentId = id.split(COLLECTION_PATH_SEPARATOR).slice(0, -1).join(COLLECTION_PATH_SEPARATOR);
            const parentCollection = collectionsMap[parentId];
            if (parentCollection)
                parentCollection.subcollections = [...(parentCollection.subcollections ?? []), collection];
            delete collectionsMap[id];
        }
    });

    return Object.values(collectionsMap);
}

const docToCollection = (doc: DocumentSnapshot): EntityCollection => {
    const data = doc.data();
    if (!data)
        throw Error("Entity collection has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};
    const sortedProperties = sortProperties(properties, propertiesOrder);
    return { ...data, properties: sortedProperties } as EntityCollection;
}

function prepareCollectionForPersistence<M>(collection: EntityCollection<M>) {
    const properties = setUndefinedToDelete(removeFunctions(removeNonEditableProperties(collection.properties)));
    const newCollection = {
        ...collection,
        properties
    };
    delete newCollection.permissions;
    delete newCollection.views;
    delete newCollection.additionalColumns;
    delete newCollection.callbacks;
    delete newCollection.extraActions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    return newCollection;
}

function joinCollections(fetchedCollections: EntityCollection[], baseCollections: EntityCollection[] | undefined):EntityCollection[] {
    const resolvedFetchedCollections: EntityCollection[] = fetchedCollections.map(c => ({
        ...c,
        editable: true,
        deletable: true
    }));
    const updatedCollections = (baseCollections ?? [])
        .map((navigationCollection) => {
            const storedCollection = resolvedFetchedCollections?.find((collection) => collection.path === navigationCollection.path);
            if (!storedCollection) {
                return { ...navigationCollection, deletable: false };
            } else {
                const mergedCollection = mergeCollections(navigationCollection, storedCollection);
                return { ...mergedCollection, deletable: false };
            }
        });
    const storedCollections = resolvedFetchedCollections
        .filter((col) => !updatedCollections.map(c => c.path).includes(col.path));

    return [...updatedCollections, ...storedCollections];
}
