import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityReference,
    EntitySchema,
    EntitySchemaResolver,
    EntityValues,
    FetchCollectionProps,
    FetchEntityProps,
    FilterValues,
    GeoPoint,
    ListenCollectionProps,
    ListenEntityProps,
    ResolvedEntitySchema,
    ResolvedProperties,
    ResolvedProperty,
    SaveEntityProps,
    SchemaRegistry,
    WhereFilterOp
} from "../../models";
import {
    computeSchema,
    sanitizeData,
    traverseValues,
    updateAutoValues
} from "../../core/utils";
import {
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    GeoPoint as FirestoreGeoPoint,
    getDoc,
    getDocs,
    getFirestore,
    limit as limitClause,
    onSnapshot,
    orderBy as orderByClause,
    Query,
    query,
    serverTimestamp,
    setDoc,
    startAfter as startAfterClause,
    Timestamp,
    where as whereClause
} from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import { FirestoreTextSearchController } from "../models/text_search";
import { useEffect, useRef } from "react";

/**
 * @category Firebase
 */
export interface FirestoreDataSourceProps {
    firebaseApp?: FirebaseApp,
    textSearchController?: FirestoreTextSearchController,
    schemaRegistry: SchemaRegistry;
}

/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 * @param textSearchController
 * @category Firebase
 */
