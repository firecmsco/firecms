import {
    DefaultSelectedViewBuilder,
    DefaultSelectedViewParams,
    EntityCollection,
    PermissionsBuilder,
    PropertiesOrBuilders,
    PropertyOrBuilder
} from "../types";
import { isPropertyBuilder } from "./entities";

export function sortProperties<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, propertiesOrder?: (keyof M)[]): PropertiesOrBuilders<M> {
    try {
        const propertiesKeys = Object.keys(properties);

        // If no propertiesOrder, just use the original keys order
        if (!propertiesOrder || propertiesOrder.length === 0) {
            return propertiesKeys
                .map((key) => {
                    const property = properties[key] as PropertyOrBuilder;
                    if (!isPropertyBuilder(property) && property?.dataType === "map" && property.properties) {
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
                .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<M>;
        }

        // Filter propertiesOrder to only include TOP-LEVEL property keys that exist
        // (ignore nested keys like "data.mode" - they are for column ordering, not property filtering)
        const validOrderKeys = (propertiesOrder as string[]).filter(key => {
            // Only include top-level keys (no dots) that exist in properties
            return !key.includes(".") && properties[key as keyof M];
        });

        // Track which properties we've processed
        const processedKeys = new Set<string>(validOrderKeys);

        // Build result starting with ordered properties
        const orderedResult = validOrderKeys
            .map((key) => {
                const property = properties[key] as PropertyOrBuilder;
                if (!isPropertyBuilder(property) && property?.dataType === "map" && property.properties) {
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
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<M>;

        // Append any properties that were NOT in propertiesOrder (so they don't disappear!)
        const missingProperties = propertiesKeys
            .filter(key => !processedKeys.has(key))
            .map((key) => {
                const property = properties[key] as PropertyOrBuilder;
                if (!isPropertyBuilder(property) && property?.dataType === "map" && property.properties) {
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
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<M>;

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

/**
 * If a collection is not applying permissions, we apply the given permissionsBuilder.
 * This is used to apply the role permissions to the collections, unless they are already
 * applying permissions.
 * @param collections
 * @param permissionsBuilder
 */
export const applyPermissionsFunctionIfEmpty = (collections: EntityCollection[], permissionsBuilder?: PermissionsBuilder<any, any>): EntityCollection[] => {

    return collections.map(collection => {
        if (collection.permissions) {
            return collection;
        }
        return ({
            ...collection,
            permissions: permissionsBuilder
        });
    });
}

export function getLocalChangesBackup(collection: EntityCollection) {
    if (!collection.localChangesBackup) {
        return "manual_apply";
    }

    return collection.localChangesBackup;
}
