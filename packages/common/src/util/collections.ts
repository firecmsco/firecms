import {
    DefaultSelectedViewBuilder,
    DefaultSelectedViewParams,
    EntityCollection,
    PermissionsBuilder,
    Properties,
} from "@firecms/types";
import { isPropertyBuilder } from "./entities";

export function sortProperties<M extends Record<string, any>>(properties: Properties, propertiesOrder?: string[]): Properties {
    try {
        const propertiesKeys = Object.keys(properties);
        const allPropertiesOrder = propertiesOrder ?? propertiesKeys;
        return allPropertiesOrder
            .map((key) => {
                if (properties[key]) {
                    const property = properties[key];
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
                } else {
                    return undefined;
                }
            })
            .filter((a) => a !== undefined)
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as Properties;
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
