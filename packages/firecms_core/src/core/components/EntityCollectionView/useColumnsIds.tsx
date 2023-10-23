import { useMemo } from "react";
import { EntityCollection, ResolvedEntityCollection, ResolvedProperty } from "../../../types";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import { PropertyColumnConfig } from "../EntityCollectionTable/EntityCollectionTableProps";

const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

export function useColumnIds<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, includeSubcollections: boolean): PropertyColumnConfig[] {
    return useMemo(() => {
        if (collection.propertiesOrder)
            return hideAndExpandKeys(collection, collection.propertiesOrder, false);
        return getDefaultColumnKeys(collection, includeSubcollections);
    }, [collection, includeSubcollections]);
}

function hideAndExpandKeys<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, keys: string[], excludeHidden:boolean): PropertyColumnConfig[] {

    return keys.flatMap((key) => {
        const property = collection.properties[key];
        if (property) {
            if (excludeHidden && property.hideFromCollection)
                return [null];
            if (excludeHidden && property.disabled && typeof property.disabled === "object" && property.disabled.hidden)
                return [null];
            if (property.dataType === "map" && property.spreadChildren && property.properties) {
                return getColumnKeysForProperty(property, key);
            }
            return [{
                key,
                disabled: Boolean(property.disabled) || Boolean(property.readOnly)
            }];
        }

        const additionalField = collection.additionalFields?.find(field => field.id === key);
        if (additionalField) {
            return [{
                key,
                disabled: true
            }];
        }

        if (collection.subcollections) {
            const subCollection = collection.subcollections.find(subCol => getSubcollectionColumnId(subCol) === key);
            if (subCollection) {
                return [{
                    key,
                    disabled: true
                }];
            }
        }

        if (collection.collectionGroup && key === COLLECTION_GROUP_PARENT_ID) {
            return [{
                key,
                disabled: true
            }];
        }

        return [null];
    }).filter(Boolean) as PropertyColumnConfig[];
}

function getDefaultColumnKeys<M extends Record<string, any> = any>(collection: ResolvedEntityCollection<M>, includeSubCollections: boolean) {
    const propertyKeys = Object.keys(collection.properties);

    if (collection.additionalColumns) {
        console.warn("`additionalColumns` is deprecated and will be removed in previous versions. Use `additionalFields` instead, with the same structure.");
    }

    const additionalFields = collection.additionalFields ?? collection.additionalColumns ?? [];
    const subCollections: EntityCollection[] = collection.subcollections ?? [];

    const columnIds: string[] = [
        ...propertyKeys,
        ...additionalFields.map((field) => field.id)
    ];

    if (includeSubCollections) {
        const subCollectionIds = subCollections
            .map((collection) => getSubcollectionColumnId(collection));
        columnIds.push(...subCollectionIds.filter((subColId) => !columnIds.includes(subColId)));
    }

    if (collection.collectionGroup) {
        columnIds.push(COLLECTION_GROUP_PARENT_ID);
    }

    return hideAndExpandKeys(collection, columnIds, true);
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
