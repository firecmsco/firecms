import type { EntityCollection, Property, PropertyConfig } from "@rebasepro/types";
import { AuthController } from "@rebasepro/types";
import { isPropertyBuilder } from "@rebasepro/common";

function isReferenceProperty(property: Property) {
    if (!property) return null;
    if (property.type === "reference") return true;
    if (property.type === "array") {
        if (Array.isArray(property.of)) return false;
        else return property.of?.type === "reference";
    }
    return false;
}

function isRelationProperty(property: Property) {
    if (!property) return null;
    if (property.type === "relation") return true;
    if (property.type === "array") {
        if (Array.isArray(property.of)) return false;
        else return property.of?.type === "relation";
    }
    return false;
}

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
            const prop = property as Property;
            if (prop.type === "string" && !prop.multiline && !prop.markdown && !prop.storage && !prop.isId) {
                return key;
            }
        }
    }
    return undefined;
}

