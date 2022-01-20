import { FirebaseApp } from "firebase/app";
import {
    collection,
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
import { EntityCollection, EntitySchema, Properties } from "../../models";
import { sortProperties } from "../../core/util/schemas";

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

const docToSchema = (doc: DocumentSnapshot) => {
    const data = doc.data();
    if (!data)
        throw Error("Entity schema has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};
    const sortedProperties = sortProperties(properties, propertiesOrder);
    return { ...data, properties: sortedProperties } as EntitySchema;
}

export function useFirestoreConfigurationPersistence({
                                                         firebaseApp,
                                                         configPath = DEFAULT_CONFIG_PATH
                                                     }: FirestoreConfigurationPersistenceProps): ConfigurationPersistence {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [schemasLoading, setSchemasLoading] = React.useState<boolean>(true);
    const [collections, setCollections] = React.useState<EntityCollection[] | undefined>();
    const [schemas, setSchemas] = React.useState<EntitySchema[] | undefined>();

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
                    const newCollections = snapshot.docs.map((doc) => doc.data() as EntityCollection);
                    setCollections(newCollections);
                    setCollectionsLoading(false);
                },
                error: (e) => {
                    setCollectionsLoading(false);
                    setError(e);
                }
            }
        );
    }, [firestore]);

    useEffect(() => {
        if (!firestore) return;

        return onSnapshot(collection(firestore, configPath, "config", "schemas"),
            {
                next: (snapshot) => {
                    setError(undefined);
                    const newSchemas = snapshot.docs.map(docToSchema);
                    setSchemas(newSchemas);
                    setSchemasLoading(false);
                },
                error: (e) => {
                    setSchemasLoading(false);
                    setError(e);
                }
            }
        );
    }, [firestore]);

    const getCollection = useCallback(<M extends { [Key: string]: any }>(path: string): Promise<EntityCollection<M>> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", path);
        return getDoc(ref).then((doc) => doc.data() as EntityCollection<M>);
    }, [firestore]);

    const saveCollection = useCallback(<M extends { [Key: string]: any }>(path: string, collectionData: EntityCollection<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", path);
        return setDoc(ref, collectionData, { merge: true });
    }, [firestore]);

    const getSchema = useCallback(<M extends { [Key: string]: any }>(schemaId: string): Promise<EntitySchema<M>> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "schemas", schemaId);
        return getDoc(ref).then(docToSchema);
    }, [firestore]);

    const saveSchema = useCallback(<M extends { [Key: string]: any }>(schema: EntitySchema<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.log("saveSchema", schema);
        const ref = doc(firestore, configPath, "config", "schemas", schema.id);
        try {
            return setDoc(ref, setUndefinedToDelete(schema as unknown as Record<string, unknown>), { merge: true });
        } catch (e) {
            return Promise.reject(e);
        }
    }, [firestore]);

    return {
        loading: collectionsLoading || schemasLoading,
        collections,
        schemas,
        getCollection,
        saveCollection,
        getSchema,
        saveSchema
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
