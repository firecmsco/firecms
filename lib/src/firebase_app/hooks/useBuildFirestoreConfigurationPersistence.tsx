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
import { ConfigurationPersistence } from "../../models/config_persistence";
import { EntityCollection, Properties } from "../../models";
import {
    prepareCollectionForPersistence,
    sortProperties
} from "../../core/util/collections";
import { stripCollectionPath } from "../../core/util/paths";

/**
 * @category Firebase
 */
export interface FirestoreConfigurationPersistenceProps {
    firebaseApp?: FirebaseApp;
    /**
     * Firestore collection where the configuration is saved.
     */
    configPath?: string;
}

const DEFAULT_CONFIG_PATH = "__FIRECMS";

const docToCollection = (doc: DocumentSnapshot) => {
    const data = doc.data();
    if (!data)
        throw Error("Entity collection has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};
    const sortedProperties = sortProperties(properties, propertiesOrder);
    return { ...data, properties: sortedProperties } as EntityCollection;
}

export function useBuildFirestoreConfigurationPersistence({
                                                         firebaseApp,
                                                         configPath = DEFAULT_CONFIG_PATH
                                                     }: FirestoreConfigurationPersistenceProps): ConfigurationPersistence {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [loading, setLoading] = React.useState<boolean>(true);
    const [collections, setCollections] = React.useState<EntityCollection[] | undefined>();

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
                    const newCollections = snapshot.docs.map((doc) => docToCollection(doc));
                    setCollections(newCollections);
                    setLoading(false);
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
        const strippedPath = stripCollectionPath(path).split("/").join("/collections/");
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
        const strippedPath = stripCollectionPath(path).split("/").join("/collections/");
        const ref = doc(firestore, configPath, "config", "collections", strippedPath);
        return setDoc(ref, cleanedCollection, { merge: true });
    }, [firestore]);

    return {
        loading,
        collections,
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
