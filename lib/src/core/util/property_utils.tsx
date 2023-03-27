import React from "react";
import AdjustIcon from "@mui/icons-material/Adjust";
import FunctionsIcon from "@mui/icons-material/Functions";
import Crop75Icon from "@mui/icons-material/Crop75";

import {
    FieldConfig,
    PropertiesOrBuilders,
    PropertyOrBuilder,
    ResolvedProperty
} from "../../types";
import { getFieldConfig } from "../form_field_configs";
import { Box } from "@mui/material";
import { isPropertyBuilder } from "./entities";
import { resolveProperty } from "./resolutions";

export function isReferenceProperty(propertyOrBuilder: PropertyOrBuilder,
                                    fields?: Record<string, FieldConfig>) {
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

export function getIdIcon(
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    return <AdjustIcon color={color} fontSize={fontSize}/>;
}

function getIconForWidget(widget: FieldConfig | undefined,
                          color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error",
                          fontSize: "inherit" | "medium" | "large" | "small" | undefined) {
    const Icon = widget?.Icon ?? Crop75Icon;
    return <Icon color={color} fontSize={fontSize}/>;
}

export function getIconForProperty(
    property: PropertyOrBuilder | ResolvedProperty,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon color={color} fontSize={fontSize}/>;
    } else {
        const widget = getFieldConfig(property);
        return getIconForWidget(widget, color, fontSize);
    }
}

export function getBadgeForWidget(
    widget: FieldConfig | undefined,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit"): React.ReactNode {

    return <Box sx={{
        background: widget?.color ?? "#888",
        height: "32px",
        width: "32px",
        padding: 0.5,
        borderRadius: "50%",
        boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        color: "white"
    }}>
        {getIconForWidget(widget, color, "medium")}
    </Box>
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
    return path.replace(/\.([^.]*)/g, "[$1]"); ;
}
