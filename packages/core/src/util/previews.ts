import { AuthController, EntityCollection, Property, PropertyConfig } from "@rebasepro/types";
import { isPropertyBuilder } from "@rebasepro/common";
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
            .filter(key => {
                const prop = targetCollection.properties[key];
                const isIdProp = prop && typeof prop === "object" && "isId" in prop && Boolean((prop as unknown as { isId?: boolean }).isId);
                return !isIdProp && key !== "id";
            })
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
            const field = getFieldConfig(property as Property, propertyConfigs);
            if (field?.key === "text_field") {
                return key;
            }
        }
    }
    return undefined;
}

