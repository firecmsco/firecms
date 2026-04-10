import { deleteField, DocumentSnapshot } from "@firebase/firestore";
import { EntityCollection, FirebaseCollection, Properties, Property } from "@rebasepro/types";
import { COLLECTION_PATH_SEPARATOR, sortProperties, stripCollectionPath } from "@rebasepro/common";

export function buildCollectionId(idOrPath: string, parentCollectionIds?: string[]): string {
    if (!parentCollectionIds)
        return stripCollectionPath(idOrPath);
    return [...parentCollectionIds.map(stripCollectionPath), stripCollectionPath(idOrPath)].join(COLLECTION_PATH_SEPARATOR);
}



export const docsToCollectionTree = (docs: DocumentSnapshot[]): EntityCollection[] => {

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
                (parentCollection as FirebaseCollection).subcollections = () => [...((parentCollection as FirebaseCollection).subcollections?.() ?? []), collection];
            delete collectionsMap[id];
        }
    });

    return Object.values(collectionsMap);
}

export const docToCollection = (doc: DocumentSnapshot): EntityCollection => {
    const data = doc.data();
    if (!data)
        throw Error("Entity collection has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};

    // Normalize enum values from object format to array format (sorted alphabetically)
    const normalizedProperties = normalizePropertiesEnumValues(properties, true);
    const sortedProperties = sortProperties(normalizedProperties, propertiesOrder);
    return {
        ...data,
        properties: sortedProperties,
        slug: data.id ?? data.alias ?? data.slug
    } as EntityCollection;
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
    enumValues: unknown,
    sortObjectFormat: boolean = false
): unknown[] {
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
            const normalizedProperty = { ...property } as Record<string, unknown>;

            // Handle direct enum values
            if (normalizedProperty.enum) {
                normalizedProperty.enum = normalizeEnumValuesToArray(
                    normalizedProperty.enum,
                    sortObjectFormat
                );
            }

            // Handle array properties with enum values in "of"
            if (normalizedProperty.dataType === "array" && typeof normalizedProperty.of === "object" && normalizedProperty.of !== null) {
                const ofProp = normalizedProperty.of as Record<string, unknown>;
                if (ofProp.enum) {
                    normalizedProperty.of = {
                        ...ofProp,
                        enum: normalizeEnumValuesToArray(
                            ofProp.enum,
                            sortObjectFormat
                        )
                    };
                }
            }

            // Handle map properties recursively
            if (normalizedProperty.dataType === "map" && normalizedProperty.properties) {
                normalizedProperty.properties = normalizePropertiesEnumValues(
                    normalizedProperty.properties as Properties,
                    sortObjectFormat
                );
            }

            result[key] = normalizedProperty as unknown as Property;
        } else {
            result[key] = property;
        }
    });
    return result;
}
