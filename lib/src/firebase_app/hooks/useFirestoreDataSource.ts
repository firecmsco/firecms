import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
    EntityValues,
    FetchCollectionProps,
    FetchEntityProps,
    FieldConfig,
    FilterValues,
    GeoPoint,
    ListenCollectionProps,
    ListenEntityProps,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty,
    SaveEntityProps,
    WhereFilterOp
} from "../../types";
import {
    resolveCollection,
    sanitizeData,
    updateDateAutoValues
} from "../../core";
import {
    collection as collectionClause,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    GeoPoint as FirestoreGeoPoint,
    getCountFromServer,
    getDoc,
    getDocs,
    getFirestore,
    limit as limitClause,
    onSnapshot,
    orderBy as orderByClause,
    Query,
    query,
    QueryConstraint,
    serverTimestamp,
    setDoc,
    startAfter as startAfterClause,
    Timestamp,
    where as whereClause
} from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import { FirestoreTextSearchController } from "../types/text_search";
import { useCallback } from "react";
import { setDateToMidnight } from "../util/dates";

/**
 * @category Firebase
 */
export interface FirestoreDataSourceProps {
    firebaseApp?: FirebaseApp,
    textSearchController?: FirestoreTextSearchController,
    fields?: Record<string, FieldConfig>;
}

/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 * @param textSearchController
 * @param collectionRegistry
 * @category Firebase
 */
