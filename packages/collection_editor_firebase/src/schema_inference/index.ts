import { buildEntityPropertiesFromData, buildInferredCollectionFromData } from "@firecms/schema_inference";
import { DocumentReference, Firestore, Timestamp } from "firebase/firestore";
import {
    DataType,
    EntityCollection,
    FilterValues,
    GeoPoint,
    removeInitialAndTrailingSlashes
} from "@firecms/core";
import { getDocuments } from "./firestore";

/**
 * Build the guessed schema from a data collection
 * @param firestore
 * @param collectionPath
 * @param isCollectionGroup
 * @param parentPathSegments
 * @param initialFilter - Optional filter values to apply when fetching documents
 * @param initialSort - Optional sort to apply when fetching documents
 */
export async function getInferredEntityCollection(
    firestore: Firestore,
    collectionPath: string,
    isCollectionGroup: boolean,
    parentPathSegments?: string[],
    initialFilter?: FilterValues<string>,
    initialSort?: [string, "asc" | "desc"]
): Promise<Partial<EntityCollection>> {
    console.debug("Building schema for collection", collectionPath, parentPathSegments, { initialFilter, initialSort })
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    const docs = await getDocuments(firestore, cleanPath, isCollectionGroup, parentPathSegments, initialFilter, initialSort);
    const data = docs.map(doc => doc.data()).filter(Boolean) as object[];
    return getInferredEntityCollectionFromData(collectionPath, data);
}

export async function getInferredEntityCollectionFromData(collectionPath: string, data: object[]): Promise<Partial<EntityCollection>> {
    // The composition lives in @firecms/schema_inference so that the web client, the
    // backend and the MCP server all infer collections the same way; only `getType`
    // differs, because each reads its documents from a different source.
    return buildInferredCollectionFromData(collectionPath, data, getType) as Promise<Partial<EntityCollection>>;
}

export async function getPropertiesFromData(data: object[]) {
    return buildEntityPropertiesFromData(data, getType);
}

function getType(value: any): DataType {
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
