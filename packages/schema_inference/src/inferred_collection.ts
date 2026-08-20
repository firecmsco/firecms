import { buildEntityPropertiesFromData, buildPropertiesOrder, InferenceTypeBuilder } from "./collection_builder";
import { prettifyIdentifier } from "./util";
import { removeInitialAndTrailingSlashes } from "./strings";
import { Properties } from "./cms_types";

/**
 * The parts of a collection that can be derived from data alone.
 */
export type InferredCollectionFromData = {
    path: string;
    name: string;
    properties: Properties<any>;
    propertiesOrder: string[];
};

/**
 * Build a collection definition from a set of documents.
 *
 * This is the shared composition behind every place FireCMS infers a collection.
 * The only thing that legitimately differs between callers is how a raw value maps
 * to a `DataType`, because the documents arrive in different shapes depending on
 * where they were read:
 *
 * - the web client reads them with the Firebase JS SDK, so dates and references are
 *   `Timestamp` / `GeoPoint` / `DocumentReference` instances;
 * - the backend reads them with the Admin SDK;
 * - the MCP server receives them as JSON over HTTP, with those types encoded as
 *   `{_seconds}` / `{_ref}` / `{_lat,_long}` sentinels.
 *
 * Hence `getType` is a parameter: pass the builder that matches your source, and the
 * rest of the inference stays in one place.
 *
 * @param collectionPath path of the collection, used to derive the display name
 * @param data documents to infer from
 * @param getType maps a raw value to a `DataType`
 */
export async function buildInferredCollectionFromData(
    collectionPath: string,
    data: object[],
    getType: InferenceTypeBuilder
): Promise<InferredCollectionFromData> {
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    const properties = await buildEntityPropertiesFromData(data, getType);
    const propertiesOrder = buildPropertiesOrder(properties);
    return {
        path: cleanPath,
        name: prettifyIdentifier(lastPathSegment(cleanPath)),
        properties,
        propertiesOrder
    };
}

/**
 * The final segment of a Firestore path, which is the collection's own id.
 */
export function lastPathSegment(collectionPath: string): string {
    const cleanPath = removeInitialAndTrailingSlashes(collectionPath);
    return cleanPath.includes("/")
        ? cleanPath.split("/").slice(-1)[0]
        : cleanPath;
}
