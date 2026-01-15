import React from "react";
import { defaultBorderMixin, Typography } from "@firecms/ui";
import { PropertyPreview } from "../preview";
import { PreviewSize, Properties, Property } from "@firecms/types";
import { getValueInPath } from "@firecms/common";

/**
 * Build a readable label for a path and resolve the property
 * Supports map and array (including arrays of maps)
 */
export function buildPropertyLabelAndGetProperty(
    properties: Properties,
    key: string
): { label: string; property: Property | undefined } {
    if (!key) return {
        label: "",
        property: undefined
    };

    // Parse "a[0].b.c[2]" -> ["a", 0, "b", "c", 2]
    const segments: (string | number)[] = [];
    const re = /([^[.\]]+)|\[(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(key)) !== null) {
        if (m[1] !== undefined) segments.push(m[1]);
        else if (m[2] !== undefined) segments.push(Number(m[2]));
    }

    let currentProps: Properties | undefined = properties;
    let currentProp: Property | undefined;
    let lastLabel = "";

    const getArrayOfProp = (p?: Property): Property | undefined => {
        if (!p || p.type !== "array") return undefined;
        return Array.isArray(p.of) ? (p.of[0] as Property) : (p.of as Property | undefined);
    };

    for (const seg of segments) {
        if (typeof seg === "number") {
            // Last segment label should be the index itself
            lastLabel = `[${seg}]`;

            // Move schema context into the array element
            if (currentProp?.type === "array") {
                currentProp = getArrayOfProp(currentProp);
                if (currentProp?.type === "map" && currentProp.properties) {
                    currentProps = currentProp.properties as Properties;
                } else {
                    currentProps = undefined;
                }
            } else {
                // Index without array schema context
                currentProp = undefined;
                currentProps = undefined;
            }
            continue;
        }

        // seg is a string key
        if (currentProps && (currentProps as any)[seg]) {
            const nextProp = (currentProps as any)[seg] as Property;
            currentProp = nextProp;
            // Last segment label should be the property name (or the raw key)
            lastLabel = nextProp.name || String(seg);

            if (nextProp.type === "map" && nextProp.properties) {
                currentProps = nextProp.properties as Properties;
            } else if (nextProp.type === "array") {
                // Keep array prop; the next segment (index) will step into its element schema
                currentProps = undefined;
            } else {
                currentProps = undefined;
            }
        } else {
            // Unknown key or no schema context
            currentProp = undefined;
            currentProps = undefined;
            lastLabel = String(seg);
        }
    }

    return {
        label: lastLabel,
        property: currentProp
    };
}

const pathEndsWithIndex = (p: string) => /\[\d+\]$/.test(p);

/**
 * Improved simple layout for nested changes:
 * - Map or Array-of-Map -> section header + indented rows
 * - Leaf or Array-of-Primitives -> single row with label and value
 */
