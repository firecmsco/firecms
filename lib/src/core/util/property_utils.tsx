import React from "react";

import { FieldConfig, PropertiesOrBuilders, PropertyOrBuilder, ResolvedProperty } from "../../types";
import { getFieldConfig } from "../form_field_configs";
import { isPropertyBuilder } from "./entities";
import { resolveProperty } from "./resolutions";
import { CircleIcon, FunctionsIcon } from "../../icons";

export function isReferenceProperty(propertyOrBuilder: PropertyOrBuilder,
                                    fields: Record<string, FieldConfig>) {
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

export function getIconForWidget(widget: FieldConfig | undefined,
                                 size: "small" | "medium" | "large") {
    const Icon = widget?.Icon ?? CircleIcon;
    return <Icon size={size}/>;
}

export function getIconForProperty(
    property: PropertyOrBuilder | ResolvedProperty,
    size: "small" | "medium" | "large" = "small"
): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon size={size}/>;
    } else {
        const widget = getFieldConfig(property);
        return getIconForWidget(widget, size);
    }
}

export function getColorForProperty(property: PropertyOrBuilder): string {
    if (isPropertyBuilder(property)) {
        return "#888";
    } else {
        const widget = getFieldConfig(property);
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
