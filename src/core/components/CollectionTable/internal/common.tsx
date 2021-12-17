import React, { useMemo } from "react";
import {
    ArrayProperty,
    EntityCollection, Properties,
    Property,
    ResolvedEntitySchema
} from "../../../../models";


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

export function getPropertyColumnWidth(property: Property): number {

    if (property.columnWidth) {
        return property.columnWidth;
    }

    if (property.dataType === "string") {
        if (property.config?.url) {
            if (property.config?.url === "video" || property.config?.storageMeta?.mediaType === "video")
                return 340;
            else if (property.config?.url === "audio" || property.config?.storageMeta?.mediaType === "audio")
                return 300;
            return 240;
        } else if (property.config?.storageMeta) {
            return 220;
        } else if (property.config?.enumValues) {
            return 200;
        } else if (property.config?.multiline) {
            return 300;
        } else if (property.config?.markdown) {
            return 300;
        } else if (property.validation?.email) {
            return 200;
        } else {
            return 200;
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty;
        if (arrayProperty.of) {
            return getPropertyColumnWidth(arrayProperty.of as Property);
        } else {
            return 300;
        }
    } else if (property.dataType === "number") {
        if (property.config?.enumValues) {
            return 200;
        }
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


export function getSubcollectionColumnId(collection: EntityCollection) {
    return `subcollection:${collection.path}`;
}

export function useColumnIds<M>(collection: EntityCollection<M>, resolvedSchema:ResolvedEntitySchema<M>, includeSubcollections: boolean): string[] {
    const initialDisplayedProperties = collection.properties;
    const excludedProperties = collection.excludedProperties;
    const additionalColumns = collection.additionalColumns ?? [];
    const subCollections: EntityCollection[] = collection.subcollections ?? [];

    return useMemo(() => {

        const properties:Properties = resolvedSchema.properties;

        const hiddenColumnIds: string[] = Object.entries(properties)
            .filter(([_, property]) => {
                return property.disabled && typeof property.disabled === "object" && property.disabled.hidden;
            })
            .map(([propertyKey, _]) => propertyKey);

        const columnIds: string[] = [
            ...Object.keys(collection.schema.properties) as string[],
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
            result = columnIds.filter((columnId) => !hiddenColumnIds.includes(columnId));
        }

        if (includeSubcollections) {
            const subCollectionIds = subCollections
                .map((collection) => getSubcollectionColumnId(collection))
                .filter((subColId) => excludedProperties ? !excludedProperties?.includes(subColId) : true);
            result.push(...subCollectionIds.filter((subColId) => !result.includes(subColId)));
        }

        return result;

    }, [initialDisplayedProperties, excludedProperties, additionalColumns, subCollections]);
}
