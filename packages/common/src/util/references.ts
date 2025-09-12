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
    return undefined;
}
