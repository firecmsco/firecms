import { useMemo } from "react";
import { EntityCollection, ResolvedEntityCollection, ResolvedProperty } from "../../types";
import { getPropertyInPath } from "../../util";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import { PropertyColumnConfig } from "../EntityCollectionTable/EntityCollectionTableProps";

export const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

export function useColumnIds<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, includeSubcollections: boolean): PropertyColumnConfig[] {
    return useMemo(() => {
        if (collection.propertiesOrder) {
            return hideAndExpandKeys(collection, collection.propertiesOrder);
        }
        return getDefaultColumnKeys(collection, includeSubcollections);
    }, [collection, includeSubcollections]);
}

function hideAndExpandKeys<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, keys: string[]): PropertyColumnConfig[] {

    // First, figure out which spread map roots have individual child keys in the order
    // If so, we should NOT auto-expand them - just use the explicit child keys
    const rootsWithExplicitChildren = new Set<string>();
    for (const key of keys) {
        if (key.includes(".")) {
            const rootKey = key.split(".")[0];
            const rootProperty = collection.properties[rootKey];
            if (rootProperty && rootProperty.dataType === "map" && rootProperty.spreadChildren && rootProperty.properties) {
                rootsWithExplicitChildren.add(rootKey);
            }
        }
    }

    // Track processed keys to avoid duplicates
    const processedPropertyKeys = new Set<string>();

    const result = keys.flatMap((key) => {
        // Skip if already processed (handles duplicates in propertiesOrder)
        if (processedPropertyKeys.has(key)) return [null];

        // Check if it's a top-level property
        const property = collection.properties[key];
        if (property) {
            processedPropertyKeys.add(key);
            if (property.hideFromCollection)
                return [null];
            if (property.disabled && typeof property.disabled === "object" && property.disabled.hidden)
                return [null];

            if (property.dataType === "map" && property.spreadChildren && property.properties) {
                // Check if this spread map has explicit child keys in propertiesOrder
                if (rootsWithExplicitChildren.has(key)) {
                    // DON'T auto-expand - the children are explicitly listed elsewhere
                    return [null];
                }
                // Auto-expand all children
                const childConfigs = getColumnKeysForProperty(property, key);
                childConfigs.forEach(c => processedPropertyKeys.add(c.key));
                return childConfigs;
            }
            return [{
                key,
                disabled: Boolean(property.disabled) || Boolean(property.readOnly)
            }];
        }

        // Check if it's a nested key like "data.mode" (for spread map properties)
        if (key.includes(".")) {
            const rootKey = key.split(".")[0];
            const rootProperty = collection.properties[rootKey];

            if (rootProperty && rootProperty.dataType === "map" && rootProperty.properties) {
                const nestedProperty = getPropertyInPath(collection.properties, key) as ResolvedProperty | undefined;
                if (nestedProperty) {
                    processedPropertyKeys.add(key);
                    // Mark root as seen
                    processedPropertyKeys.add(rootKey);

                    if (nestedProperty.hideFromCollection)
                        return [null];
                    if (nestedProperty.disabled && typeof nestedProperty.disabled === "object" && nestedProperty.disabled.hidden)
                        return [null];

                    return [{
                        key,
                        disabled: Boolean(rootProperty.disabled) || Boolean(rootProperty.readOnly) ||
                            Boolean(nestedProperty.disabled) || Boolean(nestedProperty.readOnly)
                    }];
                }
            }
        }

        // Check additional fields
        const additionalField = collection.additionalFields?.find(field => field.key === key);
        if (additionalField) {
            return [{
                key,
                disabled: true
            }];
        }

        // Check subcollections
        if (collection.subcollections) {
            const subCollection = collection.subcollections.find(subCol => getSubcollectionColumnId(subCol) === key);
            if (subCollection) {
                return [{
                    key,
                    disabled: true
                }];
            }
        }

        // Check collection group parent
        if (collection.collectionGroup && key === COLLECTION_GROUP_PARENT_ID) {
            return [{
                key,
                disabled: true
            }];
        }

        return [null];
    }).filter(Boolean) as PropertyColumnConfig[];

    // Add any missing properties that weren't in propertiesOrder
    // This ensures properties NEVER disappear
    for (const propKey of Object.keys(collection.properties)) {
        // Skip if already processed
        if (processedPropertyKeys.has(propKey)) continue;

        const property = collection.properties[propKey];
        if (!property) continue;
        if (property.hideFromCollection) continue;
        if (property.disabled && typeof property.disabled === "object" && property.disabled.hidden) continue;

        if (property.dataType === "map" && property.spreadChildren && property.properties) {
            // For spread maps, add all children that weren't already added
            const allChildConfigs = getColumnKeysForProperty(property, propKey);
            for (const childConfig of allChildConfigs) {
                if (!processedPropertyKeys.has(childConfig.key)) {
                    result.push(childConfig);
                    processedPropertyKeys.add(childConfig.key);
                }
            }
        } else {
            result.push({
                key: propKey,
                disabled: Boolean(property.disabled) || Boolean(property.readOnly)
            });
            processedPropertyKeys.add(propKey);
        }
    }

    return result;
}

function getDefaultColumnKeys<M extends Record<string, any> = any>(collection: ResolvedEntityCollection<M>, includeSubCollections: boolean) {
    const propertyKeys = Object.keys(collection.properties);

    const additionalFields = collection.additionalFields ?? [];
    const subCollections: EntityCollection[] = collection.subcollections ?? [];

    const columnIds: string[] = [
        ...propertyKeys,
        // Filter out additional fields whose key already exists in propertyKeys to avoid duplicate column keys
        ...additionalFields.filter((field) => !propertyKeys.includes(field.key)).map((field) => field.key)
    ];

    if (includeSubCollections) {
        const subCollectionIds = subCollections
            .map((collection) => getSubcollectionColumnId(collection));
        columnIds.push(...subCollectionIds.filter((subColId) => !columnIds.includes(subColId)));
    }

    if (collection.collectionGroup) {
        columnIds.push(COLLECTION_GROUP_PARENT_ID);
    }

    return hideAndExpandKeys(collection, columnIds);
}

export function getColumnKeysForProperty(property: ResolvedProperty, key: string, disabled?: boolean): PropertyColumnConfig[] {
    if (property.dataType === "map" && property.spreadChildren && property.properties) {
        return Object.entries(property.properties)
            .flatMap(([childKey, childProperty]) => getColumnKeysForProperty(
                childProperty,
                `${key}.${childKey}`,
                disabled || Boolean(property.disabled) || Boolean(property.readOnly))
            );
    }
    return [{
        key,
        disabled: disabled || Boolean(property.disabled) || Boolean(property.readOnly)
    }];
}

export function getFormFieldKeys(collection: EntityCollection): string[] {
    const propertyKeys = Object.keys(collection.properties);
    const additionalFields = collection.additionalFields ?? [];
    const allKeys = [
        ...propertyKeys,
        ...additionalFields.map((field) => field.key)
    ];
    if (collection.propertiesOrder) {
        return collection.propertiesOrder.filter(key => allKeys.includes(key));
    }
    return allKeys;
}
