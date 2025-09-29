import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
    FetchCollectionDelegateProps,
    FetchEntityProps,
    FilterCombination,
    FilterValues,
    GeoPoint,
    ListenCollectionDelegateProps,
    ListenEntityProps,
    ResolvedEntityCollection,
    SaveEntityDelegateProps,
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
} from "@firebase/firestore";
import { FirebaseApp } from "@firebase/app";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types/text_search";
import { useCallback, useEffect, useRef } from "react";
import { localSearchControllerBuilder } from "../utils";
import { getAuth } from "@firebase/auth";

/**
 * @group Firebase
 */
export interface FirestoreDataSourceProps {
    firebaseApp?: FirebaseApp,
    /**
     * You can use this controller to return a list of ids from a search index, given a
     * `path` and a `searchString`.
     */
    textSearchControllerBuilder?: FirestoreTextSearchControllerBuilder,

    /**
     * Fallback to local text search if no text search controller is specified,
     * or if the controller does not support the given path.
     */
    localTextSearchEnabled?: boolean,

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

export type FirestoreDelegate = DataSourceDelegate & {

    initTextSearch: (props: {
        path: string,
        databaseId?: string,
        collection?: EntityCollection | ResolvedEntityCollection
    }) => Promise<boolean>,
}

/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 * @param textSearchControllerBuilder
 * @param collectionRegistry
 * @group Firebase
 */
export function useFirestoreDelegate({
                                         firebaseApp,
                                         textSearchControllerBuilder,
                                         firestoreIndexesBuilder,
                                         localTextSearchEnabled
                                     }: FirestoreDataSourceProps): FirestoreDelegate {

    const searchControllerRef = useRef<FirestoreTextSearchController>();

    useEffect(() => {
        if (!searchControllerRef.current && firebaseApp) {
            if ((textSearchControllerBuilder || localTextSearchEnabled) && !searchControllerRef.current) {
                searchControllerRef.current = buildTextSearchControllerWithLocalSearch({
                    firebaseApp,
                    textSearchControllerBuilder,
                    localTextSearchEnabled: localTextSearchEnabled ?? false
                });
            }
        }
    }, [firebaseApp, localTextSearchEnabled, textSearchControllerBuilder]);

    const buildQuery = useCallback(<M>(path: string,
                                       filter: FilterValues<Extract<keyof M, string>> | undefined,
                                       orderBy: string | undefined,
                                       order: "desc" | "asc" | undefined,
                                       startAfter: any[] | undefined,
                                       limit: number | undefined,
                                       collectionGroup = false,
                                       databaseId?: string) => {

        if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

        const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);
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
                                                                          entityId: string,
                                                                          databaseId?: string
    ): Promise<Entity<M> | undefined> => {
        if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

        const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

        return getDoc(doc(firestore, path, entityId))
            .then((docSnapshot) => {
                if (!docSnapshot.exists()) {
                    return undefined;
                }
                return createEntityFromDocument(docSnapshot, databaseId);
            });
    }, [firebaseApp]);

    const listenEntity = useCallback(<M extends Record<string, any>>(
        {
            path,
            entityId,
            collection,
            onUpdate,
            onError
        }: ListenEntityProps<M>): () => void => {
        if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

        const databaseId = collection?.databaseId;
        const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

        return onSnapshot(
            doc(firestore, path, entityId),
            {
                next: (docSnapshot) => {
                    onUpdate(createEntityFromDocument(docSnapshot, databaseId));
                },
                error: onError
            }
        );
    }, [firebaseApp]);

