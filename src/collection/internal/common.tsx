import React, { useMemo } from "react";
import {
    ArrayProperty,
    CollectionSize,
    EntityCollection,
    Property,
    StringProperty
} from "../../models";

export interface CMSColumn {
    id: string;
    type: "property" | "additional";
    label: string;
    property?: Property;
    align: "right" | "left" | "center";
    sortable: boolean;
    filterable: boolean;
    width: number;
}

export type Sort = "asc" | "desc" | undefined;


export function getCellAlignment(property: Property): "right" | "left" | "center" {
    if (property.dataType === "boolean") {
        return "center";
    } else if (property.dataType === "number") {
        if (property.config?.enumValues)
            return "left";
        return "right";
    } else if (property.dataType === "timestamp") {
        return "right";
    } else {
        return "left";
    }
}

export function isPropertyFilterable(property: Property): boolean {
    if (property.dataType === "boolean") {
        return true;
    } else if (property.dataType === "number") {
        return true;
    } else if (property.dataType === "string") {
        return true;
    } else if (property.dataType === "timestamp") {
        return true;
    } else if (property.dataType === "array") {
        if (property.of)
            return isPropertyFilterable(property.of);
        else
            return false;
    } else {
        return false;
    }
}

export function getPropertyColumnWidth(property: Property, size: CollectionSize): number {

    if (property.columnWidth) {
        return property.columnWidth;
    }

    if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.url) {
            if (stringProperty.config?.url === "video" || stringProperty.config?.storageMeta?.mediaType === "video")
                return 340;
            else if (stringProperty.config?.url === "audio" || stringProperty.config?.storageMeta?.mediaType === "audio")
                return 300;
            return 240;
        } else if (stringProperty.config?.storageMeta) {
            return 220;
        } else if (stringProperty.config?.enumValues) {
            return 200;
        } else if (stringProperty.config?.multiline) {
            return 300;
        } else if (stringProperty.config?.markdown) {
            return 300;
        } else if (stringProperty.validation?.email) {
            return 200;
        } else {
            return 200;
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty;
        if (arrayProperty.of) {
            return getPropertyColumnWidth(arrayProperty.of as Property, size);
        } else {
            return 300;
        }
    } else if (property.dataType === "number") {
        return 140;
    } else if (property.dataType === "map") {
        return 360;
    } else if (property.dataType === "timestamp") {
        return 160;
    } else if (property.dataType === "reference") {
        return 220;
    } else if (property.dataType === "boolean") {
        return 140;
    } else {
        return 200;
    }
}

export function getRowHeight(size: CollectionSize): number {
    switch (size) {
        case "xl":
            return 400;
        case "l":
            return 280;
        case "m":
            return 140;
        case "s":
            return 80;
        case "xs":
            return 54;
        default:
            throw Error("Missing mapping for collection size -> height");
    }
}

export function getSubcollectionColumnId(collection: EntityCollection) {
    return `subcollection_${collection.relativePath}`;
}

export function useColumnIds(view: EntityCollection, includeSubcollections: boolean) {
    const initialDisplayedProperties = view.properties;
    const excludedProperties = view.excludedProperties;
    const additionalColumns = view.additionalColumns ?? [];
    const subCollections: EntityCollection[] = view.subcollections ?? [];

    return useMemo(() => {
        const subcollectionIds = subCollections.map((collection) => getSubcollectionColumnId(collection));
        const columnIds: string[] = [
            ...Object.keys(view.schema.properties) as string[],
            ...additionalColumns.map((column) => column.id)
        ];
        let result: string[];
        if (initialDisplayedProperties) {
            result = initialDisplayedProperties
                .map((p) => {
                    return columnIds.find(id => id === p);
                }).filter(c => !!c) as string[];
        } else if (excludedProperties) {
            result = columnIds
                .filter(id => !(excludedProperties as string[]).includes(id));
        } else {
            result = columnIds;
        }
        if (includeSubcollections)
            result.push(...subcollectionIds);
        return result;
    }, []);
}
