import firebase from "firebase/app";
import "firebase/firestore";
import deepEqual from "deep-equal";

import { Entity, EntitySchema, EntityStatus, EntityValues } from "./entities";
import {
    Properties,
    Property,
    PropertyOrBuilder
} from "./properties";
import { buildPropertyFrom } from "./builders";
import { CMSAppContext } from "../contexts/CMSAppContext";
import { FilterValues, WhereFilterOp } from "./collections";

/**
 * Listen to a entities in a Firestore path
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
export function listenCollection<M extends { [Key: string]: any }>(
    path: string,
    schema: EntitySchema<M>,
    onSnapshot: (entity: Entity<M>[]) => void,
    onError?: (error: Error) => void,
    filter?: FilterValues<M>,
    limit?: number,
    startAfter?: any[],
    orderBy?: string,
    order?: "desc" | "asc"
): () => void {

    console.debug("Listening collection", path, limit, filter, startAfter, orderBy, order);

    let collectionReference: firebase.firestore.Query = firebase.firestore().collection(path);

    if (filter)
        Object.entries(filter)
            .filter(([_, entry]) => !!entry)
            .forEach(([key, filterParameter]) => {
                const [op, value] = filterParameter as [WhereFilterOp, any];
                return collectionReference = collectionReference.where(key, op, value);
            });

    if (filter && orderBy && order) {
        Object.entries(filter).forEach(([key, value]) => {
            if (key !== orderBy) {
                collectionReference = collectionReference.orderBy(key, "asc");
            }
        });
    }

    if (orderBy && order)
        collectionReference = collectionReference.orderBy(orderBy, order);

    if (startAfter)
        collectionReference = collectionReference
            .startAfter(startAfter);

    if (limit)
        collectionReference = collectionReference
            .limit(limit);

    return collectionReference
        .onSnapshot({
                next: (colSnapshot) =>
                    onSnapshot(colSnapshot.docs.map((doc) => createEntityFromSchema(doc, schema, path))),
                error: onError
            }
        );
}

/**
 * Fetch entities in a Firestore path
 * @param path
 * @param schema
 * @param filter
 * @param limit
 * @param startAfter
 * @param orderBy
 * @param order
 * @return Function to cancel subscription
 * @see useCollectionFetch if you need this functionality implemented as a hook
 * @category Firestore
 */
export function fetchCollection<M extends { [Key: string]: any }>(
    path: string,
    schema: EntitySchema<M>,
    filter?: FilterValues<M>,
    limit?: number,
    startAfter?: any[],
    orderBy?: string,
    order?: "desc" | "asc"
): Promise<Entity<M>[]> {

    console.debug("Fetching collection", path, limit, filter, startAfter, orderBy, order);

    let collectionReference: firebase.firestore.Query = firebase.firestore().collection(path);

    if (filter)
        Object.entries(filter)
            .filter(([_, entry]) => !!entry)
            .forEach(([key, filterParameter]) => {
                const [op, value] = filterParameter as [WhereFilterOp, any];
                return collectionReference = collectionReference.where(key, op, value);
            });

    if (filter && orderBy && order) {
        Object.entries(filter).forEach(([key, value]) => {
            if (key !== orderBy) {
                collectionReference = collectionReference.orderBy(key, "asc");
            }
        });
    }

    if (orderBy && order)
        collectionReference = collectionReference.orderBy(orderBy, order);

    if (startAfter)
        collectionReference = collectionReference
            .startAfter(startAfter);

    if (limit)
        collectionReference = collectionReference
            .limit(limit);

    return collectionReference
        .get()
        .then((colSnapshot) =>
            colSnapshot.docs.map((doc) => createEntityFromSchema(doc, schema, path)));
}

/**
 * Retrieve an entity given a path and a schema
 * @param path
 * @param entityId
 * @param schema
 * @category Firestore
 */
