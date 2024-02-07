import { FirebaseApp } from "firebase/app";
import {
    get,
    getDatabase,
    limitToFirst,
    onValue,
    orderByChild,
    orderByKey,
    push,
    query,
    ref,
    remove,
    set,
    startAt
} from "firebase/database";
import { useCallback } from "react";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityReference,
    FetchCollectionDelegateProps,
    FetchEntityProps,
    GeoPoint,
    ListenCollectionDelegateProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/core";

export function useFirebaseRTDBDelegate({ firebaseApp }: { firebaseApp?: FirebaseApp }): DataSourceDelegate {

    const fetchCollection = useCallback(async <M extends Record<string, any>>({
                                                                                  path,
                                                                                  filter,
                                                                                  limit,
                                                                                  startAfter,
                                                                                  orderBy,
                                                                                  order,
                                                                                  searchString
                                                                              }: FetchCollectionDelegateProps<M>): Promise<Entity<M>[]> => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        let dbQuery = query(ref(database, path));

        // Example to apply "limit" and "startAfter"
        if (startAfter !== undefined) {
            dbQuery = query(dbQuery, orderByKey(), startAt(startAfter));
        }
        if (limit !== undefined) {
            dbQuery = query(dbQuery, limitToFirst(limit));
        }

        const snapshot = await get(dbQuery);
        if (snapshot.exists()) {
            return Object.entries(snapshot.val()).map(([id, values]) => ({
                id,
                path,
                values: values as M,
            }));
        }
        return [];
    }, [firebaseApp]);

    const listenCollection = useCallback(<M extends Record<string, any>>({
                                                                             path,
                                                                             onUpdate,
                                                                             // Realtime Database does not directly support onError in onValue
                                                                         }: ListenCollectionDelegateProps<M>): () => void => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        const dbRef = ref(database, path);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const result: Entity<M>[] = Object.entries(snapshot.val()).map(([id, values]) => ({
                    id,
                    path,
                    values: values as M,
                }));
                onUpdate(result);
            } else {
                onUpdate([]);
            }
        });

        return () => unsubscribe();
    }, [firebaseApp]);

    const fetchEntity = useCallback(async <M extends Record<string, any>>({
                                                                              path,
                                                                              entityId,
                                                                          }: FetchEntityProps<M>): Promise<Entity<M> | undefined> => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        const snapshot = await get(ref(database, `${path}/${entityId}`));
        if (snapshot.exists()) {
            return { id: entityId, path, values: snapshot.val() as M };
        }
        return undefined;
    }, [firebaseApp]);

    const listenEntity = useCallback(<M extends Record<string, any>>({
                                                                         path,
                                                                         entityId,
                                                                         onUpdate,
                                                                         onError
                                                                     }: ListenEntityProps<M>): () => void => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        const dbRef = ref(database, `${path}/${entityId}`);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                onUpdate({ id: entityId, path, values: snapshot.val() as M });
            } else {
                onError?.(new Error("Entity does not exist"));
            }
        });

        return () => unsubscribe();
    }, [firebaseApp]);

    const saveEntity = useCallback(async <M extends Record<string, any>>({
                                                                             path,
                                                                             entityId,
                                                                             values,
                                                                         }: SaveEntityProps<M>): Promise<Entity<M>> => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        // If entityId is not provided, a new entity will be created
        const finalId = entityId ?? push(ref(database, path)).key;
        if (!finalId) {
            throw new Error("Could not generate a new id");
        }
        await set(ref(database, `${path}/${finalId}`), values);
        return { id: finalId, path, values: values as M };
    }, [firebaseApp]);

    const deleteEntity = useCallback(async <M extends Record<string, any>>({
                                                                               entity,
                                                                           }: DeleteEntityProps<M>): Promise<void> => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        await remove(ref(database, `${entity.path}/${entity.id}`));
    }, [firebaseApp]);

    // Implementing additional methods required by DataSourceDelegate
    const checkUniqueField = useCallback(async (path: string, name: string, value: any, entityId?: string): Promise<boolean> => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        // Simplified example; the Realtime Database does not support querying with "not equal" conditions
        const dbRef = query(ref(database, path), orderByChild(name), startAt(value), limitToFirst(1));
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            return true;
        }

        // Check if the found entity is the same as the one being checked
        const [key, entityValue] = Object.entries(snapshot.val())[0];
        if (entityValue && typeof entityValue === "object" && (entityValue as any)[name] === value && key === entityId) {
            return true;
        }

        return false;
    }, [firebaseApp]);

    const generateEntityId = useCallback((path: string): string => {
        if (!firebaseApp) {
            throw new Error("Firebase app not provided");
        }
        const database = getDatabase(firebaseApp);

        return push(ref(database, path)).key!;
    }, [firebaseApp]);

    const isFilterCombinationValid = useCallback(({
                                                      path,
                                                      filter,
                                                      sortBy
                                                  }: any): boolean => {
        return false;
    }, []);

    return {
        fetchCollection,
        listenCollection,
        fetchEntity,
        listenEntity,
        saveEntity,
        deleteEntity,
        checkUniqueField,
        generateEntityId,
        isFilterCombinationValid,
        buildReference: (reference: EntityReference) => {
            if (!firebaseApp) {
                throw new Error("Firebase app not provided");
            }
            const database = getDatabase(firebaseApp);
            return ref(database, `${reference.path}/${reference.id}`);
        },
        buildGeoPoint: (geoPoint: GeoPoint) => null,
        currentTime: () => new Date(),
        buildDate: (date: Date) => date,
        buildDeleteFieldValue: () => null,
        delegateToCMSModel,
        setDateToMidnight
    };
}

function setDateToMidnight(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

function delegateToCMSModel(data: any): any {
    if (data === null || data === undefined) return null;

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
