import { useCallback } from "react";

import { App, BSON } from "realm-web";
import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    EntityReference,
    EntityValues,
    FetchCollectionProps,
    FetchEntityProps,
    PropertyConfig,
    FilterValues,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps,
    WhereFilterOp
} from "@firecms/core";
import {
    addValueAtIndex,
    getEntityIndex,
    removeValueAtIndex,
    replaceValueAtIndex,
    updateValueAtIndex
} from "./utils";

type ChangeEvent = any;


/**
 *
 */
export interface UseMongoDataSourceProps {
    app: App,
    cluster: string,
    dbName: string,
    fields?: Record<string, PropertyConfig>;
}

const firecmsToMongoDB: Record<WhereFilterOp, string> = {
    "<": "$lt",
    "<=": "$lte",
    "==": "$eq",
    "!=": "$ne",
    ">=": "$gte",
    ">": "$gt",
    "array-contains": "$eq",
    "array-contains-any": "in",
    "in": "$in",
    "not-in": "$nin", // Please note the semantic difference
    // "array-contains-any": ??? // There's no MongoDB equivalent
};


/**
 * Use this hook to build a {@link DataSource} based on Firestore
 * @param firebaseApp
 *
 */
export function useMongoDataSource({
                                       app,
                                       cluster,
                                       dbName,
                                   }: UseMongoDataSourceProps): DataSource {


    const buildQuery = useCallback((
        filter: FilterValues<any> | undefined,
        searchString?: string,
        orderBy?: string,
        order?: "desc" | "asc",
        limit?: number): [Realm.Services.MongoDB.Filter, Realm.Services.MongoDB.FindOptions] => {

        const queryParams: Realm.Services.MongoDB.Filter = {};
        if (filter) {
            Object.entries(filter).forEach(([key, filterParameter]) => {
                const [op, value] = filterParameter as [WhereFilterOp, any];
                const opMongo = firecmsToMongoDB[op];
                queryParams[key] = { [opMongo]: value };
            });
        }

        // if (searchString) {
        //     queryParams['$text'] = { $search: searchString };
        // }

        const options: Realm.Services.MongoDB.FindOptions = {};
        if (orderBy && order) {
            // @ts-ignore
            options['sort'] = { [orderBy]: (order === 'desc' ? -1 : 1) };
        }

        if (limit) {
            // @ts-ignore
            options['limit'] = limit;
        }

        return [queryParams, options];
    }, []);


    const fetchCollection = useCallback(async <M extends Record<string, any>>({
                                                                                  path,
                                                                                  collection,
                                                                                  filter,
                                                                                  limit,
                                                                                  searchString,
                                                                                  orderBy,
                                                                                  order
                                                                              }: FetchCollectionProps<M>
    ): Promise<Entity<M>[]> => {

        if (!app?.currentUser)
            throw Error("useMongoDataSource app not initialised");

        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(path);

        const [queryParams, options] = buildQuery(filter, searchString, orderBy, order, limit);

        if (searchString) {
            const res = await mongoCollection.aggregate([
                {
                    $search: {
                        "text": {
                            "query": searchString,
                            "path": { "wildcard": "*" },
                            "fuzzy": {}
                        }
                    },

                },
                {
                    $match: queryParams
                }
            ]);
            return res.map((doc: any) => mongoToEntity(doc, path));
        }

        const fetchedDocs = await mongoCollection.find(queryParams, options);
        return fetchedDocs.map((doc) => mongoToEntity(doc, path));
    }, [app, buildQuery, cluster, dbName]);

    const fetchEntity = useCallback(async <M extends Record<string, any>>({
                                                                              path,
                                                                              entityId,
                                                                              collection
                                                                          }: FetchEntityProps<M>
    ): Promise<Entity<M> | undefined> => {
        if (!app?.currentUser) throw Error("useMongoDataSource app not initialised");
        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(path);
        const doc = await mongoCollection
            .findOne({
                _id: new BSON.ObjectId(entityId)
            });
        if (!doc) return undefined;
        return mongoToEntity(doc, path);
    }, [app.currentUser, cluster, dbName]);

    const saveEntity = useCallback(async <M extends Record<string, any>>(
        {
            path,
            entityId,
            values,
            collection,
            status
        }: SaveEntityProps<M>): Promise<Entity<M>> => {
        if (!app?.currentUser) throw Error("useMongoDataSource app not initialised");
        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(path);
        const mongoValues = valuesToMongoValues(values);
        if (status === "existing") {
            await mongoCollection
                .updateOne({
                    _id: new BSON.ObjectId(entityId)
                }, {
                    $set: mongoValues
                });
            return {
                id: entityId as string,
                path: path,
                values: values as M
            };
        }
        const res = await mongoCollection
            .insertOne({
                _id: new BSON.ObjectId(entityId),
                ...mongoValues
            });
        return {
            id: res.insertedId.toString(),
            path: path,
            values: values as M
        };
    }, [app.currentUser, cluster, dbName]);

    const listenEntity = useCallback(<M extends Record<string, any>>(
        {
            path,
            entityId,
            collection,
            onUpdate,
            onError
        }: ListenEntityProps<M>): () => void => {


        // TODO
        fetchEntity({ path, entityId, collection }).then((entity) => {
            console.log("fetchEntity entity", { path, entityId, collection, entity });
            if (entity)
                onUpdate(entity);
            if (!entity)
                onError?.(new Error("Entity not found"));
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {
        }
    }, [fetchEntity]);

    const listenCollection = useCallback(<M extends Record<string, any>>(
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
            onError,
        }: ListenCollectionProps<M>
    ): () => void => {

        if (!app?.currentUser) throw Error("useMongoDataSource app not initialised");
        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(path);

        let currentEntities: Entity<M>[] = [];

        const updateCurrentEntities = (entities: Entity<M>[]) => {
            currentEntities = entities;
            onUpdate(entities);
        }

        let stream: AsyncGenerator<ChangeEvent> | undefined = undefined;

        fetchCollection({
            path,
            collection,
            filter,
            limit,
            startAfter,
            searchString,
            orderBy,
            order
        }).then(updateCurrentEntities)
            .catch(onError)

        const onDocDelete = (change: ChangeEvent) => {
            const idx = getEntityIndex(currentEntities, { id: change.documentKey._id });
            if (idx && idx >= 0) {
                updateCurrentEntities(removeValueAtIndex(currentEntities, idx));
            }
        };
        const onDocInsert = (change: ChangeEvent) => {
            const entity = mongoToEntity(change.fullDocument, path);
            const idx =
                getEntityIndex(currentEntities, entity) ?? currentEntities.length;
            if (idx === currentEntities.length) {
                const updatedEntities = addValueAtIndex(currentEntities, idx, entity);
                updateCurrentEntities(updatedEntities);
            }
        };
        const onDocReplace = (change: ChangeEvent) => {
            const entity = mongoToEntity(change.fullDocument, path);
            const idx = getEntityIndex(currentEntities, entity);
            updateCurrentEntities(replaceValueAtIndex(currentEntities, idx, entity));
        };

        const onDocUpdate = (change: ChangeEvent) => {
            const entity = mongoToEntity(change.fullDocument, path);
            const idx = getEntityIndex(currentEntities, entity);
            if (idx === null) return;
            updateCurrentEntities(updateValueAtIndex(currentEntities, idx, () => {
                return entity;
            }));
        };
        const watchCollection = async () => {
            const [queryParams, options] = buildQuery(filter, searchString, orderBy, order, limit);
            stream = mongoCollection.watch(queryParams);
            for await (const change of stream) {
                switch (change.operationType) {
                    case "insert": {
                        onDocInsert(change);
                        break;
                    }
                    case "update": {
                        onDocUpdate(change);
                        break;
                    }
                    case "replace": {
                        onDocReplace(change);
                        break;
                    }
                    case "delete": {
                        onDocDelete(change);
                        break;
                    }
                    default: {
                        // change.operationType will always be one of the specified cases, so we should never hit this default
                        throw new Error(
                            `Invalid change operation type: ${change.operationType}`
                        );
                    }
                }
            }
        };
        watchCollection();
        return () => {
            // @ts-ignore
            stream?.return();
        }
    }, [app.currentUser, cluster, dbName, fetchCollection]);

    const generateEntityId = useCallback((path: string): string => {
        return new BSON.ObjectId().toString();
    }, []);

    const deleteEntity = useCallback(async <M extends Record<string, any>>(
        {
            entity
        }: DeleteEntityProps<M>
    ): Promise<void> => {
        if (!app?.currentUser) throw Error("useMongoDataSource app not initialised");
        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(entity.path);
        const res = await mongoCollection
            .deleteOne({
                _id: entity.id
            });
        if (res.deletedCount === 0) {
            console.error("No entities were deleted", res);
            throw Error("No entities were deleted");
        }
        return;

    }, [app.currentUser, cluster, dbName]);

    const countEntities = useCallback(async (props: {
        path: string,
        collection: EntityCollection<any>
        onCountUpdate?: (count: number) => void
    }): Promise<number> => {
        if (!app?.currentUser) throw Error("useMongoDataSource app not initialised");
        const mdb = app.currentUser.mongoClient(cluster);
        const mongoCollection = mdb.db(dbName).collection(props.path);
        return mongoCollection.count();
    }, [app.currentUser, cluster, dbName]);

    const checkUniqueField = useCallback((
        path: string,
        name: string,
        value: any,
        entityId?: string
    ): Promise<boolean> => {
        throw Error("checkUniqueField not implemented");
    }, []);

    return {

        /**
         * Check if the given property is unique in the given collection
         * @param path Collection path
         * @param name of the property
         * @param value
         * @param property
         * @param entityId
         * @return `true` if there are no other fields besides the given entity
         *
         */
        checkUniqueField: checkUniqueField,

        countEntities: countEntities,

        /**
         * Delete an entity
         * @param entity
         * @param collection
         *
         */
        deleteEntity: deleteEntity,

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
         *
         */
        fetchCollection: fetchCollection,

        /**
         * Retrieve an entity given a path and a collection
         * @param path
         * @param entityId
         * @param collection
         *
         */
        fetchEntity: fetchEntity,

        generateEntityId: generateEntityId,

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
         *
         */
        listenCollection: listenCollection,

        /**
         *
         * @param path
         * @param entityId
         * @param collection
         * @param onUpdate
         * @param onError
         * @return Function to cancel subscription
         *
         */
        listenEntity: listenEntity,

        /**
         * Save entity to the specified path. Note that Firestore does not allow
         * undefined values.
         * @param path
         * @param entityId
         * @param values
         * @param schemaId
         * @param collection
         * @param status
         *
         */
        saveEntity: saveEntity

    };

}

const mongoToEntity = (doc: any, path: string): Entity<any> => {
    const { _id, ...data } = doc;
    return {
        id: _id.toString(),
        path: path,
        values: parseObject(data)
    };
};

const parseObject = (values: object): object => {
    return Object
        .entries(values)
        .map(([k, v]) => ({ [k]: parseData(v) }))
        .reduce((a, b) => ({ ...a, ...b }), {});
}

function parseData(value: unknown): any {

    if (typeof value !== "object" || value === null) return value;
    if (Array.isArray(value)) return value.map(parseData);

    if (typeof value === "object") {
        if (value instanceof Date) {
            return value;
        }
        if ("path" in value && "id" in value && typeof value.path === "string") {
            return new EntityReference((value.id as any).toString(), value.path);
        }
        return parseObject(value);
    }
    return value;
}


function valuesToMongoValues(values: EntityValues<any>) {
    return Object.entries(values)
        .map(([key, value]) => ({ [key]: valueToMongoValue(value) }))
        .reduce((a, b) => ({ ...a, ...b }), {});
}

function valueToMongoValue(value: any): any {
    if(value === null)
        return null;
    if (value.isEntityReference && value.isEntityReference()) {
        return {
            id: new BSON.ObjectId(value.id),
            path: value.path
        };
    }
    if (typeof value !== "object" || value === null) return value;
    if (Array.isArray(value)) return value.map(valueToMongoValue);
    if (typeof value === "object") {
        if (value instanceof Date) {
            return value;
        }
        return valuesToMongoValues(value);
    }
    return value;
}

