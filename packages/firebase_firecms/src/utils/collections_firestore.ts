import { deleteField, DocumentSnapshot } from "@firebase/firestore";
import {
    makePropertiesEditable,
    Properties,
    Property,
    PropertyConfig,
    removeFunctions,
    removePropsIfExisting,
    sortProperties,
} from "@firecms/core";
import { PersistedCollection } from "@firecms/collection_editor";
import { COLLECTION_PATH_SEPARATOR, stripCollectionPath } from "@firecms/common";

export function buildCollectionId(idOrPath: string, parentCollectionIds?: string[]): string {
    if (!parentCollectionIds)
        return stripCollectionPath(idOrPath);
    return [...parentCollectionIds.map(stripCollectionPath), stripCollectionPath(idOrPath)].join(COLLECTION_PATH_SEPARATOR);
}

export function setUndefinedToDelete(data: any): any {
    if (Array.isArray(data)) {
        return data.map(v => setUndefinedToDelete(v));
    } else if (data == null) {
        return null;
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
                parentCollection.subcollections = () => [...(parentCollection.subcollections?.() ?? []), collection];
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
    // Normalize enum values from object format to array format (sorted alphabetically)
    const normalizedProperties = normalizePropertiesEnumValues(properties, true);
    const sortedProperties = sortProperties(normalizedProperties, propertiesOrder);
    return {
        ...data,
        properties: sortedProperties,
        slug: data.id ?? data.alias ?? data.slug
    } as PersistedCollection;
}

export function prepareCollectionForPersistence<M extends {
    [Key: string]: any
}>(collection: Partial<PersistedCollection<M>>, propertyConfigs: Record<string, PropertyConfig>) {

    const {
        properties: inputProperties,
        ...rest
    } = collection;
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
    if (newCollection.entityActions) {
        newCollection.entityActions = newCollection.entityActions.filter(action => typeof action === "string");
    }

    delete newCollection.editable;
    delete newCollection.additionalFields;
    delete newCollection.callbacks;
    delete newCollection.Actions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    delete newCollection.exportable;
    return newCollection;
}

function cleanPropertyConfigs(properties: Properties, propertyConfigs: Record<string, PropertyConfig>) {
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
            delete cleanProperty.editable;

            // Normalize enum values to array format for persistence (preserves order in Firestore)
            if (cleanProperty.enumValues) {
                cleanProperty.enumValues = normalizeEnumValuesToArray(cleanProperty.enumValues, false);
            }
            // Handle array properties with enum values in the "of" property
            if (cleanProperty.dataType === "array" && cleanProperty.of?.enumValues) {
                cleanProperty.of = {
                    ...cleanProperty.of,
                    enumValues: normalizeEnumValuesToArray(cleanProperty.of.enumValues, false)
                };
            }

            res[key] = { ...cleanProperty };
        }
    });
    return res;
}

function removeDuplicates<T>(array: T[]): T[] {
    return [...new Set(array)];
}

/**
 * Converts enum values from object format to array format.
 * Firestore doesn't preserve object key order, so we must use arrays.
 * When enum values are already stored as an array, their order is preserved
 * (this is intentional - users can reorder columns in Kanban view).
 * Only sort alphabetically when converting from legacy object format.
 * @param enumValues - The enum values (object or array format)
 * @param sortObjectFormat - If true, sort by id alphabetically when converting from object format
 * @returns Array of EnumValueConfig objects
 */
function normalizeEnumValuesToArray(
    enumValues: any,
    sortObjectFormat: boolean = false
): any[] {
    if (Array.isArray(enumValues)) {
        // Already an array - preserve order! This order is intentional
        // (e.g., user reordered Kanban columns)
        return enumValues;
    } else if (typeof enumValues === "object" && enumValues !== null) {
        // Convert object to array format
        // Object keys don't have guaranteed order in Firestore, so we sort alphabetically
        const entries = Object.entries(enumValues).map(([id, value]) =>
            typeof value === "string"
                ? {
                    id,
                    label: value
                }
                : {
                    ...(value as object),
                    id
                }
        );
        // Sort alphabetically by id when loading from Firestore object format
        // This is the only case where sorting makes sense, since object key order is not preserved
        if (sortObjectFormat) {
            entries.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        }
        return entries;
    }
    return [];
}

/**
 * Normalizes all enum values in a properties object.
 * @param properties - The properties object to normalize
 * @param sortObjectFormat - If true, sort enum values alphabetically when converting from object format
 * @returns Properties with normalized enum values
 */
function normalizePropertiesEnumValues(
    properties: Properties,
    sortObjectFormat: boolean = false
): Properties {
    const result: Properties = {};
    Object.entries(properties).forEach(([key, property]) => {
        if (typeof property === "object" && property !== null) {
            const normalizedProperty = { ...property } as any;

            // Handle direct enumValues
            if (normalizedProperty.enumValues) {
                normalizedProperty.enumValues = normalizeEnumValuesToArray(
                    normalizedProperty.enumValues,
                    sortObjectFormat
                );
            }

            // Handle array properties with enum values in "of"
            if (normalizedProperty.dataType === "array" && normalizedProperty.of?.enumValues) {
                normalizedProperty.of = {
                    ...normalizedProperty.of,
                    enumValues: normalizeEnumValuesToArray(
                        normalizedProperty.of.enumValues,
                        sortObjectFormat
                    )
                };
            }

            // Handle map properties recursively
            if (normalizedProperty.dataType === "map" && normalizedProperty.properties) {
                normalizedProperty.properties = normalizePropertiesEnumValues(
                    normalizedProperty.properties,
                    sortObjectFormat
                );
            }

            result[key] = normalizedProperty;
        } else {
            result[key] = property;
        }
    });
    return result;
}
