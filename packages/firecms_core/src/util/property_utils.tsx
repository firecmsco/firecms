import React from "react";

import { EntityCollection, PropertiesOrBuilders, PropertyConfig, PropertyOrBuilder, ResolvedProperty } from "../types";
import { isPropertyBuilder } from "./entities";
import { resolveProperty } from "./resolutions";
import { CircleIcon, FunctionsIcon } from "@firecms/ui";
import { getFieldConfig } from "../core";

export function isReferenceProperty(propertyOrBuilder: PropertyOrBuilder,
                                    fields: Record<string, PropertyConfig>) {
    const resolvedProperty = resolveProperty({
        propertyKey: "ignore", // TODO
        propertyOrBuilder,
        fields
    });
    if (!resolvedProperty) return null;
    if (resolvedProperty.dataType === "reference") {
        return true;
    }
    if (resolvedProperty.dataType === "array") {
        if (Array.isArray(resolvedProperty.of)) return false;
        else return resolvedProperty.of?.dataType === "reference"
    }
    return false;
}

export function getIdIcon(size: "small" | "medium" | "large"): React.ReactNode {
    return <CircleIcon size={size}/>;
}

export function getIconForWidget(widget: PropertyConfig | undefined,
                                 size: "small" | "medium" | "large") {
    const Icon = widget?.Icon ?? CircleIcon;
    return <Icon size={size}/>;
}

export function getIconForProperty(
    property: PropertyOrBuilder<any> | ResolvedProperty<any>,
    size: "small" | "medium" | "large" = "small",
    fields: Record<string, PropertyConfig> = {}
): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon size={size}/>;
    } else {
        const widget = getFieldConfig(property, fields);
        return getIconForWidget(widget, size);
    }
}

export function getColorForProperty(property: PropertyOrBuilder, fields: Record<string, PropertyConfig>): string {
    if (isPropertyBuilder(property)) {
        return "#888";
    } else {
        const widget = getFieldConfig(property, fields);
        return widget?.color ?? "#666";
    }
}

/**
 * Get a property in a property tree from a path like
 * `address.street`
 * @param properties
 * @param path
 */
export function getPropertyInPath<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, path: string): PropertyOrBuilder<any, M> | undefined {
    if (typeof properties === "object") {
        if (path in properties) {
            return properties[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            const childProperty = properties[pathSegments[0]];
            if (typeof childProperty === "object" && childProperty.dataType === "map" && childProperty.properties) {
                return getPropertyInPath(childProperty.properties, pathSegments.slice(1).join("."))
            }
        }
    }
    return undefined;
}

export function getResolvedPropertyInPath(properties: Record<string, ResolvedProperty>, path: string): ResolvedProperty | undefined {
    if (typeof properties === "object") {
        if (path in properties) {
            return properties[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            const childProperty = properties[pathSegments[0]];
            if (childProperty.dataType === "map" && childProperty.properties) {
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
 * Get properties exclusively indexed by their order
 * @param properties
 * @param propertiesOrder
 */
export function getPropertiesWithPropertiesOrder<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, propertiesOrder?: Extract<keyof M, string>[]): PropertiesOrBuilders<M> {
    if (!propertiesOrder) return properties;
    const result: PropertiesOrBuilders<any> = {};
    propertiesOrder.filter(Boolean).forEach(path => {
        const property = getPropertyInPath(properties, path);
        if (typeof property === "object" && property.dataType === "map" && property.properties) {
            result[path] = {
                ...property,
                properties: getPropertiesWithPropertiesOrder(property.properties, property.propertiesOrder ?? [])
            }
        }
        if (property) {
            result[path] = property;
        }
    });
    return result;
}

export function getDefaultPropertiesOrder(collection: EntityCollection<any>): string[] {
    if (collection.propertiesOrder) return collection.propertiesOrder;
    return [...Object.keys(collection.properties), ...(collection.additionalFields ?? []).map(field => field.key)];
}
