import { buildEntityPropertiesFromData, buildPropertiesOrder } from "@firecms/schema_inference";
import { DocumentReference, getFirestore, Timestamp } from "firebase/firestore";
import { DataType, EntityCollection, GeoPoint, removeInitialAndTrailingSlashes, unslugify } from "firecms";
import { getDocuments } from "./firestore";
import { FirebaseApp } from "firebase/app";

/**
 * Build the guessed schema from a data collection
 * @param firebaseApp
 * @param collectionPath
 * @param isCollectionGroup
 * @param parentPathSegments
 */
export async function getInferredEntityCollection(firebaseApp: FirebaseApp, collectionPath: string, isCollectionGroup: boolean, parentPathSegments?: string[]): Promise<EntityCollection> {
    console.log("Building schema for collection", collectionPath, parentPathSegments)
    const firestore = getFirestore(firebaseApp);
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    const docs = await getDocuments(firestore, cleanPath, isCollectionGroup, parentPathSegments);
    const data = docs.map(doc => doc.data()).filter(Boolean) as object[];
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