export const PropertyCollectionView = ({
                                           data,
                                           properties,
                                           baseKey = "",
                                           suppressHeader = false,
                                           size = "small"
                                       }: {
    data: any;
    properties: Properties;
    baseKey?: string;
    suppressHeader?: boolean;
    size?: PreviewSize;
}) => {

    const isTopLevel = !!baseKey && !baseKey.includes(".") && !baseKey.includes("[");

    // Arrays
    if (Array.isArray(data)) {
        const {
            label: arrayLabel,
            property
        } = baseKey
            ? buildPropertyLabelAndGetProperty(properties, baseKey)
            : {
                label: "",
                property: undefined as Property | undefined
            };

        const ofProp = property?.type === "array"
            ? (Array.isArray(property.of) ? property.of[0] : property.of) as Property | undefined
            : undefined;

        const isArrayOfMaps = ofProp?.type === "map";
        const isArrayOfPrimitives = property?.type === "array" && ofProp && ofProp.type !== "map";

        // Array of primitives -> single row
        if (baseKey && property && isArrayOfPrimitives) {
            return (
                <div
                    className={`grid grid-cols-12 gap-x-4 ${isTopLevel ? "py-4" : "py-2"} items-start ${isTopLevel ? `border-b ${defaultBorderMixin} last:border-b-0` : ""}`}>
                    <div className="col-span-4 pr-2">
                        <Typography variant="caption"
                                    color={"secondary"}
                                    component={"span"}
                                    className="break-words">
                            {arrayLabel}
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <PropertyPreview propertyKey={baseKey}
                                         value={data}
                                         property={property}
                                         size={size}/>
                    </div>
                </div>
            );
        }

        // Array of maps or unknown -> array header + combined item header (MapName [index]) then content
        return (
            <div className={`${isTopLevel ? "py-4" : "py-1"} ${isTopLevel ? `border-b ${defaultBorderMixin} last:border-b-0` : ""}`}>
                {baseKey && arrayLabel && !suppressHeader && (
                    <Typography variant="caption"
                                color={"secondary"}
                                component={"span"}>
                        {arrayLabel}
                    </Typography>
                )}
                <div className={baseKey ? `pl-4 mt-1 border-l ${defaultBorderMixin}` : ""}>
                    {data.map((item, index) => {
                        if (item === null || item === undefined) return null;
                        const currentKey = baseKey ? `${baseKey}[${index}]` : `[${index}]`;

                        // Combined header text
                        const itemHeader = isArrayOfMaps && ofProp?.name
                            ? `${ofProp.name} [${index}]`
                            : `[${index}]`;

                        return (
                            <div key={currentKey} className="py-1">
                                <Typography variant="caption"
                                            color={"secondary"}
                                            component={"span"}>
                                    {itemHeader}
                                </Typography>
                                <div className={`pl-4 mt-1 border-l ${defaultBorderMixin}`}>
                                    <PropertyCollectionView
                                        data={item}
                                        properties={properties}
                                        baseKey={currentKey}
                                        suppressHeader={true} // don’t repeat the inner map header
                                        size={size}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Objects (maps or plain objects)
    if (typeof data === "object" && data !== null) {
        const {
            label,
            property
        } = baseKey
            ? buildPropertyLabelAndGetProperty(properties, baseKey)
            : {
                label: "",
                property: undefined as Property | undefined
            };

        // Non-map leaf-like object -> single row
        if (baseKey && (!property || property.type !== "map" || !property.properties)) {
            if (!property) return null;
            return (
                <div
                    className={`grid grid-cols-12 gap-x-4 ${isTopLevel ? "py-4" : "py-2"} items-start ${isTopLevel ? `border-b ${defaultBorderMixin} last:border-b-0` : ""}`}>
                    <div className="col-span-4 pr-2">
                        <Typography variant="caption"
                                    color={"secondary"}
                                    component={"span"}
                                    className="break-words">
                            {label}
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <PropertyPreview propertyKey={baseKey}
                                         value={data}
                                         property={property}
                                         size={size}/>
                    </div>
                </div>
            );
        }

        // Map with defined properties -> show map header only if not suppressed
        const showMapHeader =
            baseKey &&
            !suppressHeader &&
            property?.type === "map" &&
            (property.name || !pathEndsWithIndex(baseKey));

        const headerText = property?.name || label;

        return (
            <div className={`${isTopLevel ? "py-4" : "py-1"} ${isTopLevel ? `border-b ${defaultBorderMixin} last:border-b-0` : ""}`}>
                {showMapHeader && (
                    <Typography variant="caption"
                                color={"secondary"}
                                component={"span"}
                    >
                        {headerText}
                    </Typography>
                )}
                <div className={baseKey ? `pl-4 mt-1 border-l ${defaultBorderMixin}` : ""}>
                    {Object.entries(data).map(([key, value]) => {
                        if (value === null || value === undefined) return null;
                        const currentKey = baseKey ? `${baseKey}.${key}` : key;
                        return (
                            <PropertyCollectionView
                                key={currentKey}
                                data={value}
                                properties={properties}
                                baseKey={currentKey}
                                size={size}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    // Primitives
    if (baseKey) {
        const {
            label,
            property
        } = buildPropertyLabelAndGetProperty(properties, baseKey);
        if (!property) return null;
        return (
            <div
                className={`grid grid-cols-12 gap-x-4 ${isTopLevel ? "py-4" : "py-2"} items-start ${isTopLevel ? `border-b ${defaultBorderMixin} last:border-b-0` : ""}`}>
                <div className="col-span-4 pr-2">
                    <Typography variant="caption"
                                color={"secondary"}
                                component={"span"}
                                className="break-words">
                        {label}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <PropertyPreview propertyKey={baseKey}
                                     value={data}
                                     property={property}
                                     size={size}/>
                </div>
            </div>
        );
    }

    return null;
};

export function buildDataFromPaths(values: object, paths: string[]): object {
    const result = {};
    paths.forEach(path => {
        const value = getValueInPath(values, path);
        if (value === undefined) return;

        // lodash.set would be perfect here
        const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".");
        let current: any = result;
        segments.forEach((segment, index) => {
            if (index === segments.length - 1) {
                current[segment] = value;
            } else {
                const nextSegment = segments[index + 1];
                const isNextAnIndex = /^\d+$/.test(nextSegment);
                if (!current[segment]) {
                    if (isNextAnIndex) {
                        current[segment] = [];
                    } else {
                        current[segment] = {};
                    }
                }
                current = current[segment];
            }
        });
    });
    return result;
}
