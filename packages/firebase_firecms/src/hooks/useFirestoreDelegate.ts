import {
    DataSource,
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
    FetchCollectionDelegateProps,
    FetchEntityProps,
    FilterCombination,
    FilterValues,
    GeoPoint, ListenCollectionDelegateProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps,
    WhereFilterOp
} from "@firecms/core";
import {
    collection as collectionClause,
    collectionGroup as collectionGroupClause,
    CollectionReference,
    deleteDoc,
    deleteField,
    doc,
    DocumentReference,
    DocumentSnapshot,
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
import { cmsToFirestoreModel } from "./useFirestoreDataSource";

/**
 * @category Firebase
 */
export interface FirestoreDataSourceProps {
    firebaseApp?: FirebaseApp,
    textSearchController?: FirestoreTextSearchController,

    /**
     * Use this builder to indicate which indexes are available in your
     * Firestore database. This is used to allow filtering and sorting
     * for multiple fields in the CMS.
     */
    firestoreIndexesBuilder?: FirestoreIndexesBuilder;
}

export type FirestoreIndexesBuilder = (params: {
    path: string,
    collection: EntityCollection<any>,
}) => FilterCombination<string>[] | undefined

/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 * @param textSearchController
 * @param collectionRegistry
 * @category Firebase
 */
export function useFirestoreDelegate({
                                         firebaseApp,
                                         textSearchController,
                                         firestoreIndexesBuilder
                                     }: FirestoreDataSourceProps): DataSourceDelegate {

    const createEntityFromCollection = useCallback(<M extends Record<string, any>>(
        docSnap: DocumentSnapshot,
    ): Entity<M> => {

        const values = firestoreToCMSModel(docSnap.data());
        return {
            id: docSnap.id,
            path: getCMSPathFromFirestorePath(docSnap.ref.path),
            values
        };
    }, []);

    const buildQuery = useCallback(<M>(path: string,
                                       filter: FilterValues<Extract<keyof M, string>> | undefined,
                                       orderBy: string | undefined,
                                       order: "desc" | "asc" | undefined,
                                       startAfter: any[] | undefined,
                                       limit: number | undefined,
                                       collectionGroup = false) => {

        if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

        const firestore = getFirestore(firebaseApp);
        const collectionReference: Query = collectionGroup ? collectionGroupClause(firestore, path) : collectionClause(firestore, path);

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
                                                                          entityId: string
    ): Promise<Entity<M> | undefined> => {
        if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

        const firestore = getFirestore(firebaseApp);

        return getDoc(doc(firestore, path, entityId))
            .then((docSnapshot) => {
                if (!docSnapshot.exists()) {
                    return undefined;
                }
                return createEntityFromCollection(docSnapshot);
            });
    }, [firebaseApp]);

    const performTextSearch = useCallback(async <M extends Record<string, any>>(path: string,
                                                                                searchString: string): Promise<Entity<M>[]> => {
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
                        return await getAndBuildEntity(path, entityId);
                    } catch (e) {
                        console.error(e);
                        return undefined;
                    }
                }
            );
        return Promise.all(promises)
            .then((res) => res.filter((e) => e !== undefined && e.values) as Entity<M>[]);
    }, [getAndBuildEntity, textSearchController]);

    function delegateToCMSModel(data: any): any {
        if (data === null || data === undefined) return null;
        if (deleteField().isEqual(data)) {
            return undefined;
        }
        if (serverTimestamp().isEqual(data)) {
            return null;
        }
        if (data instanceof Timestamp || (typeof data.toDate === "function" && data.toDate() instanceof Date)) {
            return data.toDate();
        }
        if (data instanceof Date) {
            return data;
        }
        if (data instanceof FirestoreGeoPoint) {
            return new GeoPoint(data.latitude, data.longitude);
        }
        if (data instanceof DocumentReference) {
            return new EntityReference(data.id, getCMSPathFromFirestorePath(data.path));
        }
        if (Array.isArray(data)) {
            return data.map(delegateToCMSModel).filter(v => v !== undefined);
        }
        if (typeof data === "object") {
            const result: Record<string, any> = {};
            for (const key of Object.keys(data)) {
                const childValue = delegateToCMSModel(data[key]);
                if (childValue !== undefined)
                    result[key] = childValue;
            }
            return result;
        }
        return data;
    }

    return {
        setDateToMidnight: (input?: any) => {
            return setDateToMidnight(input);
        },
        delegateToCMSModel,
        buildDate(date: Date): any {
            return Timestamp.fromDate(date);
        },
        buildDeleteFieldValue(): any {
            return deleteField();
        },
        currentTime(): any {
            return serverTimestamp();
        },
        buildGeoPoint(geoPoint: GeoPoint): any {
            return new FirestoreGeoPoint(geoPoint.latitude, geoPoint.longitude)
        },
        buildReference(reference: EntityReference): any {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");
            const firestore = getFirestore(firebaseApp);
            return doc(firestore, reference.path, reference.id);
        },

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
                                                                         filter,
                                                                         limit,
                                                                         startAfter,
                                                                         searchString,
                                                                         orderBy,
                                                                         order,
                                                                         isCollectionGroup
                                                                     }: FetchCollectionDelegateProps<M>
        ): Promise<Entity<M>[]> => {

            if (searchString) {
                return performTextSearch(path, searchString,);
            }

            console.debug("Fetching collection", {
                path,
                limit,
                filter,
                startAfter,
                orderBy,
                order,
                isCollectionGroup
            });
            const query = buildQuery(path, filter, orderBy, order, startAfter, limit, isCollectionGroup);

            return getDocs(query)
                .then((snapshot) =>
                    snapshot.docs.map((doc) => {
                        return createEntityFromCollection(doc);
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
                filter,
                limit,
                startAfter,
                searchString,
                orderBy,
                order,
                onUpdate,
                onError,
                isCollectionGroup
            }: ListenCollectionDelegateProps<M>
        ): () => void => {

            console.debug("Listening collection", {
                path,
                isCollectionGroup,
                limit,
                filter,
                startAfter,
                orderBy,
                order
            });

            const query = buildQuery(path, filter, orderBy, order, startAfter, limit, isCollectionGroup);

            if (searchString) {
                performTextSearch<M>(path, searchString)
                    .then(onUpdate)
                    .catch((e) => {
                        if (onError) onError(e);
                    });
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return () => {
                };
            }

            return onSnapshot(query,
                {
                    next: (snapshot) => {
                        onUpdate(snapshot.docs.map((doc) => createEntityFromCollection(doc)));
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
                                                                     entityId
                                                                 }: FetchEntityProps<M>
        ): Promise<Entity<M> | undefined> => getAndBuildEntity(path, entityId), [getAndBuildEntity]),

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
                        onUpdate(createEntityFromCollection(docSnapshot));
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
                status
            }: SaveEntityProps<M>): Promise<Entity<M>> => {

            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            const collectionReference: CollectionReference = collectionClause(firestore, path);

            console.debug("Saving entity", path, entityId, values);

            let documentReference: DocumentReference;
            if (entityId)
                documentReference = doc(collectionReference, entityId);
            else
                documentReference = doc(collectionReference);

            return setDoc(documentReference, values, { merge: true })
                .then(() => ({
                    id: documentReference.id,
                    path,
                    values: values as M
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
            entityId?: string
        ): Promise<boolean> => {

            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const firestore = getFirestore(firebaseApp);

            console.debug("Check unique field entity", path, name, value, entityId);

            if (value === undefined || value === null) {
                return Promise.resolve(true);
            }
            const q = query(collectionClause(firestore, path), whereClause(name, "==", cmsToFirestoreModel(value, firestore)));
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

        countEntities: useCallback(async ({
                                              path,
                                              filter,
                                              order,
                                              orderBy,
            isCollectionGroup
                                          }: {
            path: string,
            filter?: FilterValues<Extract<keyof any, string>>,
            orderBy?: string,
            order?: "desc" | "asc",
            isCollectionGroup?: boolean
        }): Promise<number> => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");
            const query = buildQuery(path, filter, orderBy, order, undefined, undefined, isCollectionGroup);
            const snapshot = await getCountFromServer(query);
            return snapshot.data().count;
        }, [firebaseApp]),

        isFilterCombinationValid: useCallback(({
                                                   path,
                                                   collection,
                                                   filterValues,
                                                   sortBy
                                               }: {
            path: string,
            collection: EntityCollection<any>,
            filterValues: FilterValues<any>,
            sortBy?: [string, "asc" | "desc"]
        }): boolean => {
            if (!firebaseApp) throw Error("useFirestoreDataSource Firebase not initialised");

            const indexes = firestoreIndexesBuilder?.({
                path,
                collection
            });

            const sortKey = sortBy ? sortBy[0] : undefined;
            const sortDirection = sortBy ? sortBy[1] : undefined;

            // Order by clause cannot contain a field with an equality filter
            const values: [WhereFilterOp, any][] = Object.values(filterValues) as [WhereFilterOp, any][];
            if (sortKey && values.map((v) => v[0]).includes("==")) {
                return false;
            }

            const filterKeys = Object.keys(filterValues);
            const filtersCount = filterKeys.length;

            if (!sortKey && values.every((v) => v[0] === "==")) {
                return true;
            }

            if (filtersCount === 1 && (!sortKey || sortKey === filterKeys[0])) {
                return true;
            }

            if (!indexes && filtersCount > 1) {
                return false;
            }

            return !!indexes && indexes
                .filter((compositeIndex) => !sortKey || sortKey in compositeIndex)
                .find((compositeIndex) =>
                    Object.entries(filterValues).every(([key, value]) => compositeIndex[key] !== undefined && (!sortDirection || compositeIndex[key] === sortDirection))
                ) !== undefined;
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
export function firestoreToCMSModel(data: any): any {
    if (data === null || data === undefined) return null;
    if (deleteField().isEqual(data)) {
        return undefined;
    }
    if (serverTimestamp().isEqual(data)) {
        return null;
    }
    if (data instanceof Timestamp || (typeof data.toDate === "function" && data.toDate() instanceof Date)) {
        return data.toDate();
    }
    if (data instanceof Date) {
        return data;
    }
    if (data instanceof FirestoreGeoPoint) {
        return new GeoPoint(data.latitude, data.longitude);
    }
    if (data instanceof DocumentReference) {
        return new EntityReference(data.id, getCMSPathFromFirestorePath(data.path));
    }
    if (Array.isArray(data)) {
        return data.map(firestoreToCMSModel).filter(v => v !== undefined);
    }
    if (typeof data === "object") {
        const result: Record<string, any> = {};
        for (const key of Object.keys(data)) {
            const childValue = firestoreToCMSModel(data[key]);
            if (childValue !== undefined)
                result[key] = childValue;
        }
        return result;
    }
    return data;
}

// export function cmsToFirestoreModel(data: any, firestore: Firestore): any {
//     if (data === undefined) {
//         return deleteField();
//     } else if (Array.isArray(data)) {
//         return data.map(v => cmsToFirestoreModel(v, firestore));
//     } else if (data instanceof EntityReference) {
//         return doc(firestore, data.path, data.id);
//     } else if (data instanceof GeoPoint) {
//         return new FirestoreGeoPoint(data.latitude, data.longitude);
//     } else if (data instanceof Date) {
//         return Timestamp.fromDate(data);
//     } else if (data && typeof data === "object") {
//         return Object.entries(data)
//             .map(([key, v]) => ({ [key]: cmsToFirestoreModel(v, firestore) }))
//             .reduce((a, b) => ({ ...a, ...b }), {});
//     }
//     return data;
// }

/**
 * Remove id from Firestore path
 * @param fsPath
 */
function getCMSPathFromFirestorePath(fsPath: string): string {
    let to = fsPath.lastIndexOf("/");
    to = to === -1 ? fsPath.length : to;
    return fsPath.substring(0, to);
}

function setDateToMidnight(input?: Timestamp): Timestamp | undefined {
    if (!input) return input;
    const date = input.toDate();
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
}
