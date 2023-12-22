import {
    EntityCollection,
    MapProperty,
    ModifyCollectionProps,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder
} from "../types";
import { mergeDeep } from "./objects";
import { sortProperties } from "./collections";
import { isPropertyBuilder } from "./entities";

/**
 *
 */
export function joinCollectionLists(targetCollections: EntityCollection[],
                                    sourceCollections: EntityCollection[] | undefined,
                                    parentPaths: string[] = [],
                                    modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | undefined): EntityCollection[] {

    // merge collections that are in both lists
    const updatedCollections = (sourceCollections ?? [])
        .map((codedCollection) => {
            const storedCollection = targetCollections?.find((collection) => {
                return collection.id === codedCollection.id;
                // return collection.path === codedCollection.path || collection.id && codedCollection.id;
            });
            if (!storedCollection) {
                return codedCollection;
            } else {
                return mergeCollection(storedCollection, codedCollection, parentPaths, modifyCollection);
            }
        });

    // fetched collections that are not in the base collections
    const resultStoredCollections = targetCollections
        .filter((col) => !updatedCollections.map(c => c.id).includes(col.id))
        .map((col) => {
            if (modifyCollection) {
                const modified = modifyCollection({ collection: col, parentPaths });
                return modified ?? col;
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
                                modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | undefined
): EntityCollection {

    const subcollectionsMerged = joinCollectionLists(
        target?.subcollections ?? [],
        source?.subcollections ?? [],
        [...parentPaths, target.path],
        modifyCollection
    );

    const propertiesMerged: PropertiesOrBuilders = { ...target.properties } as PropertiesOrBuilders;
    Object.keys(source.properties).forEach((key) => {
        const property = target.properties[key] as Property;
        if (property)
            propertiesMerged[key] = mergePropertyOrBuilder(property, source.properties[key] as PropertyOrBuilder);
        else
            propertiesMerged[key] = source.properties[key] as PropertyOrBuilder;
    });

    const mergedCollection = mergeDeep(target, source);
    const targetPropertiesOrder = getCollectionKeys(target);
    const sourcePropertiesOrder = getCollectionKeys(source);
    const mergedPropertiesOrder = [...new Set([...sourcePropertiesOrder, ...targetPropertiesOrder])];
    const mergedEntityViews = [...new Set([...(target.entityViews ?? []), ...(source.entityViews ?? [])])];

    let resultCollection: EntityCollection = {
        ...mergedCollection,
        subcollections: subcollectionsMerged,
        properties: sortProperties(propertiesMerged, mergedPropertiesOrder),
        propertiesOrder: mergedPropertiesOrder,
        entityViews: mergedEntityViews
    };
    if (modifyCollection) {
        const modifiedCollection = modifyCollection({ collection: resultCollection, parentPaths });
        if (modifiedCollection)
            resultCollection = modifiedCollection;
    }
    return resultCollection
}

function mergePropertyOrBuilder(target: Property, source: PropertyOrBuilder): PropertyOrBuilder {
    if (isPropertyBuilder(source)) {
        return source;
    } else {
        const mergedProperty = mergeDeep(target, source);
        const targetEditable = Boolean(target.editable);
        const sourceEditable = Boolean(source.editable);
        if (source.dataType === "map" && source.properties) {
            const targetProperties = ("properties" in target ? target.properties : {}) as PropertiesOrBuilders;
            const sourceProperties = ("properties" in source ? source.properties : {}) as PropertiesOrBuilders;
            const targetPropertiesOrder = "propertiesOrder" in target && target.propertiesOrder ? target.propertiesOrder : Object.keys(targetProperties);
            const sourcePropertiesOrder = "propertiesOrder" in source && source.propertiesOrder ? source.propertiesOrder : ("properties" in source ? Object.keys(source.properties) : []);
            const mergedPropertiesOrder = [...new Set([...targetPropertiesOrder, ...sourcePropertiesOrder])];
            const mergedProperties: PropertiesOrBuilders = { ...targetProperties } as PropertiesOrBuilders;
            Object.keys(source.properties).forEach((key) => {
                const property = targetProperties[key] as Property;
                if (property)
                    mergedProperties[key] = mergePropertyOrBuilder(property, sourceProperties[key] as PropertyOrBuilder);
            });
            return { ...mergedProperty, editable: targetEditable && sourceEditable, properties: mergedProperties, propertiesOrder: mergedPropertiesOrder } as MapProperty;
        }
        return { ...mergedProperty, editable: targetEditable && sourceEditable };
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
