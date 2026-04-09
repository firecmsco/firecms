import type { Properties } from "@rebasepro/types";
import type { EntityCollection, MapProperty, Property, PropertyConfig } from "@rebasepro/types";
import React from "react";

import { isPropertyBuilder } from "@rebasepro/common";
import {
    AddLinkIcon,
    BallotIcon,
    CircleIcon,
    FlagIcon,
    FunctionsIcon,
    HttpIcon,
    LinkIcon,
    MailIcon,
    NumbersIcon,
    RepeatIcon,
    ScheduleIcon,
    ShortTextIcon,
    SubjectIcon,
    UploadFileIcon,
    ViewStreamIcon
} from "@rebasepro/ui";

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

/**
 * Returns a default icon component based on property type.
 * This provides a sensible fallback when no PropertyConfig is available.
 */
function getDefaultIconForProperty(property: Property): React.ComponentType<{ size: "smallest" | "small" | "medium" | "large" | number }> {
    switch (property.type) {
        case "string": {
            if ((property as any).storage) return UploadFileIcon;
            if ((property as any).url) return HttpIcon;
            if ((property as any).email) return MailIcon;
            if ((property as any).multiline || (property as any).markdown) return SubjectIcon;
            if ((property as any).reference) return LinkIcon;
            return ShortTextIcon;
        }
        case "number":
            return NumbersIcon;
        case "boolean":
            return FlagIcon;
        case "date":
            return ScheduleIcon;
        case "map":
            return BallotIcon;
        case "array": {
            const of = (property as any).of;
            const oneOf = (property as any).oneOf;
            if (oneOf) return ViewStreamIcon;
            if (of && !Array.isArray(of)) {
                if (of.type === "reference") return AddLinkIcon;
                if (of.type === "string" && of.storage) return UploadFileIcon;
            }
            return RepeatIcon;
        }
        case "reference":
            return LinkIcon;
        case "relation":
            return AddLinkIcon;
        default:
            return CircleIcon;
    }
}

export function getIconForProperty(
    property: Property,
    size: "smallest" | "small" | "medium" | "large" | number = "small",
    fields: Record<string, PropertyConfig> = {}
): React.ReactNode {
    if (isPropertyBuilder(property)) {
        return <FunctionsIcon size={size} />;
    }

    // Try to look up a custom PropertyConfig icon first
    const configId = property.propertyConfig || undefined;
    const widget = configId ? fields[configId] : undefined;
    if (widget?.Icon) {
        return getIconForWidget(widget, size);
    }

    // Fall back to a type-based default icon
    const Icon = getDefaultIconForProperty(property);
    return <Icon size={size} />;
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
