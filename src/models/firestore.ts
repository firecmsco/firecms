import firebase from "firebase/app";
import "firebase/firestore";

import {
    Entity,
    EntitySchema,
    EntityStatus,
    EntityValues,
    FilterValues,
    Properties,
    Property,
    PropertyBuilder,
    PropertyOrBuilder,
    WhereFilterOp
} from "./models";
import { buildProperty } from "./property_builder";

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
 */
export function listenCollection<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    path: string,
    schema: S,
    onSnapshot: (entity: Entity<S, Key>[]) => void,
    onError?: (error: Error) => void,
    filter?: FilterValues<S>,
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
                    onSnapshot(colSnapshot.docs.map((doc) => createEntityFromSchema(doc, schema))),
                error: onError
            }
        );
}

/**
 * Retrieve an entity given a path and a schema
 * @param path
 * @param entityId
 * @param schema
 */
export function fetchEntity<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    path: string,
    entityId: string,
    schema: S
): Promise<Entity<S, Key>> {

    console.debug("Fetch entity", path, entityId);

    return firebase.firestore()
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
export function listenEntity<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    path: string,
    entityId: string,
    schema: S,
    onSnapshot: (entity: Entity<S, Key>) => void
): Function {
    console.debug("Listening entity", path, entityId);
    return firebase.firestore()
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
export function listenEntityFromRef<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    ref: firebase.firestore.DocumentReference,
    schema: S,
    onSnapshot: (entity: Entity<S, Key>) => void
): Function {
    return ref.onSnapshot(
        (docSnapshot) => onSnapshot(createEntityFromSchema(docSnapshot, schema)));
}

/**
 * FireCMS uses Javascript dates internally instead of Firestore timestamps.
 * This makes it easier to interact with the rest of the libraries and
 * bindings.
 * @param data
 */
