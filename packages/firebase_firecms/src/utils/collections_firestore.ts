import { deleteField, DocumentSnapshot } from "firebase/firestore";
import {
    CMSType,
    COLLECTION_PATH_SEPARATOR,
    makePropertiesEditable,
    PermissionsBuilder,
    Properties,
    PropertiesOrBuilders,
    Property,
    PropertyConfig,
    removeFunctions,
    removePropsIfExisting,
    sortProperties,
    stripCollectionPath
} from "@firecms/core";
import { PersistedCollection } from "@firecms/collection_editor";

export function buildCollectionId(idOrPath: string, parentCollectionIds?: string[]): string {
    if (!parentCollectionIds)
        return stripCollectionPath(idOrPath);
    return [...parentCollectionIds.map(stripCollectionPath), stripCollectionPath(idOrPath)].join(COLLECTION_PATH_SEPARATOR);
}

export function setUndefinedToDelete(data: any): any {
    if (Array.isArray(data)) {
        return data.map(v => setUndefinedToDelete(v));
    } else if (typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => ({ [key]: setUndefinedToDelete(value) }))
            .reduce((a, b) => ({ ...a, ...b }), {});
    } else if (data === undefined) {
        return deleteField();
    }
    return data;
}

export const docsToCollectionTree = (docs: DocumentSnapshot[]): PersistedCollection[] => {

    const collectionsMap = docs.map((doc) => {
        const id: string = doc.id;
        const collection = docToCollection(doc);
        return { [id]: collection };
    }).reduce((a, b) => ({ ...a, ...b }), {});

    const orderedKeys = Object.keys(collectionsMap).sort((a, b) => b.split(COLLECTION_PATH_SEPARATOR).length - a.split(COLLECTION_PATH_SEPARATOR).length);

    orderedKeys.forEach((id) => {
        const collection = collectionsMap[id];
        if (id.includes(COLLECTION_PATH_SEPARATOR)) {
            const parentId = id.split(COLLECTION_PATH_SEPARATOR).slice(0, -1).join(COLLECTION_PATH_SEPARATOR);
            const parentCollection = collectionsMap[parentId];
            if (parentCollection)
                parentCollection.subcollections = [...(parentCollection.subcollections ?? []), collection];
            delete collectionsMap[id];
        }
    });

    return Object.values(collectionsMap);
}

export const docToCollection = (doc: DocumentSnapshot): PersistedCollection => {
    const data = doc.data();
    if (!data)
        throw Error("Entity collection has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};
    makePropertiesEditable(properties);
    const sortedProperties = sortProperties(properties, propertiesOrder);
    return {
        ...data,
        properties: sortedProperties,
        id: data.id ?? data.alias ?? data.path
    } as PersistedCollection;
}

export function prepareCollectionForPersistence<M extends {
    [Key: string]: CMSType
}>(collection: Partial<PersistedCollection<M>>, propertyConfigs: Record<string, PropertyConfig>) {

    const { properties: inputProperties, ...rest } = collection;
    const cleanedProperties = inputProperties ? cleanPropertyConfigs(inputProperties, propertyConfigs) : undefined;
    const properties = cleanedProperties ? setUndefinedToDelete(removeFunctions(cleanedProperties)) : undefined;
    let newCollection: Partial<PersistedCollection> = {};
    if (rest) {
        newCollection = {
            ...rest
        };
    }
    if (properties) {
        newCollection.properties = properties;
    }
    if (rest.propertiesOrder || properties) {
        newCollection.propertiesOrder = removeDuplicates(rest.propertiesOrder ?? Object.keys(properties));
    }

    delete newCollection.permissions;
    if (newCollection.entityViews) {
        newCollection.entityViews = newCollection.entityViews.filter(view => typeof view === "string");
    }
    delete newCollection.editable;
    delete newCollection.additionalFields;
    delete newCollection.callbacks;
    delete newCollection.Actions;
    delete newCollection.entityActions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    delete newCollection.exportable;
    return newCollection;
}

/**
 * If a collection is not applying permissions, we apply the given permissionsBuilder.
 * This is used to apply the role permissions to the collections, unless they are already
 * applying permissions.
 * @param collections
 * @param permissionsBuilder
 */
export const applyPermissionsFunctionIfEmpty = (collections: PersistedCollection[], permissionsBuilder?: PermissionsBuilder): PersistedCollection[] => {

    return collections.map(collection => {
        if (collection.permissions) {
            return collection;
        }
        return ({
            ...collection,
            permissions: permissionsBuilder
        });
    });
}

function cleanPropertyConfigs(properties: PropertiesOrBuilders<any>, propertyConfigs: Record<string, PropertyConfig>) {
    const res: Record<string, Property> = {};
    Object.entries(properties).forEach(([key, property]) => {
        if (typeof property === "object") {

            const config = property.propertyConfig ? propertyConfigs[property.propertyConfig] : undefined;

            let cleanProperty: any;
            if (config?.property) {
                cleanProperty = removePropsIfExisting(property, config?.property);
            } else {
                cleanProperty = property;
            }
            res[key] = { ...cleanProperty };
        }
    });
    return res;
}

function removeDuplicates<T>(array: T[]): T[] {
    return [...new Set(array)];
}
