import { firestore } from "firebase/app";
import { Entity, EntitySchema, EntityValues, FilterValues } from "../models";

/**
 * Listen to a entities in a Firestore path
 * @param path
 * @param schema
 * @param onSnapshot
 * @param filter
 * @param limit
 * @param startAfter
 * @param orderBy
 * @param order
 * @return Function to cancel subscription
 */
export function listenCollection<S extends EntitySchema>(
    path: string,
    schema: S,
    onSnapshot: (entity: Entity<S>[]) => void,
    onError?: (error: Error) => void,
    filter?: FilterValues<S>,
    limit?: number,
    startAfter?: any[],
    orderBy?: string,
    order?: "desc" | "asc"
): Function {

    console.log("Listening collection", path, limit, filter, startAfter, orderBy, order);

    let collectionReference: firestore.Query = firestore()
        .collection(path);

    if (filter)
        Object.entries(filter)
            .filter(([_, entry]) => !!entry)
            .forEach(([key, [op, value]]) => collectionReference = collectionReference.where(key, op, value));

    if (orderBy && order)
        collectionReference = collectionReference.orderBy(orderBy, order);

    if (startAfter)
        collectionReference = collectionReference
            .startAfter(startAfter);

    if (limit)
        collectionReference = collectionReference
            .limit(limit);

    return collectionReference
        .onSnapshot((colSnapshot) =>
                onSnapshot(colSnapshot.docs.map((doc) => createEntityFromSchema(doc, schema))),
            onError);
}

/**
 * Retrieve an entity given a path and a schema
 * @param path
 * @param entityId
 * @param schema
 */
export function fetchEntity<S extends EntitySchema>(
    path: string,
    entityId: string,
    schema: S
): Promise<Entity<S>> {

    console.debug("fetch entity", path, entityId);

    return firestore()
        .collection(path)
        .doc(entityId)
        .get()
        .then((docSnapshot) => createEntityFromSchema(docSnapshot, schema));
}

/**
 *
 * @param path
 * @param entityId
 * @param schema
 * @param onSnapshot
 * @return Function to cancel subscription
 */
export function listenEntity<S extends EntitySchema>(
    path: string,
    entityId: string,
    schema: S,
    onSnapshot: (entity: Entity<S>) => void
): Function {
    return firestore()
        .collection(path)
        .doc(entityId)
        .onSnapshot((docSnapshot) => onSnapshot(createEntityFromSchema(docSnapshot, schema)));
}

/**
 *
 * @param ref
 * @param schema
 * @param onSnapshot
 * @return Function to cancel subscription
 */
export function listenEntityFromRef<S extends EntitySchema>(
    ref: firestore.DocumentReference,
    schema: S,
    onSnapshot: (entity: Entity<S>) => void
): Function {
    return ref
        .onSnapshot((docSnapshot) => onSnapshot(createEntityFromSchema(docSnapshot, schema)));
}

/**
 * FireCMS uses Javascript dates internally instead of Firestore timestamps.
 * This makes it easier to interact with the rest of the libraries and
 * bindings.
 * @param data
 */
function replaceTimestampsWithDates(data: any) {

    if (data && typeof data === "object"
        && !(data instanceof firestore.DocumentReference)
        && !(data instanceof firestore.GeoPoint)) {

        let result: any = {};
        Object.entries(data).forEach(([k, v]) => {
            if (v && v instanceof firestore.Timestamp) {
                v = v.toDate();
            } else if (Array.isArray(v)) {
                v = v.map(a => replaceTimestampsWithDates(a));
            } else if (v && typeof v === "object") {
                v = replaceTimestampsWithDates(v);
            }
            result[k] = v;
        });
        return result;
    } else {
        return data;
    }
}

/**
 * Add missing required fields, expected in the schema, to the values of an entity coming from Firestore
 * @param values
 * @param schema
 */
function sanitizeData<S extends EntitySchema>(values: EntityValues<S>, schema: S) {
    let result: any = values;
    Object.entries(schema.properties).forEach(([key, property]) => {
        if (values && values[key]) result[key] = values[key];
        else if (property.validation?.required) result[key] = undefined;
    });
    return result;
}

function createEntityFromSchema<S extends EntitySchema>(doc: firestore.DocumentSnapshot, schema: S): Entity<S> {
    const data = sanitizeData(replaceTimestampsWithDates(doc.data()) as EntityValues<S>, schema);
    return {
        id: doc.id,
        snapshot: doc,
        reference: doc.ref,
        values: data || initEntityValues(schema)
    };
}

/**
 * Functions used to set required fields to undefined in the initially created entity
 * @param schema
 */
export function initEntityValues<S extends EntitySchema>(schema: S): EntityValues<S> {
    return Object.entries(schema.properties)
        .filter(([key, property]) => property.validation?.required)
        .map(([key, property]) => ({ [key]: undefined }))
        .reduce((a: any, b: any) => ({ ...a, ...b }), {});
}

/**
 * Functions used to initialize filter object
 * @param schema
 * @param filterableProperties
 */
export function initFilterValues<S extends EntitySchema>(schema: S, filterableProperties: (keyof S["properties"])[]): FilterValues<S> {
    return filterableProperties
        .map((key) => ({ [key]: undefined }))
        .reduce((a: any, b: any) => ({ ...a, ...b }), {});
}

/**
 * Save entity to the specified path. Note that Firestore does not allow
 * undefined values.
 * @param path
 * @param entityId
 * @param data
 */
export function saveEntity(
    path: string,
    entityId: string | undefined,
    data: { [fieldKey: string]: any }
): Promise<string> {

    console.log("Saving entity", path, entityId, data);

    let documentReference: firestore.DocumentReference<firestore.DocumentData>;
    if (entityId)
        documentReference = firestore()
            .collection(path)
            .doc(entityId);
    else
        documentReference = firestore()
            .collection(path)
            .doc();
    return documentReference
        .set(data, { merge: true })
        .then(() => documentReference.id);
}

/**
 * Delete an entity
 * @param entity
 */
export function deleteEntity(
    entity: Entity<any>
): Promise<void> {
    console.debug("Deleting entity", entity);
    return entity.reference.delete();
}
