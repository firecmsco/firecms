import React from "react";

import { EntityCollection, MapProperty, Properties, Property, PropertyConfig, } from "@rebasepro/types";
import { isPropertyBuilder } from "@rebasepro/common";
import { CircleIcon, FunctionsIcon } from "@rebasepro/ui";
import { getFieldConfig } from "../core";

export function isReferenceProperty(property: Property) {

    if (!property) return null;
    if (property.type === "reference") {
        return true;
    }
    if (property.type === "array") {
        if (Array.isArray(property.of)) return false;
        else return property.of?.type === "reference"
    }
    return false;
}

export function isRelationProperty(property: Property) {
    if (!property) return null;
    if (property.type === "relation") {
        return true;
    }
    if (property.type === "array") {
        if (Array.isArray(property.of)) return false;
        else return property.of?.type === "relation"
    }
    return false;
}

export function getIconForWidget(widget: PropertyConfig | undefined,
    size: "smallest" | "small" | "medium" | "large" | number) {
    const Icon = widget?.Icon ?? CircleIcon;
    return <Icon size={size} />;
}

export function getIconForProperty(
    property: Property,
    size: "smallest" | "small" | "medium" | "large" | number = "small",
    fields: Record<string, PropertyConfig> = {}
): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon size={size} />;
    } else {
        const widget = getFieldConfig(property, fields);
        return getIconForWidget(widget, size);
    }
}

/**
 * Get a property in a property tree from a path like
 * `address.street`
 * @param properties
 * @param path
 */
export function getPropertyInPath(properties: Properties, path: string): Property | undefined {
    if (typeof properties === "object") {
        if (path in properties) {
            return (properties as Record<string, Property>)[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            const childProperty = (properties as Record<string, Property>)[pathSegments[0]];
            if (typeof childProperty === "object" && childProperty.type === "map" && childProperty.properties) {
                return getPropertyInPath(childProperty.properties, pathSegments.slice(1).join("."))
            }
        }
    }
    return undefined;
}

export function getResolvedPropertyInPath(properties: Record<string, Property>, path: string): Property | undefined {
    if (typeof properties === "object") {
        if (path in properties) {
            return properties[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            const childProperty = properties[pathSegments[0]];
            if (childProperty.type === "map" && childProperty.properties) {
                return getResolvedPropertyInPath(childProperty.properties, pathSegments.slice(1).join("."))
            }
        }
    }
    return undefined;
}

// replace the dot notation with brackets
// address.street => address[street]
export function getBracketNotation(path: string): string {
    return path.replace(/\.([^.]*)/g, "[$1]");
}

/**
 * Get properties sorted by their order, but include ALL properties.
 * Nested keys (like "data.mode") in propertiesOrder are ignored - they're for column ordering.
 * @param properties
 * @param propertiesOrder
 */
export function getPropertiesWithPropertiesOrder(properties: Properties, propertiesOrder?: string[]): Properties {
    if (!propertiesOrder) return properties;

    const propertyKeys = Object.keys(properties);

    // Filter propertiesOrder to only include top-level keys (no dots) that exist
    const validOrderKeys = (propertiesOrder as string[]).filter(
        key => !key.includes(".") && properties[key]
    );

    const result: Properties = {};

    // First add properties in the specified order
    validOrderKeys.forEach(key => {
        const property = properties[key];
        if (typeof property === "object" && property.type === "map" && (property as MapProperty).properties) {
            const mapProp = property as MapProperty;
            result[key] = {
                ...mapProp,
                properties: getPropertiesWithPropertiesOrder(mapProp.properties!, mapProp.propertiesOrder ?? [])
            } as Property;
        } else if (property) {
            result[key] = property;
        }
    });

    // Then add any missing properties (so they don't disappear!)
    propertyKeys.forEach(key => {
        if (!result[key]) {
            const property = properties[key];
            if (typeof property === "object" && property.type === "map" && (property as MapProperty).properties) {
                const mapProp = property as MapProperty;
                result[key] = {
                    ...mapProp,
                    properties: getPropertiesWithPropertiesOrder(mapProp.properties!, mapProp.propertiesOrder ?? [])
                } as Property;
            } else if (property) {
                result[key] = property;
            }
        }
    });

    return result;
}

export function getDefaultPropertiesOrder(collection: EntityCollection): string[] {
    if (collection.propertiesOrder) return collection.propertiesOrder;
    return [...Object.keys(collection.properties), ...(collection.additionalFields ?? []).map(field => field.key)];
}