    const performTextSearch = useCallback(<M extends Record<string, any>>({
                                                                              path,
                                                                              databaseId,
                                                                              searchString,
                                                                              onUpdate
                                                                          }: {
        path: string,
        databaseId?: string,
        searchString: string;
        onUpdate: (entities: Entity<M>[]) => void
    }): () => void => {

        if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

        const textSearchController = searchControllerRef.current;
        if (!textSearchController)
            throw Error("Trying to make text search without specifying a FirestoreTextSearchController");

        let subscriptions: (() => void)[] = [];

        const auth = getAuth(firebaseApp);
        const currentUser = auth.currentUser;

        const search = textSearchController.search({
            path,
            searchString,
            currentUser: currentUser ?? undefined,
            databaseId
        });

        if (!search) {
            throw Error("The current path is not supported by the specified FirestoreTextSearchController");
        }

        search.then((ids) => {
            if (!ids || ids.length === 0) {
                subscriptions = [];
                onUpdate([]);
            }

            const entities: Entity<M>[] = [];
            const addedEntitiesSet = new Set<string>();
            subscriptions = (ids ?? [])
                .map((entityId) => {
                        return listenEntity({
                            path,
                            entityId,
                            onUpdate: (entity: Entity<any>) => {
                                if (entity.values) {
                                    if (!addedEntitiesSet.has(entity.id)) {
                                        addedEntitiesSet.add(entity.id);
                                        entities.push(entity);
                                        onUpdate(entities);
                                    }
                                } else {
                                    addedEntitiesSet.delete(entity.id);
                                    onUpdate([...entities.filter(e => e.id !== entityId)])
                                }
                            }
                        })
                    }
                );
        });

        return () => {
            subscriptions.forEach((p) => p());
        }

    }, [firebaseApp, listenEntity]);

    const cmsToDelegateModel = useCallback((values: any) => {
        if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");
        return cmsToFirestoreModel(values, getFirestore(firebaseApp));
    }, [firebaseApp]);

