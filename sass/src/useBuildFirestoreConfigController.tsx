import { FirebaseApp } from "firebase/app";
import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    DocumentSnapshot,
    Firestore,
    getFirestore,
    onSnapshot,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef } from "react";
import { ConfigController } from "./models/config_controller";
import {
    COLLECTION_PATH_SEPARATOR,
    EntityCollection,
    mergeCollections,
    PermissionsBuilderProps,
    Properties,
    removeFunctions,
    removeNonEditableProperties,
    sortProperties,
    stripCollectionPath
} from "@camberi/firecms";
import { SassUser } from "./models/sass_user";
import { Role } from "./models/roles";
import { resolveSassPermissions } from "./util/permissions";

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
                    // TODO: remove this hack to generate the default roles
                    // if (snapshot.empty) DEFAULT_ROLES.forEach(saveRole);
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

    const saveUser = useCallback(<M extends { [Key: string]: any }>(user:SassUser): Promise<SassUser> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Persisting", user);
        const { id, ...userData } = user;
        if (id) {
            const ref = doc(firestore, configPath, "config", "users", id);
            return setDoc(ref, {
                ...userData,
                updated_on: serverTimestamp()
            }, { merge: true }).then(() => user);
        } else {
            return addDoc(collection(firestore, configPath, "config", "users"), {
                ...userData,
                created_on: serverTimestamp()
            })
                .then(ref => ({ id: ref.id, ...userData }));
        }
    }, [configPath, firestore]);

    const saveRole = useCallback(<M extends { [Key: string]: any }>(role: Role): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Persisting", role);
        const { id, ...roleData } = role;
        const ref = doc(firestore, configPath, "config", "roles", id);
        return setDoc(ref, roleData, { merge: true });
    }, [configPath, firestore]);

    const deleteUser = useCallback(<M extends { [Key: string]: any }>(user: SassUser): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", user);
        const { id } = user;
        const ref = doc(firestore, configPath, "config", "users", id);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const deleteRole = useCallback(<M extends { [Key: string]: any }>(role: Role): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const ref = doc(firestore, configPath, "config", "roles", id);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const allCollections = persistedCollections !== undefined ? joinCollections(persistedCollections, baseCollections) : undefined;
    const collections = allCollections !== undefined ? applyPermissionsFunction(allCollections) : undefined;

    return {
        loading: collectionsLoading || rolesLoading || usersLoading,
        collections,
        saveCollection,
        deleteCollection,
        roles,
        users,
        saveUser,
        saveRole,
        deleteUser,
        deleteRole
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
    return docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_on: doc.data()?.created_on?.toDate(),
        updated_on: doc.data()?.updated_on?.toDate(),
    } as SassUser));
}

const docsToRoles = (docs: DocumentSnapshot[]): Role[] => {
    return docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    } as Role));
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
            const storedCollection = resolvedFetchedCollections?.find((collection) => collection.path === navigationCollection.path)
                ?? resolvedFetchedCollections?.find((collection) => collection.alias === navigationCollection.alias);
            if (!storedCollection) {
                return { ...navigationCollection, deletable: false };
            } else {
                const mergedCollection = mergeCollections(navigationCollection, storedCollection);
                return { ...mergedCollection, deletable: false };
            }
        });
    const storedCollections = resolvedFetchedCollections
        .filter((col) => !updatedCollections.map(c => c.path).includes(col.path) || !updatedCollections.map(c => c.alias).includes(col.alias));

    return [...updatedCollections, ...storedCollections];
}

const applyPermissionsFunction = (collections: EntityCollection[]) => {
    return collections.map(collection => ({
        ...collection,
        permissions: ({
                          pathSegments,
                          collection,
                          authController
                      }: PermissionsBuilderProps<any>) => resolveSassPermissions(collection, authController, pathSegments)
    }))

}
