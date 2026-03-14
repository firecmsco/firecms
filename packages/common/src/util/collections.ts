import {
    DefaultSelectedViewBuilder,
    DefaultSelectedViewParams,
    EntityCollection,
    Properties,
    Property,
} from "@rebasepro/types";
import { isPropertyBuilder } from "./entities";

export function sortProperties<M extends Record<string, any>>(properties: Properties, propertiesOrder?: string[]): Properties {
    try {
        const propertiesKeys = Object.keys(properties);
        // If no propertiesOrder, just use the original keys order
        if (!propertiesOrder || propertiesOrder.length === 0) {
            return propertiesKeys
                .map((key) => {
                    const property = properties[key] as Property;
                    if (!isPropertyBuilder(property) && property?.type === "map" && property.properties) {
                        return ({
                            [key]: {
                                ...property,
                                properties: sortProperties(property.properties, property.propertiesOrder)
                            }
                        });
                    } else {
                        return ({ [key]: property });
                    }
                })
                .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as Properties;
        }

        // Filter propertiesOrder to only include TOP-LEVEL property keys that exist
        // (ignore nested keys like "data.mode" - they are for column ordering, not property filtering)
        const validOrderKeys = (propertiesOrder as string[]).filter(key => {
            // Only include top-level keys (no dots) that exist in properties
            return !key.includes(".") && properties[key];
        });

        // Track which properties we've processed
        const processedKeys = new Set<string>(validOrderKeys);

        // Build result starting with ordered properties
        const orderedResult = validOrderKeys
            .map((key) => {
                const property = properties[key] as Property;
                if (!isPropertyBuilder(property) && property?.type === "map" && property.properties) {
                    return ({
                        [key]: {
                            ...property,
                            properties: sortProperties(property.properties, property.propertiesOrder)
                        }
                    });
                } else {
                    return ({ [key]: property });
                }
            })
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as Properties;

        // Append any properties that were NOT in propertiesOrder (so they don't disappear!)
        const missingProperties = propertiesKeys
            .filter(key => !processedKeys.has(key))
            .map((key) => {
                const property = properties[key] as Property;
                if (!isPropertyBuilder(property) && property?.type === "map" && property.properties) {
                    return ({
                        [key]: {
                            ...property,
                            properties: sortProperties(property.properties, property.propertiesOrder)
                        }
                    });
                } else {
                    return ({ [key]: property });
                }
            })
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as Properties;

        return { ...orderedResult, ...missingProperties };
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}

export function resolveDefaultSelectedView(
    defaultSelectedView: string | DefaultSelectedViewBuilder | undefined,
    params: DefaultSelectedViewParams
) {
    if (!defaultSelectedView) {
        return undefined;
    } else if (typeof defaultSelectedView === "string") {
        return defaultSelectedView;
    } else {
        return defaultSelectedView(params);
    }
}



export function getLocalChangesBackup(collection: EntityCollection) {
    if (!collection.localChangesBackup) {
        return "manual_apply";
    }

    return collection.localChangesBackup;
}

/**
 * Returns the primary keys for an entity collection by inspecting the properties
 * and finding any properties with `isId`.
 * Fallbacks to `["id"]` if no properties are marked as `isId: true`.
 * @param collection
 */
export function getPrimaryKeys<M extends Record<string, any>>(collection: EntityCollection<M>): Extract<keyof M, string>[] {
    const properties = collection.properties;
    if (!properties) {
        return ["id"] as any;
    }
    const ids = Object.entries(properties)
        .filter(([key, prop]) => typeof prop === "object" && prop !== null && "isId" in prop && Boolean(prop.isId))
        .map(([key]) => key);

    if (ids.length > 0) {
        return ids as Extract<keyof M, string>[];
    }
    return ["id"] as any;
}
