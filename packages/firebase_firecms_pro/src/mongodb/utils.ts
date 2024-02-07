import * as Realm from "realm-web";

const isValidArrayIndex = (arr: any[], idx: number | null): boolean => {
    return idx != null && !(idx < 0 || idx >= arr.length);
};

export function addValueAtIndex<T>(arr: T[], idx: number, value: T): T[] {
    if (!isValidArrayIndex(arr, idx) && idx !== arr.length) {
        throw new Error(`Cannot add value. Array index out of bounds.`);
    }
    return [...arr.slice(0, idx), value, ...arr.slice(idx)];
}

export function replaceValueAtIndex<T>(arr: T[], idx: number | null, newValue: T): T[] {
    if (!isValidArrayIndex(arr, idx)) {
        throw new Error(`Cannot replace value. Array index out of bounds.`);
    }
    if(idx === null) {
        return [...arr];
    }
    return [...arr.slice(0, idx), newValue, ...arr.slice(idx + 1)];
}

export function updateValueAtIndex<T>(arr: T[], idx: number, updater: (value: T) => T): T[] {
    if (!isValidArrayIndex(arr, idx)) {
        throw new Error(`Cannot update value. Array index out of bounds.`);
    }
    return [...arr.slice(0, idx), updater(arr[idx]), ...arr.slice(idx + 1)];
}

export function removeValueAtIndex<T>(arr: T[], idx: number): T[] {
    if (!isValidArrayIndex(arr, idx)) {
        throw new Error(`Cannot remove value. Array index out of bounds.`);
    }
    return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
}

export interface EntityType {
    id: Realm.BSON.ObjectId | string;
}

export const createObjectId = (): Realm.BSON.ObjectId => {
    return new Realm.BSON.ObjectId()
};

export const getEntityId = (entity: EntityType) => {
    if (entity.id instanceof Realm.BSON.ObjectId) {
        return entity.id.toString();
    }
    return entity.id;
};

export const isSameEntity = (entity1: EntityType, entity2: EntityType): boolean =>
    getEntityId(entity1) === getEntityId(entity2);

export const getEntityIndex = (entities: EntityType[], entity: EntityType): number | null => {
    const idx = entities.findIndex((t) => isSameEntity(t, entity));
    return idx >= 0 ? idx : null;
}
