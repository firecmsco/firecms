import { EntityCollection, MapProperty, ModifyCollectionProps, Properties, Property, } from "@firecms/types";
import { mergeDeep, sortProperties, isPropertyBuilder } from "@firecms/common";

function applyModifyFunction(modifyCollection: ((props: ModifyCollectionProps) => (EntityCollection | void)) | undefined,
    collection: EntityCollection,
    parentPaths: string[]) {
    if (modifyCollection) {
        const modified = modifyCollection({
            collection,
            parentPaths
        });
        const resCollection = modified ?? collection;
        if (resCollection.subcollections) {
            resCollection.subcollections = resCollection.subcollections
                ? (() => (resCollection.subcollections?.() ?? []).map((subcollection) => {
                    return applyModifyFunction(modifyCollection, subcollection, [...parentPaths, collection.slug]) as EntityCollection;
                }))
                : undefined;
        }
        return resCollection;
    } else {
        return collection;
    }
}

/**
 *
 */
export function joinCollectionLists(targetCollections: EntityCollection[],
    sourceCollections: EntityCollection[] | undefined,
    parentPaths: string[] = [],
    modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void): EntityCollection[] {

    // merge collections that are in both lists
    const updatedCollections = (sourceCollections ?? [])
        .map((sourceCol) => {
            const targetCol = targetCollections?.find((collection) => {
                return collection.slug === sourceCol.slug;
                // return collection.slug === codedCollection.slug || collection.id && codedCollection.id;
            });
            if (!targetCol) {
                return applyModifyFunction(modifyCollection, sourceCol, parentPaths);
            } else {
                return mergeCollection(targetCol, sourceCol, parentPaths, modifyCollection);
            }
        });

    const sourceCollectionSlugs = updatedCollections.map(c => c.slug);
    // fetched collections that are not in the source collections
    const resultStoredCollections = targetCollections
        .filter((col) => {
            return !sourceCollectionSlugs.includes(col.slug);
        })
        .map((col) => {
            if (modifyCollection) {
                return applyModifyFunction(modifyCollection, col, parentPaths);
            } else {
                return col;
            }
        });

    return [...updatedCollections, ...resultStoredCollections];
}

/**
 *
 */
export function mergeCollection(target: EntityCollection,
    source: EntityCollection,
    parentPaths: string[] = [],
    modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void
): EntityCollection {

    const subcollectionsMerged = joinCollectionLists(
        target?.subcollections?.() ?? [],
        source?.subcollections?.() ?? [],
        [...parentPaths, target.slug],
        modifyCollection
    );

    const propertiesMerged: Properties = { ...target.properties } as Properties;
    Object.keys(source.properties).forEach((key) => {
        const property = target.properties[key] as Property;
        if (property)
            propertiesMerged[key] = mergeProperty(property, source.properties[key]);
        else
            propertiesMerged[key] = source.properties[key];
    });

    const mergedCollection = mergeDeep(target, source, true);
    const targetPropertiesOrder = getCollectionKeys(target);
    const sourcePropertiesOrder = getCollectionKeys(source);
    const mergedPropertiesOrder = [...new Set([...sourcePropertiesOrder, ...targetPropertiesOrder])];
    const mergedEntityViews = [...new Set([...(target.entityViews ?? []), ...(source.entityViews ?? [])])];
    const mergedEntityActions = [...new Set([...(target.entityActions ?? []), ...(source.entityActions ?? [])])];

    let resultCollection: EntityCollection = {
        ...mergedCollection,
        subcollections: () => subcollectionsMerged,
        properties: sortProperties(propertiesMerged, mergedPropertiesOrder),
        propertiesOrder: mergedPropertiesOrder,
        entityViews: mergedEntityViews,
        entityActions: mergedEntityActions,
    };
    if (modifyCollection) {
        const modifiedCollection = modifyCollection({
            collection: resultCollection,
            parentPaths
        });
        if (modifiedCollection)
            resultCollection = modifiedCollection;
    }

    // @ts-ignore
    resultCollection["merged"] = true;

    return resultCollection
}

function mergeProperty(target: Property, source: Property): Property {
    if (isPropertyBuilder(source)) {
        return source;
    } else if (isPropertyBuilder(target)) {
        return target;
    } else {
        const mergedProperty = mergeDeep(target, source);

        if (source.type === "map" && source.properties) {
            const targetProperties = ("properties" in target ? target.properties : {}) as Properties;
            const sourceProperties = ("properties" in source ? source.properties : {}) as Properties;
            const targetPropertiesOrder = "propertiesOrder" in target && target.propertiesOrder ? target.propertiesOrder : Object.keys(targetProperties);
            const sourcePropertiesOrder = "propertiesOrder" in source && source.propertiesOrder ? source.propertiesOrder : ("properties" in source ? Object.keys(source.properties) : []);
            const mergedPropertiesOrder = [...new Set([...targetPropertiesOrder, ...sourcePropertiesOrder])];
            const mergedProperties: Properties = { ...targetProperties } as Properties;
            Object.keys(source.properties).forEach((key) => {
                const property = targetProperties[key] as Property;
                if (property)
                    mergedProperties[key] = mergeProperty(property, sourceProperties[key]);
            });
            return {
                ...mergedProperty,
                properties: mergedProperties,
                propertiesOrder: mergedPropertiesOrder
            } as MapProperty;
        }
        return {
            ...mergedProperty,
        };
    }
}

function getCollectionKeys(collection: EntityCollection) {
    if (collection.propertiesOrder && collection.propertiesOrder.length > 0) {
        const propertiesOrder = collection.propertiesOrder;
        if (collection.additionalFields) {
            collection.additionalFields.forEach((field) => {
                if (!propertiesOrder.includes(field.key)) {
                    propertiesOrder.push(field.key);
                }
            });
        }
        return propertiesOrder;
    }
    return [
        ...Object.keys(collection.properties),
        ...(collection.additionalFields ?? [])?.map(f => f.key)
    ];
}
