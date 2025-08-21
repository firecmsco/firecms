import { EntityCollection, Property, ResolvedArrayProperty, ResolvedProperty } from "@firecms/types";

export function getTableCellAlignment(property: Property | ResolvedProperty): "right" | "left" | "center" {
    if (property.type === "boolean") {
        return "center";
    } else if (property.type === "number") {
        if (property.enumValues)
            return "left";
        return "right";
    } else if (property.type === "date") {
        return "right";
    } else {
        return "left";
    }
}

export function getTablePropertyColumnWidth(property: ResolvedProperty): number {

    if (property.columnWidth) {
        return property.columnWidth;
    }

    if (property.type === "string") {
        if (property.url) {
            return 280;
        } else if (property.storage) {
            return 160;
        } else if (property.enumValues) {
            return 200;
        } else if (property.multiline) {
            return 300;
        } else if (property.markdown) {
            return 300;
        } else if (property.email) {
            return 200;
        } else {
            return 200;
        }
    } else if (property.type === "array") {
        const arrayProperty = property as ResolvedArrayProperty;
        if (arrayProperty.of) {
            if (Array.isArray(property.of)) {
                return 300;
            } else {
                return getTablePropertyColumnWidth(arrayProperty.of as ResolvedProperty);
            }
        } else {
            return 300;
        }
    } else if (property.type === "number") {
        if (property.enumValues) {
            return 200;
        }
        return 140;
    } else if (property.type === "map") {
        return 360;
    } else if (property.type === "date") {
        return 200;
    } else if (property.type === "reference") {
        return 220;
    } else if (property.type === "boolean") {
        return 140;
    } else {
        return 200;
    }
}

export function getSubcollectionColumnId(collection: EntityCollection) {
    return `subcollection:${collection.slug}`;
}
