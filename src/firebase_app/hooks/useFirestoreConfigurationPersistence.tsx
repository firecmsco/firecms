import { FirebaseApp } from "firebase/app";
import {
    collection,
    doc,
    Firestore,
    getDoc,
    getDocs,
    getFirestore,
    onSnapshot,
    setDoc
} from "firebase/firestore";
import React, { useEffect, useRef } from "react";
import {
    ConfigurationPersistence,
    StoredEntityCollection,
    StoredEntitySchema
} from "../../models/config_persistence";


/**
 * @category Firebase
 */
export interface FirestoreConfigurationPersistence {
    firebaseApp?: FirebaseApp;
    /**
     * Firestore collection where the configuration is saved.
     */
    configPath?: string;
}

const DEFAULT_CONFIG_PATH = "__FIRECMS";

export function useFirestoreConfigurationPersistence({
                                                         firebaseApp,
                                                         configPath = DEFAULT_CONFIG_PATH
                                                     }: FirestoreConfigurationPersistence): ConfigurationPersistence {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [collections, setCollections] = React.useState<StoredEntityCollection[] | undefined>();
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
                    const newCollections = snapshot.docs.map((doc) => doc.data() as StoredEntityCollection);
                    setCollections(newCollections);
                },
                error: setError
            }
        );
    }, [firestore]);

    const getCollection = <M extends any>(path: string): Promise<StoredEntityCollection<M>> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", path);
        return getDoc(ref).then((doc) => doc.data() as StoredEntityCollection<M>);
    };

    const saveCollection = <M extends any>(path: string, collectionData: StoredEntityCollection<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.log("config", "collections", path);
        const ref = doc(firestore, configPath, "config", "collections", path);
        return setDoc(ref, collectionData, { merge: true });
    };

    const getSchema = <M extends any>(schemaId: string): Promise<StoredEntitySchema<M>> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "schemas", schemaId);
        return getDoc(ref).then((doc) => doc.data() as StoredEntitySchema<M>);
    };

    const saveSchema = <M extends any>(schemaId: string, schema: StoredEntitySchema<M>): Promise<void> => {
        if (!firestore) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const ref = doc(firestore, configPath, "config", "collections", schemaId);
        return setDoc(ref, schema, { merge: true });
    };

    return {
        collections,
        getCollection,
        saveCollection,
        getSchema,
        saveSchema
    }
}