export function useFirestoreDataSource({
                                           firebaseApp,
                                           textSearchController,
                                           fields
                                       }: FirestoreDataSourceProps): DataSource {

    const createEntityFromCollection = useCallback(<M extends Record<string, any>>(
        docSnap: DocumentSnapshot,
        path: string,
        resolvedCollection: ResolvedEntityCollection<M>
    ): Entity<M> => {

        const values = firestoreToCMSModel(docSnap.data());
        const data = docSnap.data()
            ? resolvedCollection.properties
                ? sanitizeData(values as EntityValues<M>, resolvedCollection.properties)
                : docSnap.data()
            : undefined;
        return {
            id: docSnap.id,
            path: getCMSPathFromFirestorePath(docSnap.ref.path),
            values: data
        };
    }, []);

    const buildQuery = useCallback(<M>(path: string, filter: FilterValues<Extract<keyof M, string>> | undefined, orderBy: string | undefined, order: "desc" | "asc" | undefined, startAfter: any[] | undefined, limit: number | undefined) => {

        if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

        const firestore = getFirestore(firebaseApp);
        const collectionReference: Query = collectionClause(firestore, path);

        const queryParams: QueryConstraint[] = [];
        if (filter) {
            Object.entries(filter)
                .filter(([_, entry]) => !!entry)
                .forEach(([key, filterParameter]) => {
                    const [op, value] = filterParameter as [WhereFilterOp, any];
                    queryParams.push(whereClause(key, op, cmsToFirestoreModel(value, firestore)));
                });
        }

        if (orderBy && order) {
            queryParams.push(orderByClause(orderBy, order));
        }

        if (startAfter) {
            queryParams.push(startAfterClause(startAfter));
        }

        if (limit) {
            queryParams.push(limitClause(limit));
        }

        return query(collectionReference, ...queryParams);
    }, [firebaseApp]);

    const getAndBuildEntity = useCallback(<M extends Record<string, any>>(path: string,
                                                                          entityId: string,
                                                                          collection: EntityCollection<M> | ResolvedEntityCollection<M>): Promise<Entity<M> | undefined> => {
        if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

        const firestore = getFirestore(firebaseApp);

        return getDoc(doc(firestore, path, entityId))
            .then((docSnapshot) => {
                if (!docSnapshot.exists()) {
                    return undefined;
                }
                const resolvedCollection = resolveCollection<M>({
                    collection,
                    path,
                    entityId: docSnapshot.id,
                    values: firestoreToCMSModel(docSnapshot.data()),
                    fields
                });
                return createEntityFromCollection(docSnapshot, path, resolvedCollection);
            });
    }, [firebaseApp]);

    const performTextSearch = useCallback(async <M extends Record<string, any>>(path: string,
                                                                                searchString: string,
                                                                                collection: EntityCollection<M> | ResolvedEntityCollection<M>): Promise<Entity<M>[]> => {
        if (!textSearchController)
            throw Error("Trying to make text search without specifying a FirestoreTextSearchController");
        const ids = await textSearchController({
            path,
            searchString
        });
        if (ids === undefined)
            throw Error("The current path is not supported by the specified FirestoreTextSearchController");
        const promises: Promise<Entity<M> | undefined>[] = ids
            .map(async (entityId) => {
                    try {
                        return await getAndBuildEntity(path, entityId, collection);
                    } catch (e) {
                        console.error(e);
                        return undefined;
                    }
                }
            );
        return Promise.all(promises)
            .then((res) => res.filter((e) => e !== undefined && e.values) as Entity<M>[]);
    }, [getAndBuildEntity]);

    return {

        /**
         * Fetch entities in a Firestore path
         * @param path
         * @param collection
         * @param filter
         * @param limit
         * @param startAfter
         * @param searchString
         * @param orderBy
         * @param order
         * @return Function to cancel subscription
         * @see useCollectionFetch if you need this functionality implemented as a hook
         * @category Firestore
         */
        fetchCollection: useCallback(<M extends Record<string, any>>({
                                                                         path,
                                                                         collection,
                                                                         filter,
                                                                         limit,
                                                                         startAfter,
                                                                         searchString,
                                                                         orderBy,
                                                                         order
                                                                     }: FetchCollectionProps<M>
        ): Promise<Entity<M>[]> => {

            if (searchString) {
                return performTextSearch(path, searchString, collection);
            }

            console.debug("Fetching collection", path, limit, filter, startAfter, orderBy, order);
            const query = buildQuery(path, filter, orderBy, order, startAfter, limit);

            return getDocs(query)
                .then((snapshot) =>
                    snapshot.docs.map((doc) => {
                        const resolvedCollection = resolveCollection<M>({
                            collection,
                            path,
                            values: firestoreToCMSModel(doc.data()),
                            fields
                        });
                        return createEntityFromCollection(doc, path, resolvedCollection);
                    }));
        }, [buildQuery, performTextSearch]),

        /**
         * Listen to a entities in a given path
         * @param path
         * @param collection
         * @param onError
         * @param filter
         * @param limit
         * @param startAfter
         * @param searchString
         * @param orderBy
         * @param order
         * @param onUpdate
         * @return Function to cancel subscription
         * @see useCollectionFetch if you need this functionality implemented as a hook
         * @category Firestore
         */
        listenCollection: useCallback(<M extends Record<string, any>>(
            {
                path,
                collection,
                filter,
                limit,
                startAfter,
                searchString,
                orderBy,
                order,
                onUpdate,
                onError
            }: ListenCollectionProps<M>
        ): () => void => {

            console.debug("Listening collection", {
                path,
                limit,
                filter,
                startAfter,
                orderBy,
                order
            });

            const query = buildQuery(path, filter, orderBy, order, startAfter, limit);

            if (searchString) {
                performTextSearch<M>(path, searchString, collection)
                    .then(onUpdate)
                    .catch((e) => {
                        if (onError) onError(e);
                    });
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return () => {
                };
            }

            const resolvedCollection = resolveCollection<M>({
                collection,
                path,
                fields
            });

            return onSnapshot(query,
                {
                    next: (snapshot) => {
                        onUpdate(snapshot.docs.map((doc) => createEntityFromCollection(doc, path, resolvedCollection)));
                    },
                    error: onError
                }
            );
        }, [buildQuery, performTextSearch]),

        /**
         * Retrieve an entity given a path and a collection
         * @param path
         * @param entityId
         * @param collection
         * @category Firestore
         */
        fetchEntity: useCallback(<M extends Record<string, any>>({
                                                                     path,
                                                                     entityId,
                                                                     collection
                                                                 }: FetchEntityProps<M>
        ): Promise<Entity<M> | undefined> => getAndBuildEntity(path, entityId, collection), [getAndBuildEntity]),

        /**
         *
         * @param path
         * @param entityId
         * @param collection
         * @param onUpdate
         * @param onError
         * @return Function to cancel subscription
         * @category Firestore
         */
        listenEntity: useCallback(<M extends Record<string, any>>(
            {
                path,
                entityId,
                collection,
                onUpdate,
                onError
            }: ListenEntityProps<M>): () => void => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            return onSnapshot(
                doc(firestore, path, entityId),
                {
                    next: (docSnapshot) => {
                        const resolvedCollection = resolveCollection<M>({
                            collection,
                            path,
                            entityId: docSnapshot.id,
                            fields
                        });
                        onUpdate(createEntityFromCollection(docSnapshot, path, resolvedCollection));
                    },
                    error: onError
                }
            );
        }, [firebaseApp]),

        /**
         * Save entity to the specified path. Note that Firestore does not allow
         * undefined values.
         * @param path
         * @param entityId
         * @param values
         * @param schemaId
         * @param collection
         * @param status
         * @category Firestore
         */
        saveEntity: useCallback(<M extends Record<string, any>>(
            {
                path,
                entityId,
                values,
                collection,
                status
            }: SaveEntityProps<M>): Promise<Entity<M>> => {

            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            const resolvedCollection = resolveCollection<M>({
                collection,
                path,
                entityId,
                fields
            });

            const properties: ResolvedProperties<M> = resolvedCollection.properties;
            const collectionReference: CollectionReference = collectionClause(firestore, path);

            const firestoreValues = cmsToFirestoreModel(values, firestore);
            const updatedFirestoreValues: EntityValues<M> = updateDateAutoValues(
                {
                    inputValues: firestoreValues,
                    properties,
                    status,
                    timestampNowValue: serverTimestamp(),
                    setDateToMidnight
                });

            console.debug("Saving entity", path, entityId, updatedFirestoreValues);

            let documentReference: DocumentReference;
            if (entityId)
                documentReference = doc(collectionReference, entityId);
            else
                documentReference = doc(collectionReference);

            return setDoc(documentReference, updatedFirestoreValues, { merge: true })
                .then(() => ({
                    id: documentReference.id,
                    path,
                    values: firestoreToCMSModel(updatedFirestoreValues)
                }));
        }, [firebaseApp]),

        /**
         * Delete an entity
         * @param entity
         * @param collection
         * @category Firestore
         */
        deleteEntity: useCallback(<M extends Record<string, any>>(
            {
                entity
            }: DeleteEntityProps<M>
        ): Promise<void> => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            return deleteDoc(doc(firestore, entity.path, entity.id));
        }, [firebaseApp]),

        /**
         * Check if the given property is unique in the given collection
         * @param path Collection path
         * @param name of the property
         * @param value
         * @param property
         * @param entityId
         * @return `true` if there are no other fields besides the given entity
         * @category Firestore
         */
        checkUniqueField: useCallback((
            path: string,
            name: string,
            value: any,
            property: ResolvedProperty,
            entityId?: string
        ): Promise<boolean> => {

            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            console.debug("Check unique field entity", path, name, value, entityId);

            if (property.dataType === "array") {
                console.error("checkUniqueField received an array");
            }

            if (value === undefined || value === null) {
                return Promise.resolve(true);
            }
            const q = query(collectionClause(firestore, path), whereClause(name, "==", value));
            return getDocs(q)
                .then((snapshots) =>
                    snapshots.docs.filter(doc => doc.id !== entityId).length === 0
                );

        }, [firebaseApp]),

        generateEntityId: useCallback((path: string): string => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");
            const firestore = getFirestore(firebaseApp);
            return doc(collectionClause(firestore, path)).id;
        }, [firebaseApp]),

        countEntities: useCallback(async (path: string): Promise<number> => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");
            const firestore = getFirestore(firebaseApp);
            const coll = collectionClause(firestore, path);
            const snapshot = await getCountFromServer(coll);
            return snapshot.data().count;
        }, [firebaseApp])

    };

}

