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
    removeUndefined,
    sortProperties,
    stripCollectionPath
} from "@firecms/core";
import { PersistedCollection } from "@firecms/collection_editor";

export function buildCollectionPath(path: string, parentPathSegments?: string[]): string {
    if (!parentPathSegments)
        return stripCollectionPath(path);
    return [...parentPathSegments.map(stripCollectionPath), stripCollectionPath(path)].join(COLLECTION_PATH_SEPARATOR);
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
    return { ...data, properties: sortedProperties } as PersistedCollection;
}

export function prepareCollectionForPersistence<M extends { [Key: string]: CMSType }>(collection: PersistedCollection<M>, propertyConfigs: Record<string, PropertyConfig>) {

    const { properties: inputProperties, ...rest } = collection;
    const cleanedProperties = cleanPropertyConfigs(inputProperties, propertyConfigs);
    console.log("cleanedProperties", cleanedProperties)
    const properties = setUndefinedToDelete(removeFunctions(cleanedProperties));
    const newCollection: PersistedCollection = {
        ...removeUndefined(rest),
        properties
    };

    if (newCollection.alias === "")
        delete newCollection.alias;
    delete newCollection.permissions;
    if (newCollection.entityViews) {
        newCollection.entityViews = newCollection.entityViews.filter(view => typeof view === "string");
    }
    delete newCollection.editable;
    delete newCollection.additionalFields;
    delete newCollection.callbacks;
    delete newCollection.Actions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    // @ts-ignore
    delete newCollection.exportable;
    return newCollection;
}

export const applyPermissionsFunction = (collections: PersistedCollection[], permissionsBuilder?: PermissionsBuilder): PersistedCollection[] => {
    return collections.map(collection => ({
        ...collection,
        permissions: permissionsBuilder
    }));
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
