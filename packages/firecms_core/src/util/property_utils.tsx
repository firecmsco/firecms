import React from "react";

import {
    AuthController,
    EntityCollection,
    PropertiesOrBuilders,
    PropertyConfig,
    PropertyOrBuilder,
    ResolvedProperties,
    ResolvedProperty
} from "../types";
import { isPropertyBuilder } from "./entities";
import { resolveProperty } from "./resolutions";
import { CircleIcon, FunctionsIcon } from "@firecms/ui";
import { getFieldConfig } from "../core";

export function isReferenceProperty(
    authController: AuthController,
    propertyOrBuilder: PropertyOrBuilder,
    fields: Record<string, PropertyConfig>) {
    const resolvedProperty: ResolvedProperty<any> | null = resolveProperty({
        propertyKey: "ignore", // TODO
        propertyOrBuilder,
        propertyConfigs: fields,
        authController
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
    return <CircleIcon size={size} />;
}

export function getIconForWidget(widget: PropertyConfig | undefined,
    size: "small" | "medium" | "large") {
    const Icon = widget?.Icon ?? CircleIcon;
    return <Icon size={size} />;
}

export function getIconForProperty(
    property: PropertyOrBuilder<any> | ResolvedProperty<any>,
    size: "small" | "medium" | "large" = "small",
    fields: Record<string, PropertyConfig> = {}
): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon size={size} />;
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
export function getPropertyInPath<M extends Record<string, any>>(properties: PropertiesOrBuilders<M> | ResolvedProperties, path: string): PropertyOrBuilder<any, M> | undefined {
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
 * Get properties sorted by their order, but include ALL properties.
 * Nested keys (like "data.mode") in propertiesOrder are ignored - they're for column ordering.
 * @param properties
 * @param propertiesOrder
 */
export function getPropertiesWithPropertiesOrder<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, propertiesOrder?: Extract<keyof M, string>[]): PropertiesOrBuilders<M> {
    if (!propertiesOrder) return properties;

    const propertyKeys = Object.keys(properties);

    // Filter propertiesOrder to only include top-level keys (no dots) that exist
    const validOrderKeys = (propertiesOrder as string[]).filter(
        key => !key.includes(".") && properties[key as keyof M]
    );

    const result: PropertiesOrBuilders<any> = {};

    // First add properties in the specified order
    validOrderKeys.forEach(key => {
        const property = properties[key];
        if (typeof property === "object" && property.dataType === "map" && property.properties) {
            result[key] = {
                ...property,
                properties: getPropertiesWithPropertiesOrder(property.properties, property.propertiesOrder ?? [])
            }
        } else if (property) {
            result[key] = property;
        }
    });

    // Then add any missing properties (so they don't disappear!)
    propertyKeys.forEach(key => {
        if (!result[key]) {
            const property = properties[key];
            if (typeof property === "object" && property.dataType === "map" && property.properties) {
                result[key] = {
                    ...property,
                    properties: getPropertiesWithPropertiesOrder(property.properties, property.propertiesOrder ?? [])
                }
            } else if (property) {
                result[key] = property;
            }
        }
    });

    return result;
}

export function getDefaultPropertiesOrder(collection: EntityCollection<any>): string[] {
    if (collection.propertiesOrder) return collection.propertiesOrder;
    return [...Object.keys(collection.properties), ...(collection.additionalFields ?? []).map(field => field.key)];
}
