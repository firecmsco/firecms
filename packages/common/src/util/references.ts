import { EntityCollection } from "@firecms/types";

export function getEntityImagePreviewPropertyKey<M extends object>(collection: EntityCollection<M>): string | undefined {

    // find first storage property of type image
    for (const key in collection.properties) {
        const property = collection.properties[key];
        if (property.type === "string" && property.storage?.acceptedFiles?.includes("image/*")) {
            return key;
        }
    }
    // alternatively, look for the first array of images
    for (const key in collection.properties) {
        const property = collection.properties[key];
        if (property.type === "array" && !Array.isArray(property.of) && property.of?.type === "string" && property.of.storage?.acceptedFiles?.includes("image/*")) {
            return key;
        }
    }
    // also check for URL properties with image preview type
    for (const key in collection.properties) {
        const property = collection.properties[key];
        if (property.type === "string" && property.url === "image") {
            return key;
        }
    }
    // and arrays of URL properties with image preview type
    for (const key in collection.properties) {
        const property = collection.properties[key];
        if (property.type === "array" && property.of?.type === "string" && property.of.url === "image") {
            return key;
        }
    }
    return undefined;
}