export function fetchEntity<M extends { [Key: string]: any }>(
    path: string,
    entityId: string,
    schema: EntitySchema<M>
): Promise<Entity<M>> {

    console.debug("Fetch entity", path, entityId);

    return firebase.firestore()
        .collection(path)
        .doc(entityId)
        .get()
        .then((docSnapshot) => createEntityFromSchema(docSnapshot, schema, path));
}

/**
 *
 * @param path
 * @param entityId
 * @param schema
 * @param onSnapshot
 * @return Function to cancel subscription
 * @category Firestore
 */
export function listenEntity<M extends { [Key: string]: any }>(
    path: string,
    entityId: string,
    schema: EntitySchema<M>,
    onSnapshot: (entity: Entity<M>) => void
): Function {
    console.debug("Listening entity", path, entityId);
    return firebase.firestore()
        .collection(path)
        .doc(entityId)
        .onSnapshot((docSnapshot) => onSnapshot(createEntityFromSchema(docSnapshot, schema, path)));
}

/**
 *
 * @param ref
 * @param schema
 * @param onSnapshot
 * @return Function to cancel subscription
 * @category Firestore
 */
export function listenEntityFromRef<M extends { [Key: string]: any }>(
    ref: firebase.firestore.DocumentReference,
    schema: EntitySchema<M>,
    onSnapshot: (entity: Entity<M>) => void
): Function {
    return ref.onSnapshot(
        (docSnapshot) => onSnapshot(createEntityFromSchema(docSnapshot, schema, ref.path)));
}

/**
 * FireCMS uses Javascript dates internally instead of Firestore timestamps.
 * This makes it easier to interact with the rest of the libraries and
 * bindings.
 * @param data
 * @category Firestore
 */
