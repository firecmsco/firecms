import { useMemo } from "react";
import { EntityCollection, Property } from "@firecms/types";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import { PropertyColumnConfig } from "../EntityCollectionTable/EntityCollectionTableProps";
import { getSubcollections } from "@firecms/common";

export const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

export function useColumnIds<M extends Record<string, any>>(collection: EntityCollection<M>, includeSubcollections: boolean): PropertyColumnConfig[] {
    return useMemo(() => {
        if (collection.propertiesOrder) {
            return hideAndExpandKeys(collection, collection.propertiesOrder);
        }
        return getDefaultColumnKeys(collection, includeSubcollections);
    }, [collection, includeSubcollections]);
}

function hideAndExpandKeys<M extends Record<string, any>>(collection: EntityCollection<M>, keys: string[]): PropertyColumnConfig[] {

    return keys.flatMap((key) => {
        const property = collection.properties[key];
        if (property) {
            if (property.hideFromCollection)
                return [null];
            if (property.disabled && typeof property.disabled === "object" && property.disabled.hidden)
                return [null];
            if (property.type === "map" && property.spreadChildren && property.properties) {
                return getColumnKeysForProperty(property, key);
            }
            return [{
                key,
                disabled: Boolean(property.disabled) || Boolean(property.readOnly)
            }];
        }

        const additionalField = collection.additionalFields?.find(field => field.key === key);
        if (additionalField) {
            return [{
                key,
                disabled: true
            }];
        }

        const subcollections = getSubcollections(collection);
        if (subcollections) {
            const subCollection = subcollections
                .find(subCol => getSubcollectionColumnId(subCol) === key);
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

function getDefaultColumnKeys<M extends Record<string, any> = any>(collection: EntityCollection<M>, includeSubCollections: boolean) {
    const propertyKeys = Object.keys(collection.properties);

    const additionalFields = collection.additionalFields ?? [];
    const subCollections: EntityCollection[] = getSubcollections(collection) ?? [];

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

export function getColumnKeysForProperty(property: Property, key: string, disabled?: boolean): PropertyColumnConfig[] {
    if (property.type === "map" && property.spreadChildren && property.properties) {
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

    // remove the id key
    const idField = collection.idField ?? "id";
    const formFieldKeys = allKeys.filter(key => key !== idField);

    if (collection.propertiesOrder) {
        return collection.propertiesOrder.filter(key => formFieldKeys.includes(key));
    }
    return formFieldKeys;
}
