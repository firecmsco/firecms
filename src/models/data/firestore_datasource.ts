import {
    Entity,
    EntityReference,
    EntitySchema,
    EntityValues,
    GeoPoint
} from "../entities";
import { FilterValues, WhereFilterOp } from "../collections";
import { Properties, Property } from "../properties";
import firebase from "firebase/app";
import "firebase/firestore";
import {
    computeSchemaProperties,
    sanitizeData,
    traverseValues,
    updateAutoValues
} from "../utils";
import deepEqual from "deep-equal";
import { DeleteEntityProps, SaveEntityProps } from "./datasource";

export const FirestoreDatasource = {

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
    fetchCollection<M extends { [Key: string]: any }>(
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
                colSnapshot.docs.map((doc) => this.createEntityFromSchema(doc, schema, path)));
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
                        onSnapshot(colSnapshot.docs.map((doc) => this.createEntityFromSchema(doc, schema, path))),
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
    fetchEntity<M extends { [Key: string]: any }>(
        path: string,
        entityId: string,
        schema: EntitySchema<M>
    ): Promise<Entity<M>> {
        console.debug("Fetch entity", path, entityId);

        return firebase.firestore()
            .collection(path)
            .doc(entityId)
            .get()
            .then((docSnapshot) => this.createEntityFromSchema(docSnapshot, schema, path));

    },

    /**
     *
     * @param path
     * @param entityId
     * @param schema
     * @param onSnapshot
     * @param onError
     * @return Function to cancel subscription
     * @category Firestore
     */
    listenEntity<M extends { [Key: string]: any }>(
        path: string,
        entityId: string,
        schema: EntitySchema<M>,
        onSnapshot: (entity: Entity<M>) => void,
        onError?: (error: Error) => void
    ): () => void {
        console.debug("Listening entity", path, entityId);
        return firebase.firestore()
            .collection(path)
            .doc(entityId)
            .onSnapshot(
                (docSnapshot) => onSnapshot(this.createEntityFromSchema(docSnapshot, schema, path)),
                onError
            );
    },

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
    async saveEntity<M extends { [Key: string]: any }>(
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
        }: SaveEntityProps<M>): Promise<void> {
        const properties: Properties<M> = computeSchemaProperties(schema, collectionPath, id);
        let updatedValues: EntityValues<M> = updateAutoValues(
            {
                inputValues: values,
                properties,
                status,
                timestampNowValue: firebase.firestore.FieldValue.serverTimestamp(),
                referenceConverter: (value: EntityReference) => firebase.firestore().collection(value.path).doc(value.id),
                geopointConverter: (value: GeoPoint) => new firebase.firestore.GeoPoint(value.latitude, value.longitude)
            });

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

        const entity: Entity<M> = {
            id: documentReference.id,
            path: documentReference.path,
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
                        status,
                        context
                    });
                }
                if (onSaveFailure) onSaveFailure(e);
            });


    },

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
    async deleteEntity<M extends { [Key: string]: any }>(
        {
            entity,
            schema,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        }: DeleteEntityProps<M>
    ): Promise<boolean> {
        console.debug("Deleting entity", entity.path, entity.id);

        const entityDeleteProps = {
            entity,
            schema,
            id: entity.id,
            collectionPath: entity.path,
            context
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

        return firebase.firestore()
            .collection(entity.path)
            .doc(entity.id)
            .delete().then(() => {
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

    },

    /**
     *
     * @param doc
     * @param schema
     * @param collectionPath
     * @category Firestore
     */
    createEntityFromSchema<M extends { [Key: string]: any }>
    (
        doc: firebase.firestore.DocumentSnapshot,
        schema: EntitySchema<M>,
        collectionPath: string
    ): Entity<M> {

        const data = doc.data() ?
            sanitizeData(this.firestoreToCMSModel(doc.data(), schema, collectionPath) as EntityValues<M>, schema, collectionPath)
            : undefined;
        return {
            id: doc.id,
            path: getCMSPathFromFirestorePath(doc.ref.path),
            values: data
        };
    },


    /**
     * Recursive function that converts Firestore data types into CMS or plain
     * JS types.
     * FireCMS uses Javascript dates internally instead of Firestore timestamps.
     * This makes it easier to interact with the rest of the libraries and
     * bindings.
     * Also, Firestore references are replaced with {@link EntityReference}
     * @param data
     * @param schema
     * @param collectionPath
     * @category Firestore
     */
    firestoreToCMSModel(data: any, schema: EntitySchema<any>, collectionPath: string): any {
        return traverseValues(data,
            computeSchemaProperties(schema, collectionPath),
            (value, property) => {
                if (value === null)
                    return null;

                if (deepEqual(value, firebase.firestore.FieldValue.serverTimestamp())) {
                    return null;
                }

                if (value instanceof firebase.firestore.Timestamp && property.dataType === "timestamp") {
                    return value.toDate();
                }

                if (value instanceof firebase.firestore.GeoPoint && property.dataType === "geopoint") {
                    return new GeoPoint(value.latitude, value.longitude);
                }

                if (value instanceof firebase.firestore.DocumentReference && property.dataType === "reference") {
                    return new EntityReference(value.id, getCMSPathFromFirestorePath(value.path));
                }

                return value;
            });
    }

};

/**
 * Remove id from Firestore path
 * @param fsPath
 */
function getCMSPathFromFirestorePath(fsPath: string): string {
    let to = fsPath.lastIndexOf("/");
    to = to == -1 ? fsPath.length : to;
    return fsPath.substring(0, to);
}