export function replaceTimestampsWithDates(data: any): any {

    if (data === null)
        return null;

    if (deepEqual(data, firebase.firestore.FieldValue.serverTimestamp())) {
        return null;
    }

    // TODO: remove when https://github.com/firebase/firebase-js-sdk/issues/4125 is fixed
    if (typeof data === "object" && "firestore" in data && typeof data["firestore"] === "object")
        return data;

    if (data instanceof firebase.firestore.Timestamp) {
        return data.toDate();
    }

    if (data && typeof data === "object"
        && !(data instanceof firebase.firestore.DocumentReference)
        && !(data instanceof firebase.firestore.GeoPoint)) {

        let result: any = {};
        Object.entries(data).forEach(([k, v]) => {
            if (v && v instanceof firebase.firestore.Timestamp) {
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
 * @param collectionPath
 * @category Firestore
 */
function sanitizeData<M extends { [Key: string]: any }>
(
    values: EntityValues<M>,
    schema: EntitySchema<M>,
    collectionPath: string
) {
    let result: any = values;
    Object.entries(computeSchemaProperties(schema, collectionPath))
        .forEach(([key, property]) => {
            if (values && values[key] !== undefined) result[key] = values[key];
            else if ((property as Property).validation?.required) result[key] = null;
        });
    return result;
}

/**
 *
 * @param doc
 * @param schema
 * @param collectionPath
 * @category Firestore
 */
export function createEntityFromSchema<M extends { [Key: string]: any }>
(
    doc: firebase.firestore.DocumentSnapshot,
    schema: EntitySchema<M>,
    collectionPath: string
): Entity<M> {

    const data = doc.data() ?
        sanitizeData(replaceTimestampsWithDates(doc.data()) as EntityValues<M>, schema, collectionPath)
        : undefined;
    return {
        id: doc.id,
        reference: doc.ref,
        values: data
    };
}

/**
 * Save entity to the specified path. Note that Firestore does not allow
 * undefined values.
 * @param collectionPath
 * @param id
 * @param data
 * @param schema
 * @param status
 * @param onSaveSuccess
 * @param onSaveFailure
 * @param onPreSaveHookError
 * @param onSaveSuccessHookError
 * @category Firestore
 */
export async function saveEntity<M extends { [Key: string]: any }>(
    {
        collectionPath,
        id,
        values,
        schema,
        status,
        onSaveSuccess,
        onSaveFailure,
        onPreSaveHookError,
        onSaveSuccessHookError,
        context
    }: {
        collectionPath: string,
        id: string | undefined,
        values: Partial<EntityValues<M>>,
        schema: EntitySchema<M>,
        status: EntityStatus,
        onSaveSuccess?: (entity: Entity<M>) => void,
        onSaveFailure?: (e: Error) => void,
        onPreSaveHookError?: (e: Error) => void,
        onSaveSuccessHookError?: (e: Error) => void;
        context: CMSAppContext;
    }): Promise<void> {

    const properties: Properties<M> = computeSchemaProperties(schema, collectionPath, id);
    let updatedValues: EntityValues<M> = updateAutoValues(values, properties, status);

    if (schema.onPreSave) {
        try {
            updatedValues = await schema.onPreSave({
                schema,
                collectionPath,
                id: id,
                values: updatedValues,
                status,
                context
            });
        } catch (e:any) {
            console.error(e);
            if (onPreSaveHookError)
                onPreSaveHookError(e);
            return;
        }
    }

    console.debug("Saving entity", collectionPath, id, updatedValues);

    let documentReference: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
    if (id)
        documentReference = firebase.firestore()
            .collection(collectionPath)
            .doc(id);
    else
        documentReference = firebase.firestore()
            .collection(collectionPath)
            .doc();

    const entity: Entity<M> = {
        id: documentReference.id,
        reference: documentReference,
        values: updatedValues
    };

    return documentReference
        .set(updatedValues as any, { merge: true })
        .then(() => {
            try {
                if (schema.onSaveSuccess) {
                    schema.onSaveSuccess({
                        schema,
                        collectionPath,
                        id,
                        values: updatedValues,
                        status,
                        context
                    });
                }
            } catch (e:any) {
                if (onSaveSuccessHookError)
                    onSaveSuccessHookError(e);
            }
            onSaveSuccess && onSaveSuccess(entity);
        })
        .catch((e) => {
            if (schema.onSaveFailure) {
                schema.onSaveFailure({
                    schema,
                    collectionPath,
                    id: id,
                    values: updatedValues,
                    status,
                    context
                });
            }
            if (onSaveFailure) onSaveFailure(e);
        });

}

/**
 * Delete an entity
 * @param entity
 * @param schema
 * @param collectionPath
 * @param onDeleteSuccess
 * @param onDeleteFailure
 * @param onPreDeleteHookError
 * @param onDeleteSuccessHookError
 * @param context
 * @return was the whole deletion flow successful
 * @category Firestore
 */
export async function deleteEntity<M extends { [Key: string]: any }>(
    {
        entity,
        schema,
        collectionPath,
        onDeleteSuccess,
        onDeleteFailure,
        onPreDeleteHookError,
        onDeleteSuccessHookError,
        context
    }: {
        entity: Entity<M>;
        collectionPath: string;
        schema: EntitySchema<M>;
        onDeleteSuccess?: (entity: Entity<M>) => void;
        onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
        onPreDeleteHookError?: (entity: Entity<M>, e: Error) => void;
        onDeleteSuccessHookError?: (entity: Entity<M>, e: Error) => void;
        context: CMSAppContext;
    }
): Promise<boolean> {
    console.debug("Deleting entity", entity);

    const entityDeleteProps = {
        id: entity.id,
        entity,
        schema,
        collectionPath,
        context
    };

    if (schema.onPreDelete) {
        try {
            await schema.onPreDelete(entityDeleteProps);
        } catch (e:any) {
            console.error(e);
            if (onPreDeleteHookError)
                onPreDeleteHookError(entity, e);
            return false;
        }
    }

    return entity.reference.delete().then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        try {
            if (schema.onDelete) {
                schema.onDelete(entityDeleteProps);
            }
            return true;
        } catch (e:any) {
            if (onDeleteSuccessHookError)
                onDeleteSuccessHookError(entity, e);
            return false;
        }
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}

/**
 *
 * @param schema
 * @param collectionPath
 * @param entityId
 * @param values
 * @ignore
 */
export function computeSchemaProperties<M extends { [Key: string]: any }>(
    schema: EntitySchema<M>,
    collectionPath: string,
    entityId?: string | undefined,
    values?: Partial<EntityValues<M>>
): Properties<M> {
    return Object.entries(schema.properties)
        .map(([key, propertyOrBuilder]) => {
            return { [key]: buildPropertyFrom(propertyOrBuilder as PropertyOrBuilder<any, M>, values ?? schema.defaultValues ?? {}, collectionPath, entityId) };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties<M>;
}

/**
 * Functions used to set required fields to undefined in the initially created entity
 * @param schema
 * @param collectionPath
 * @param entityId
 * @ignore
 */
export function initEntityValues<M extends { [Key: string]: any }>
(schema: EntitySchema<M>, collectionPath: string, entityId?: string): EntityValues<M> {
    const properties: Properties<M> = computeSchemaProperties(schema, collectionPath, entityId);
    return initWithProperties(properties, schema.defaultValues);
}



function initWithProperties<M extends { [Key: string]: any }>
(properties: Properties<M>, defaultValues?: Partial<EntityValues<M>>): EntityValues<M> {
    return Object.entries(properties)
        .map(([key, property]) => {
            const propertyDefaultValue = defaultValues && key in defaultValues ? (defaultValues as any)[key] : undefined;
            const value = initPropertyValue(key, property as Property, propertyDefaultValue);
            return value === undefined ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

function initPropertyValue(key: string, property: Property, defaultValue: any) {
    let value: any;
    if (property.dataType === "map" && property.properties) {
        value = initWithProperties(property.properties, defaultValue);
    } else if (defaultValue !== undefined) {
        value = defaultValue;
    } else if (property.dataType === "array") {
        value = [];
    } else if (property.dataType === "boolean") {
        value = false;
    } else {
        value = undefined;
    }
    return value;
}

function updateAutoValue(inputValue: any,
                         property: Property,
                         status: EntityStatus): any {

    let value;
    if (property.dataType === "map" && property.properties) {
        value = updateAutoValues(inputValue, property.properties, status);
        if (property.config?.clearMissingValues) {
            value = clearMapMissingValues(inputValue, property.properties);
        }
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => updateAutoValue(e, property.of as Property, status));
        } else {
            value = inputValue;
        }
    } else if (property.dataType === "timestamp") {
        if (status == "existing" && property.autoValue === "on_update") {
            value = firebase.firestore.FieldValue.serverTimestamp();
        } else if ((status == "new" || status == "copy")
            && (property.autoValue === "on_update" || property.autoValue === "on_create")) {
            value = firebase.firestore.FieldValue.serverTimestamp();
        } else {
            value = inputValue;
        }
    } else {
        value = inputValue;
    }

    return value;
}

function clearMapMissingValues<M extends { [Key: string]: any }>
(inputValues: Partial<EntityValues<M>>, properties: Properties<M>): EntityValues<M> {
    return Object.entries(properties)
        .map(([key, _]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            return ({ [key]: inputValue === undefined ? firebase.firestore.FieldValue.delete() : inputValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

function updateAutoValues<M extends { [Key: string]: any }>
(inputValues: Partial<EntityValues<M>>, properties: Properties<M>, status: EntityStatus): EntityValues<M> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = updateAutoValue(inputValue, property as Property, status);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
    return { ...inputValues, ...updatedValues };
}


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
export function checkUniqueField(
    path: string,
    name: string,
    value: any,
    property: Property,
    entityId?: string
): Promise<boolean> {

    console.debug("Check unique field entity", path, name, value, entityId);

    if (property.dataType === "array") {
        console.error();
    }

    if (value === undefined || value === null) {
        return Promise.resolve(true);
    }

    return firebase.firestore()
        .collection(path)
        .where(name, "==", value)
        .get()
        .then((snapshots) =>
            snapshots.docs.filter(doc => doc.id !== entityId).length === 0
        );
}
