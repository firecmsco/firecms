import { FirebaseApp } from "firebase/app";
import {
    collection,
    deleteDoc,
    deleteField,
    doc,
    DocumentSnapshot,
    Firestore,
    getFirestore,
    onSnapshot,
    setDoc
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef } from "react";
import { ConfigController } from "./models/config_controller";
import {
    AuthController,
    COLLECTION_PATH_SEPARATOR,
    EntityCollection,
    mergeCollections,
    Properties,
    removeFunctions,
    removeNonEditableProperties,
    resolvePermissions,
    Role,
    sortProperties,
    stripCollectionPath
} from "@camberi/firecms";
import { SassUser } from "./models/sass_user";

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
    collections?: EntityCollection[];

}

const DEFAULT_CONFIG_PATH = "__FIRECMS";

/**
 * Build a {@link ConfigController} that persists collection in
 * Firestore, but also allows including collections added in code.
 * @param firebaseApp
 * @param collections
 * @param configPath
 */
export function useBuildFirestoreConfigController({
                                                      firebaseApp,
                                                      collections: baseCollections,
                                                      configPath = DEFAULT_CONFIG_PATH,
                                                  }: FirestoreConfigurationPersistenceProps): ConfigController {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [persistedCollections, setPersistedCollections] = React.useState<EntityCollection[] | undefined>();
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [users, setUsers] = React.useState<SassUser[]>([]);

    const [collectionsError, setCollectionsError] = React.useState<Error | undefined>();
    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore) return;

        return onSnapshot(collection(firestore, configPath, "config", "collections"),
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
    }, [firestore]);

    useEffect(() => {
        if (!firestore) return;

        return onSnapshot(collection(firestore, configPath, "config", "roles"),
            {
                next: (snapshot) => {
                    setRolesError(undefined);
                    try {
                        const newRoles = docsToRoles(snapshot.docs);
                        setRoles(newRoles);
                    } catch (e) {
                        console.error(e);
                        setRolesError(e as Error);
                    }
                    setRolesLoading(false);
                },
                error: (e) => {
                    setRolesError(e);
                    setRolesLoading(false);
                }
            }
        );
    }, [configPath, firestore]);

    useEffect(() => {
        if (!firestore) return;

        return onSnapshot(collection(firestore, configPath, "config", "users"),
            {
                next: (snapshot) => {
                    setUsersError(undefined);
                    try {
                        const newUsers = docsToUsers(snapshot.docs);
                        setUsers(newUsers);
                    } catch (e) {
                        console.error(e);
                        setUsersError(e as Error);
                    }
                    setUsersLoading(false);
                },
                error: (e) => {
                    setUsersError(e);
                    setUsersLoading(false);
                }
            }
        );
    }, [configPath, firestore]);

    const deleteCollection = useCallback(<M extends { [Key: string]: any }>(path: string): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", path);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const saveCollection = useCallback(<M extends { [Key: string]: any }>(path: string, collectionData: EntityCollection<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData);
        const strippedPath = stripCollectionPath(path);
        const ref = doc(firestore, configPath, "config", "collections", strippedPath);
        console.debug("Persisting", cleanedCollection);
        return setDoc(ref, cleanedCollection, { merge: true });
    }, [configPath, firestore]);


    const collections = persistedCollections !== undefined ?  joinCollections(persistedCollections , baseCollections) : undefined;
    return {
        loading: collectionsLoading || rolesLoading || usersLoading,
        collections,
        saveCollection,
        deleteCollection,
        roles,
        users
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

const docsToUsers = (docs: DocumentSnapshot[]): SassUser[] => {
    return docs.map((doc) => doc.data() as SassUser);
}
const docsToRoles = (docs: DocumentSnapshot[]): Role[] => {
    return docs.map((doc) => doc.data() as Role);
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

export function filterAllowedCollections<M>(collections: EntityCollection<M>[],
                                            authController: AuthController,
                                            paths: string[] = []): EntityCollection<M>[] {
    return collections
        .map((collection) => ({
            ...collection,
            subcollections: collection.subcollections
                ? filterAllowedCollections(collection.subcollections, authController, [...paths, collection.path])
                : undefined,
            permissions: resolvePermissions(collection, authController, [...paths, collection.path]
            )
        }))
        .filter(collection => collection.permissions.read === undefined || collection.permissions.read);
}