export function useFirestoreDataSource({
                                           firebaseApp,
                                           textSearchController,
                                           schemaRegistry
                                       }: FirestoreDataSourceProps): DataSource {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);


    /**
     *
     * @param doc
     * @param path
     * @param resolvedSchema
     * @category Firestore
     */
    function createEntityFromSchema<M extends { [Key: string]: any }>
    (
        doc: DocumentSnapshot,
        path: string,
        resolvedSchema: ResolvedEntitySchema<M>
    ): Entity<M> {

        const values = firestoreToCMSModel(doc.data(), resolvedSchema);
        const data = doc.data()
            ? resolvedSchema.properties
                ? sanitizeData(values as EntityValues<M>, resolvedSchema.properties)
                : doc.data()
            : undefined;
        return {
            id: doc.id,
            path: getCMSPathFromFirestorePath(doc.ref.path),
            values: data
        };
    }

    function buildQuery<M>(path: string, filter: FilterValues<Extract<keyof M, string>> | undefined, orderBy: string | undefined, order: "desc" | "asc" | undefined, startAfter: any[] | undefined, limit: number | undefined) {

        if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");

        const collectionReference: Query = collection(firestore, path);

        const queryParams = [];
        if (filter) {
            Object.entries(filter)
                .filter(([_, entry]) => !!entry)
                .forEach(([key, filterParameter]) => {
                    const [op, value] = filterParameter as [WhereFilterOp, any];
                    queryParams.push(whereClause(key, op, cmsToFirestoreModel(value, firestore)));
                });
        }

        if (filter && orderBy && order) {
            Object.entries(filter).forEach(([key, value]) => {
                if (key !== orderBy) {
                    queryParams.push(orderByClause(key, "asc"));
                }
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
    }

    function getAndBuildEntity<M>(path: string,
                                  entityId: string,
                                  schema: EntitySchema<M> | EntitySchemaResolver<M>): Promise<Entity<M> | undefined> {
        if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");

        return getDoc(doc(firestore, path, entityId))
            .then((docSnapshot) => {
                if (!docSnapshot.exists()) {
                    return undefined;
                }
                const resolvedSchema = computeSchema({
                    schemaResolver: schemaRegistry.buildSchemaResolver<M>({
                        schema,
                        path
                    }),
                    entityId: docSnapshot.id
                });
                return createEntityFromSchema(docSnapshot, path, resolvedSchema);
            });
    }

    async function performTextSearch<M>(path: string,
                                        searchString: string,
                                        schema: EntitySchema<M> | EntitySchemaResolver<M>): Promise<Entity<M>[]> {
        if (!textSearchController)
            throw Error("Trying to make text search without specifying a FirestoreTextSearchController");
        const ids = await textSearchController({ path, searchString });
        if (!ids)
            throw Error("The current path is not supported by the specified FirestoreTextSearchController");
        const promises: Promise<Entity<M> | undefined>[] = ids
            .map(async (entityId) => {
                    try {
                        return await getAndBuildEntity(path, entityId, schema);
                    } catch (e) {
                        console.error(e);
                        return undefined;
                    }
                }
            );
        return Promise.all(promises)
            .then((res) => res.filter((e) => e !== undefined && e.values) as Entity<M>[]);
    }

    return {

        /**
         * Fetch entities in a Firestore path
         * @param path
         * @param schema
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
        fetchCollection<M extends { [Key: string]: any }>({
                                                              path,
                                                              schema,
                                                              filter,
                                                              limit,
                                                              startAfter,
                                                              searchString,
                                                              orderBy,
                                                              order
                                                          }: FetchCollectionProps<M>
        ): Promise<Entity<M>[]> {

            if (searchString) {
                return performTextSearch(path, searchString, schema);
            }

            console.debug("Fetching collection", path, limit, filter, startAfter, orderBy, order);
            const query = buildQuery(path, filter, orderBy, order, startAfter, limit);

            const resolvedSchema = computeSchema({
                schemaResolver: schemaRegistry.buildSchemaResolver<M>({
                    schema,
                    path
                })
            });
            return getDocs(query)
                .then((snapshot) =>
                    snapshot.docs.map((doc) => createEntityFromSchema(doc, path, resolvedSchema)));
        },


        /**
         * Listen to a entities in a given path
         * @param path
         * @param schema
         * @param onSnapshot
         * @param onError
         * @param filter
         * @param limit
         * @param startAfter
         * @param orderBy
         * @param order
         * @return Function to cancel subscription
         * @see useCollectionFetch if you need this functionality implemented as a hook
         * @category Firestore
         */
        listenCollection<M extends { [Key: string]: any }>(
            {
                path,
                schema,
                filter,
                limit,
                startAfter,
                searchString,
                orderBy,
                order,
                onUpdate,
                onError
            }: ListenCollectionProps<M>
        ): () => void {

            console.debug("Listening collection", path, limit, filter, startAfter, orderBy, order);

            const query = buildQuery(path, filter, orderBy, order, startAfter, limit);

            if (searchString) {
                performTextSearch(path, searchString, schema)
                    .then(onUpdate)
                    .catch((e) => {
                        if (onError) onError(e);
                    });
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return () => {
                };
            }

            const resolvedSchema = computeSchema({
                schemaResolver: schemaRegistry.buildSchemaResolver<M>({
                    schema,
                    path
                }),
            });

            return onSnapshot(query,
                {
                    next: (snapshot) => {
                        onUpdate(snapshot.docs.map((doc) => createEntityFromSchema(doc, path, resolvedSchema)));
                    },
                    error: onError
                }
            );
        },

        /**
         * Retrieve an entity given a path and a schema
         * @param path
         * @param entityId
         * @param schema
         * @category Firestore
         */
        fetchEntity<M extends { [Key: string]: any }>({
                                                          path,
                                                          entityId,
                                                          schema
                                                      }: FetchEntityProps<M>
        ): Promise<Entity<M> | undefined> {
            return getAndBuildEntity(path, entityId, schema);
        },

        /**
         *
         * @param path
         * @param entityId
         * @param schema
         * @param onUpdate
         * @param onError
         * @return Function to cancel subscription
         * @category Firestore
         */
        listenEntity<M extends { [Key: string]: any }>(
            {
                path,
                entityId,
                schema,
                onUpdate,
                onError
            }: ListenEntityProps<M>): () => void {
            if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");
            // console.debug("Listening entity", path, entityId);
            return onSnapshot(
                doc(firestore, path, entityId),
                {
                    next: (docSnapshot) => {
                        const resolvedSchema = computeSchema({
                            schemaResolver: schemaRegistry.buildSchemaResolver<M>({
                                schema,
                                path
                            }),
                            entityId: docSnapshot.id
                        });
                        onUpdate(createEntityFromSchema(docSnapshot, path, resolvedSchema));
                    },
                    error: onError
                }
            );
        },


        /**
         * Save entity to the specified path. Note that Firestore does not allow
         * undefined values.
         * @param path
         * @param entityId
         * @param values
         * @param schema
         * @param status
         * @category Firestore
         */
        saveEntity: async function <M extends { [Key: string]: any }>(
            {
                path,
                entityId,
                values,
                schema,
                status
            }: SaveEntityProps<M>): Promise<Entity<M>> {

            if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");
            const resolvedSchema = computeSchema({
                schemaResolver: schemaRegistry.buildSchemaResolver<M>({
                    schema,
                    path
                }),
                entityId
            });
            const properties: ResolvedProperties<M> = resolvedSchema.properties;
            const collectionReference: CollectionReference = collection(firestore, path);

            const updatedFirestoreValues: EntityValues<M> = updateAutoValues(
                {
                    inputValues: values,
                    properties,
                    status,
                    timestampNowValue: serverTimestamp(),
                    referenceConverter: (value: EntityReference) => doc(firestore, value.path, value.id),
                    geopointConverter: (value: GeoPoint) => new FirestoreGeoPoint(value.latitude, value.longitude)
                });

            console.debug("Saving entity", path, entityId, updatedFirestoreValues);

            let documentReference: DocumentReference;
            if (entityId)
                documentReference = doc(collectionReference, entityId);
            else
                documentReference = doc(collectionReference);

            return setDoc(documentReference, updatedFirestoreValues, { merge: true }).then(() => ({
                id: documentReference.id,
                path: documentReference.path,
                values: firestoreToCMSModel(updatedFirestoreValues, resolvedSchema) as EntityValues<M>
            }));
        },

        /**
         * Delete an entity
         * @param entity
         * @param schema
         * @category Firestore
         */
        async deleteEntity<M extends { [Key: string]: any }>(
            {
                entity
            }: DeleteEntityProps<M>
        ): Promise<void> {
            if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");
            return deleteDoc(doc(firestore, entity.path, entity.id));
        },

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
        checkUniqueField(
            path: string,
            name: string,
            value: any,
            property: ResolvedProperty,
            entityId?: string
        ): Promise<boolean> {

            if (!firestore) throw Error("useFirestoreDataSource Firestore not initialised");

            console.debug("Check unique field entity", path, name, value, entityId);

            if (property.dataType === "array") {
                console.error("checkUniqueField received an array");
            }

            if (value === undefined || value === null) {
                return Promise.resolve(true);
            }
            const q = query(collection(firestore, path), whereClause(name, "==", value));
            return getDocs(q)
                .then((snapshots) =>
                    snapshots.docs.filter(doc => doc.id !== entityId).length === 0
                );

        }
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
 * @param schema
 * @category Firestore
 */
export function firestoreToCMSModel<M>(data: any, schema: ResolvedEntitySchema<M>): any {
    return traverseValues(data,
        schema.properties,
        (value, property) => {
            if (value === null)
                return null;

            if (serverTimestamp().isEqual(value)) {
                return null;
            }

            if (value instanceof Timestamp && property.dataType === "timestamp") {
                return value.toDate();
            }

            if (value instanceof GeoPoint && property.dataType === "geopoint") {
                return new GeoPoint(value.latitude, value.longitude);
            }

            if (value instanceof DocumentReference && property.dataType === "reference") {
                return new EntityReference(value.id, getCMSPathFromFirestorePath(value.path));
            }

            return value;
        });
}

export function cmsToFirestoreModel(data: any, firestore: Firestore): any {
    if (Array.isArray(data)) {
        return data.map(v => cmsToFirestoreModel(v, firestore));
    } else if (data instanceof EntityReference) {
        return doc(firestore, data.path, data.id);
    } else if (data instanceof GeoPoint) {
        return new FirestoreGeoPoint(data.latitude, data.longitude);
    } else if (typeof data === "object") {
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
