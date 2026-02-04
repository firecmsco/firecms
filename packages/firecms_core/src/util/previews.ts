import { AuthController, EntityCollection, PropertyConfig } from "@firecms/types";
import { isPropertyBuilder } from "@firecms/common";
import { isReferenceProperty, isRelationProperty } from "./property_utils";
import { getFieldConfig } from "../core";

export function getEntityPreviewKeys(
    authController: AuthController,
    targetCollection: EntityCollection<any>,
    fields: Record<string, PropertyConfig>,
    previewProperties?: string[],
    limit = 3) {
    const allProperties = Object.keys(targetCollection.properties);
    let listProperties = previewProperties?.filter(p => allProperties.includes(p as string));
    if (!listProperties && targetCollection.previewProperties) {
        listProperties = targetCollection.previewProperties?.filter(p => allProperties.includes(p as string));
    }
    if (listProperties && listProperties.length > 0) {
        return listProperties;
    } else {
        listProperties = allProperties;
        return listProperties
            .filter(key => key !== targetCollection.idField && key !== "id")
            .filter(key => {
                const property = targetCollection.properties[key];
                return property && !isPropertyBuilder(property) && !isReferenceProperty(property) && !isRelationProperty(property);
            }).slice(0, limit);
    }
}

export function getEntityTitlePropertyKey<M extends Record<string, any>>(collection: EntityCollection<M>, propertyConfigs: Record<string, PropertyConfig>): string | undefined {
    if (collection.titleProperty) {
        return collection.titleProperty as string;
    }
    // find first text field property
    for (const key in collection.properties) {
        const property = collection.properties[key];
        if (!isPropertyBuilder(property)) {
            const field = getFieldConfig(property, propertyConfigs);
            if (field?.key === "text_field") {
                return key;
            }
        }
    }
    return undefined;
}

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
        if (property.type === "array" && property.of?.type === "string" && property.of.storage?.acceptedFiles?.includes("image/*")) {
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
