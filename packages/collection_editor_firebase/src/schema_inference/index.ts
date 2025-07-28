import { buildEntityPropertiesFromData, buildPropertiesOrder } from "@firecms/schema_inference";
import { DocumentReference, Firestore, Timestamp } from "@firebase/firestore";
import { type, EntityCollection, GeoPoint, removeInitialAndTrailingSlashes, unslugify } from "@firecms/core";
import { getDocuments } from "./firestore";

/**
 * Build the guessed schema from a data collection
 * @param firestore
 * @param collectionPath
 * @param isCollectionGroup
 * @param parentPathSegments
 */
export async function getInferredEntityCollection(firestore: Firestore, collectionPath: string, isCollectionGroup: boolean, parentPathSegments?: string[]): Promise<Partial<EntityCollection>> {
    console.debug("Building schema for collection", collectionPath, parentPathSegments)
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    const docs = await getDocuments(firestore, cleanPath, isCollectionGroup, parentPathSegments);
    const data = docs.map(doc => doc.data()).filter(Boolean) as object[];
    return getInferredEntityCollectionFromData(collectionPath, data);
}

export async function getInferredEntityCollectionFromData(collectionPath: string, data: object[]): Promise<Partial<EntityCollection>> {
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    const properties = await buildEntityPropertiesFromData(data, getType);
    const propertiesOrder = buildPropertiesOrder(properties);
    const lastPathSegment = cleanPath.includes("/") ? cleanPath.split("/").slice(-1)[0] : cleanPath;
    return {
        path: cleanPath,
        name: unslugify(lastPathSegment),
        properties,
        propertiesOrder
    };
}

export async function getPropertiesFromData(data: object[]) {
    return buildEntityPropertiesFromData(data, getType);
}

function getType(value: any): type {
    if (typeof value === "number")
        return "number";
    else if (typeof value === "string")
        return "string";
    else if (typeof value === "boolean")
        return "boolean";
    else if (Array.isArray(value))
        return "array";
    else if (value instanceof Timestamp)
        return "date";
    else if (value instanceof GeoPoint)
        return "geopoint";
    else if (value instanceof DocumentReference)
        return "reference";
    return "map";
}
