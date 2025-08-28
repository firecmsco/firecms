import { AuthController, EntityCollection, PropertyConfig, ResolvedEntityCollection } from "@firecms/types";
import { isPropertyBuilder } from "./entities";



export function getEntityImagePreviewPropertyKey<M extends object>(collection: ResolvedEntityCollection<M>): string | undefined {

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
        if (property.type === "array" && property.of?.type === "string" && property.of.storage?.acceptedFiles?.includes("image/*")) {
            return key;
        }
    }
    return undefined;
}
