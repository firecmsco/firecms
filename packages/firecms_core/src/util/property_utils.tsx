import React from "react";

import {
    AuthController,
    EntityCollection,
    Properties,
    Property,
    PropertyConfig,
    ResolvedProperties,
    ResolvedProperty
} from "@firecms/types";
import { isPropertyBuilder } from "@firecms/common";
import { CircleIcon, FunctionsIcon } from "@firecms/ui";
import { getFieldConfig } from "../core";
import { resolveProperty } from "./resolutions";

export function isReferenceProperty(
    authController: AuthController,
    propertyOrBuilder: Property,
    fields: Record<string, PropertyConfig>) {
    const resolvedProperty = resolveProperty({
        propertyKey: "ignore", // TODO
        property: propertyOrBuilder,
        propertyConfigs: fields,
        authController
    });
    if (!resolvedProperty) return null;
    if (resolvedProperty.type === "reference") {
        return true;
    }
    if (resolvedProperty.type === "array") {
        if (Array.isArray(resolvedProperty.of)) return false;
        else return resolvedProperty.of?.type === "reference"
    }
    return false;
}

export function getIconForWidget(widget: PropertyConfig | undefined,
                                 size: "small" | "medium" | "large") {
    const Icon = widget?.Icon ?? CircleIcon;
    return <Icon size={size}/>;
}

export function getIconForProperty(
    property: Property | ResolvedProperty,
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

/**
 * Get a property in a property tree from a path like
 * `address.street`
 * @param properties
 * @param path
 */
export function getPropertyInPath(properties: Properties, path: string): Property | undefined;
export function getPropertyInPath(properties: ResolvedProperties, path: string): ResolvedProperty | undefined;
export function getPropertyInPath(properties: Properties | ResolvedProperties, path: string): Property | ResolvedProperty | undefined {
    if (typeof properties === "object") {
        if (path in properties) {
            // @ts-ignore
            return properties[path as keyof typeof properties];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            // @ts-ignore
            const childProperty = properties[pathSegments[0] as keyof typeof properties];
            if (typeof childProperty === "object" && childProperty.type === "map" && childProperty.properties) {
                // @ts-ignore
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
 * Get properties exclusively indexed by their order
 * @param properties
 * @param propertiesOrder
 */
export function getPropertiesWithPropertiesOrder(properties: Properties, propertiesOrder?: string[]): Properties {
    if (!propertiesOrder) return properties;
    const result: Properties = {};
    propertiesOrder.filter(Boolean).forEach(path => {
        const property = getPropertyInPath(properties, path);
        if (typeof property === "object" && property.type === "map" && property.properties) {
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