export function replaceTimestampsWithDates(data: any): any {

    if (data === null)
        return null;

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
 */
function sanitizeData<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>
(
    values: EntityValues<S, Key>,
    schema: S
) {
    let result: any = values;
    Object.entries(schema.properties).forEach(([key, property]) => {
        if (values && values[key]) result[key] = values[key];
        else if ((property as Property).validation?.required) result[key] = null;
    });
    return result;
}

export function createEntityFromSchema<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>
(
    doc: firebase.firestore.DocumentSnapshot,
    schema: S
): Entity<S, Key> {

    const data = doc.data() ?
        sanitizeData(replaceTimestampsWithDates(doc.data()) as EntityValues<S, Key>, schema as EntitySchema)
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
 */
export async function saveEntity<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    {
        collectionPath,
        id,
        values,
        schema,
        status,
        onSaveSuccess,
        onSaveFailure,
        onPreSaveHookError,
        onSaveSuccessHookError
    }: {
        collectionPath: string,
        id: string | undefined,
        values: Partial<EntityValues<S, Key>>,
        schema: S,
        status: EntityStatus,
        onSaveSuccess?: (entity: Entity<S, Key>) => void,
        onSaveFailure?: (e: Error) => void,
        onPreSaveHookError?: (e: Error) => void,
        onSaveSuccessHookError?: (e: Error) => void
    }): Promise<void> {


    const properties: Properties<Key> = computeSchemaProperties(schema, id);
    let updatedValues: EntityValues<S, Key> = updateAutoValues(values, properties, status);

    if (schema.onPreSave) {
        try {
            updatedValues = await schema.onPreSave({
                schema,
                collectionPath,
                id: id,
                values: updatedValues,
                status
            });
        } catch (e) {
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

    const entity: Entity<S, Key> = {
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
                        status
                    });
                }
            } catch (e) {
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
                    status
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
 * @return was the whole deletion flow successful
 */
export async function deleteEntity<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>(
    {
        entity,
        schema,
        collectionPath,
        onDeleteSuccess,
        onDeleteFailure,
        onPreDeleteHookError,
        onDeleteSuccessHookError
    }: {
        entity: Entity<S, Key>,
        collectionPath: string,
        schema: S,
        onDeleteSuccess?: (entity: Entity<S, Key>) => void,
        onDeleteFailure?: (entity: Entity<S, Key>, e: Error) => void,
        onPreDeleteHookError?: (entity: Entity<S, Key>, e: Error) => void,
        onDeleteSuccessHookError?: (entity: Entity<S, Key>, e: Error) => void,
    }
): Promise<boolean> {
    console.debug("Deleting entity", entity);

    const entityDeleteProps = {
        id: entity.id,
        entity,
        schema,
        collectionPath
    };

    if (schema.onPreDelete) {
        try {
            await schema.onPreDelete(entityDeleteProps);
        } catch (e) {
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
        } catch (e) {
            if (onDeleteSuccessHookError)
                onDeleteSuccessHookError(entity, e);
            return false;
        }
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}


export function computeSchemaProperties<S extends EntitySchema<Key>, Key extends string>(
    schema: S,
    entityId?: string | undefined,
    values?: Partial<EntityValues<S, Key>>
): Properties<Key> {
    return Object.entries(schema.properties)
        .map(([key, propertyOrBuilder]) => {
            return { [key]: buildProperty(propertyOrBuilder as PropertyOrBuilder, values ?? schema.defaultValues ?? {}, entityId) };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties<Key>;
}

/**
 * Functions used to set required fields to undefined in the initially created entity
 * @param schema
 * @param entityId
 */
export function initEntityValues<S extends EntitySchema<Key>, Key extends string>
(schema: S, entityId?: string): EntityValues<S, Key> {
    const properties: Properties<Key> = computeSchemaProperties(schema, entityId);
    return initWithProperties(properties, schema.defaultValues);
}

type PropertiesValues<S extends EntitySchema<Key>, Key extends string> = {
    [K in Key]: S["properties"][K] extends Property<infer T> ? T :
        (S["properties"][K] extends PropertyBuilder<S, Key, infer T> ? T : any);
};

function initWithProperties<S extends EntitySchema<Key>,
    P extends Properties<Key>,
    Key extends string = Extract<keyof S["properties"], string>>
(properties: P, defaultValues?: Partial<PropertiesValues<S, Key>>): PropertiesValues<S, Key> {
    return Object.entries(properties)
        .map(([key, property]) => {
            const propertyDefaultValue = defaultValues && key in defaultValues ? defaultValues[key] : null;
            const value = initPropertyValue(key, property as Property<unknown>, propertyDefaultValue);
            return value === null ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as PropertiesValues<any, any>;
}

function initPropertyValue(key: string, property: Property, defaultValue: any) {
    let value: any;
    if (property.dataType === "map") {
        value = initWithProperties(property.properties, defaultValue);
    } else if (defaultValue) {
        value = defaultValue;
    } else if (property.dataType === "array") {
        value = [];
    } else if (property.dataType === "boolean") {
        value = false;
    } else {
        value = null;
    }
    return value;
}

function updateAutoValue(inputValue: any,
                         property: Property,
                         status: EntityStatus): any {

    let value;
    if (property.dataType === "map") {
        value = updateAutoValues(inputValue, property.properties, status);
    } else if (property.dataType === "array") {
        if ("dataType" in property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => updateAutoValue(e, property.of as Property, status));
        } else {
            value = inputValue;
        }

    } else if (property.dataType === "timestamp") {
        if (status == EntityStatus.existing && property.autoValue === "on_update") {
            value = firebase.firestore.FieldValue.serverTimestamp();
        } else if (status == EntityStatus.new || status == EntityStatus.copy && (property.autoValue === "on_update" || property.autoValue === "on_create")) {
            value = firebase.firestore.FieldValue.serverTimestamp();
        } else {
            value = inputValue;
        }
    } else {
        value = inputValue;
    }

    return value;
}

export function updateAutoValues<S extends EntitySchema<Key>,
    P extends Properties<Key>, Key extends string>
(inputValues: Partial<PropertiesValues<S, Key>>, properties: P, status: EntityStatus): PropertiesValues<S, Key> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && inputValues[key];
            const updatedValue = updateAutoValue(inputValue, property as Property, status);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as PropertiesValues<S, Key>;
    return { ...inputValues, ...updatedValues };
}

/**
 * Functions used to initialize filter object
 * @param schema
 * @param filterableProperties
 */
export function initFilterValues<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>
(schema: S, filterableProperties: (keyof S["properties"])[]): FilterValues<S> {
    return filterableProperties
        .map((key) => ({ [key]: undefined }))
        .reduce((a: any, b: any) => ({ ...a, ...b }), {});
}