/**
 * Recursive function that converts Firestore data types into CMS or plain
 * JS types.
 * FireCMS uses Javascript dates internally instead of Firestore timestamps.
 * This makes it easier to interact with the rest of the libraries and
 * bindings.
 * Also, Firestore references are replaced with {@link EntityReference}
 * @param data
 * @category Firestore
 */
export function firestoreToCMSModel(data: any): any
export function firestoreToCMSModel(data: any): any {
    if (data === null || data === undefined) return null;
    if (serverTimestamp().isEqual(data)) {
        return null;
    }
    if (data instanceof Timestamp || (typeof data.toDate === "function" && data.toDate() instanceof Date)) {
        return data.toDate();
    }
    if (data instanceof Date) {
        return data;
    }
    if (data instanceof GeoPoint) {
        return new GeoPoint(data.latitude, data.longitude);
    }
    if (data instanceof DocumentReference) {
        return new EntityReference(data.id, getCMSPathFromFirestorePath(data.path));
    }
    if (Array.isArray(data)) {
        return data.map(firestoreToCMSModel);
    }
    if (typeof data === "object") {
        const result: Record<string, any> = {};
        for (const key of Object.keys(data)) {
            result[key] = firestoreToCMSModel(data[key]);
        }
        return result;
    }
    return data;
}
export function cmsToFirestoreModel(data: any, firestore: Firestore): any {
    if (Array.isArray(data)) {
        return data.map(v => cmsToFirestoreModel(v, firestore));
    } else if (data instanceof EntityReference) {
        return doc(firestore, data.path, data.id);
    } else if (data instanceof GeoPoint) {
        return new FirestoreGeoPoint(data.latitude, data.longitude);
    } else if (data instanceof Date) {
        return Timestamp.fromDate(data);
    } else if (data && typeof data === "object") {
        return Object.entries(data)
            .map(([key, v]) => ({ [key]: cmsToFirestoreModel(v, firestore) }))
            .reduce((a, b) => ({ ...a, ...b }), {});
    }
    return data;
}

/**
 * Remove id from Firestore path
 * @param fsPath
 */
function getCMSPathFromFirestorePath(fsPath: string): string {
    let to = fsPath.lastIndexOf("/");
    to = to === -1 ? fsPath.length : to;
    return fsPath.substring(0, to);
}