    return {
        key: "firestore",
        setDateToMidnight,
        delegateToCMSModel: firestoreToCMSModel,
        cmsToDelegateModel,
        currentTime,

        initialised: Boolean(firebaseApp),

        initTextSearch: useCallback(async (props: {
            path: string,
            databaseId?: string,
            collection?: EntityCollection | ResolvedEntityCollection
        }) => {
            console.debug("Init text search controller", searchControllerRef.current, props.path);
            if (!searchControllerRef.current) {
                console.warn("You are trying to use text search, but have not provided a text search controller in `useFirestoreDelegate`. You can also set the flag `localTextSearchEnabled` to use local search in `useFirestoreDelegate`. Local text search can incur in performance issues and higher costs for large datasets.");
                return false;
            }
            try {
                return searchControllerRef.current.init(props);
            } catch (e) {
                console.error("Error initializing text search controller", e);
                return false;
            }
        }, []),

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
         * @group Firestore
         */
        fetchCollection: useCallback(async <M extends Record<string, any>>({
                                                                               path,
                                                                               filter,
                                                                               limit,
                                                                               startAfter,
                                                                               searchString,
                                                                               orderBy,
                                                                               order,
                                                                               collection,
                                                                           }: FetchCollectionDelegateProps<M>
        ): Promise<Entity<M>[]> => {

            const isCollectionGroup = collection?.collectionGroup ?? false;
            const databaseId = collection?.databaseId;
            console.debug("Fetching collection", {
                path,
                limit,
                filter,
                startAfter,
                orderBy,
                order,
                isCollectionGroup
            });
            const query = buildQuery(path, filter, orderBy, order, startAfter, limit, isCollectionGroup, databaseId);

            const snapshot = await getDocs(query);
            return snapshot.docs.map((doc) => createEntityFromDocument(doc, databaseId));
        }, [buildQuery]),

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
         * @group Firestore
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
                collection
            }: ListenCollectionDelegateProps<M>
        ): () => void => {

            console.debug("Listening collection", {
                path,
                searchString,
                limit,
                filter,
                startAfter,
                orderBy,
                order,
                collection
            });

            if (!firebaseApp) {
                throw Error("useFirestoreDelegate Firebase not initialised");
            }

            const isCollectionGroup = collection?.collectionGroup ?? false;
            const databaseId = collection?.databaseId;

            if (searchString) {
                return performTextSearch<M>({
                    path,
                    searchString,
                    onUpdate,
                    databaseId
                });
            }

            const query = buildQuery(path, filter, orderBy, order, startAfter, limit, isCollectionGroup, databaseId);
            return onSnapshot(query,
                {
                    next: (snapshot) => {
                        if (!searchString)
                            onUpdate(snapshot.docs.map((doc) => createEntityFromDocument(doc, databaseId)));
                    },
                    error: onError
                }
            );

        }, [buildQuery, firebaseApp, performTextSearch]),

        /**
         * Retrieve an entity given a path and a collection
         * @param path
         * @param entityId
         * @param collection
         * @group Firestore
         */
        fetchEntity: useCallback(<M extends Record<string, any>>({
                                                                     path,
                                                                     entityId,
                                                                     collection
                                                                 }: FetchEntityProps<M>
        ): Promise<Entity<M> | undefined> => getAndBuildEntity(path, entityId, collection?.databaseId), [getAndBuildEntity]),

        /**
         *
         * @param path
         * @param entityId
         * @param collection
         * @param onUpdate
         * @param onError
         * @return Function to cancel subscription
         * @group Firestore
         */
        listenEntity,

        /**
         * Save entity to the specified path. Note that Firestore does not allow
         * undefined values.
         * @param path
         * @param entityId
         * @param values
         * @param schemaId
         * @param collection
         * @param status
         * @group Firestore
         */
        saveEntity: useCallback(<M extends Record<string, any>>(
            {
                path,
                entityId,
                values,
                collection,
                status
            }: SaveEntityDelegateProps<M>): Promise<Entity<M>> => {

            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

            const databaseId = collection?.databaseId;
            const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

            const collectionReference: CollectionReference = collectionClause(firestore, path);

            console.debug("Saving entity", {
                path,
                entityId,
                values,
                databaseId
            });

            let documentReference: DocumentReference;
            if (entityId) {
                console.log("Saving entity with id", entityId);
                documentReference = doc(collectionReference, entityId);
            } else {
                documentReference = doc(collectionReference);
            }
            return setDoc(documentReference, values, { merge: true })
                .then(() => ({
                    id: documentReference.id,
                    path,
                    values: values as M
                }))
                .catch((error) => {
                    console.error("Error saving entity", error);
                    throw error;

                });
        }, [firebaseApp]),

        /**
         * Delete an entity
         * @param entity
         * @param collection
         * @group Firestore
         */
        deleteEntity: useCallback(<M extends Record<string, any>>(
            {
                entity
            }: DeleteEntityProps<M>
        ): Promise<void> => {
            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

            const databaseId = entity.databaseId;
            const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

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
         * @group Firestore
         */
        checkUniqueField: useCallback(async (
            path: string,
            name: string,
            value: any,
            entityId?: string,
            collection?: EntityCollection<any>
        ): Promise<boolean> => {

            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

            const databaseId = collection?.databaseId;
            const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

            if (value === undefined || value === null) {
                return Promise.resolve(true);
            }
            const q = query(collectionClause(firestore, path), whereClause(name, "==", cmsToFirestoreModel(value, firestore)));
            const snapshot = await getDocs(q);
            return snapshot.docs.filter(doc => doc.id !== entityId).length === 0;

        }, [firebaseApp]),

        generateEntityId: useCallback((path: string): string => {
            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");
            const firestore = getFirestore(firebaseApp);
            return doc(collectionClause(firestore, path)).id;
        }, [firebaseApp]),

        countEntities: useCallback(async ({
                                              path,
                                              filter,
                                              order,
                                              orderBy,
                                              collection
                                          }: FetchCollectionDelegateProps): Promise<number> => {
            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");
            const isCollectionGroup = collection?.collectionGroup ?? false;
            const databaseId = collection?.databaseId;
            const query = buildQuery(path, filter, orderBy, order, undefined, undefined, isCollectionGroup, databaseId);
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

            if (!firebaseApp) throw Error("useFirestoreDelegate Firebase not initialised");

            // If no indexes are defined, we assume the query is valid.
            // If there is no index in Firestore, and error message will be shown
            if (firestoreIndexesBuilder === undefined) return true;

            const indexes = firestoreIndexesBuilder?.({
                path,
                collection
            });

            const sortKey = sortBy ? sortBy[0] : undefined;
            const sortDirection = sortBy ? sortBy[1] : undefined;

            // Order by clause cannot contain a field with an equality filter
            const values: [WhereFilterOp, any][] = Object.values(filterValues) as [WhereFilterOp, any][];

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

const createEntityFromDocument = <M extends Record<string, any>>(
    docSnap: DocumentSnapshot,
    databaseId?: string
): Entity<M> => {
    const values = firestoreToCMSModel(docSnap.data());
    const path = getCMSPathFromFirestorePath(docSnap.ref.path);
    return {
        id: docSnap.id,
        path,
        values,
        databaseId
    };
};

/**
 * Recursive function that converts Firestore data types into CMS or plain
 * JS types.
 * FireCMS uses Javascript dates internally instead of Firestore timestamps.
 * This makes it easier to interact with the rest of the libraries and
 * bindings.
 * Also, Firestore references are replaced with {@link EntityReference}
 * @param data
 * @group Firestore
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
    if (typeof data === "object" && "__type__" in data && data.__type__ === "__vector__") {
        return undefined; // TODO: removing vector for now, since they break when being saved
    }

    if (data instanceof FirestoreGeoPoint) {
        return new GeoPoint(data.latitude, data.longitude);
    }
    if (data instanceof DocumentReference) {
        // @ts-ignore
        const databaseId = data?.firestore?._databaseId?.database;
        return new EntityReference(data.id, getCMSPathFromFirestorePath(data.path), databaseId);
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
    if (!(input instanceof Timestamp)) return input;
    const date = input.toDate();
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
}

export function cmsToFirestoreModel(data: any, firestore: Firestore, inArray = false): any {
    if (data === undefined) {
        return deleteField();
    } else if (data === null) {
        return null;
    } else if (Array.isArray(data)) {
        return data.filter(v => v !== undefined).map(v => cmsToFirestoreModel(v, firestore, true));
    } else if (data.isEntityReference && data.isEntityReference()) {
        const targetFirestore = data.databaseId ? getFirestore(firestore.app, data.databaseId) : firestore;
        return doc(targetFirestore, data.path, data.id);
    } else if (data instanceof GeoPoint) {
        return new FirestoreGeoPoint(data.latitude, data.longitude);
    } else if (data instanceof Date) {
        return Timestamp.fromDate(data);
    } else if (data && typeof data === "object" && "__type__" in data && data.__type__ === "__vector__") {
        return undefined; // TODO: removing vector for now, since they break when being saved
    } else if (data && typeof data === "object") {
        return Object.entries(data)
            .map(([key, v]) => {
                const firestoreModel = cmsToFirestoreModel(v, firestore);
                if (firestoreModel !== undefined)
                    return ({ [key]: firestoreModel });
                else
                    return {};
            })
            .reduce((a, b) => ({ ...a, ...b }), {});
    }
    return data;
}

function currentTime(): any {
    return serverTimestamp();
}

function buildTextSearchControllerWithLocalSearch({
                                                      textSearchControllerBuilder,
                                                      firebaseApp,
                                                      localTextSearchEnabled
                                                  }: {
    textSearchControllerBuilder?: FirestoreTextSearchControllerBuilder,
    firebaseApp: FirebaseApp,
    localTextSearchEnabled: boolean
}): FirestoreTextSearchController | undefined {
    if (!textSearchControllerBuilder && localTextSearchEnabled) {
        console.debug("Using local search only");
        return localSearchControllerBuilder({ firebaseApp });
    }
    if (!localTextSearchEnabled && textSearchControllerBuilder) {
        console.debug("Using external text search only");
        return textSearchControllerBuilder({ firebaseApp });
    }
    if (!textSearchControllerBuilder && !localTextSearchEnabled) {
        return undefined;
    }

    const localSearchController = localSearchControllerBuilder({ firebaseApp })
    const textSearchController = textSearchControllerBuilder!({ firebaseApp });
    return {
        init: async (props: {
            path: string,
            databaseId?: string,
            collection?: EntityCollection | ResolvedEntityCollection
        }) => {
            const b = await textSearchController.init(props);
            if (b) {
                console.debug("External Text search controller supports path", props.path);
                return true;
            }
            if (localTextSearchEnabled)
                return localSearchController.init(props);
            return false;
        },
        search: async (props: {
            searchString: string,
            path: string,
            currentUser?: any,
            databaseId?: string
        }) => {
            const search = await textSearchController.search(props);
            return search ?? await localSearchController.search(props);
        }
    }
}
