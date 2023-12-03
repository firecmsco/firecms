import { EntityCollection, MapProperty, PropertiesOrBuilders, Property, PropertyOrBuilder } from "../types";
import { mergeDeep } from "../util/objects";
import { sortProperties } from "../util/collections";
import { isPropertyBuilder } from "../util/entities";

/**
 *
 * @param storedCollections
 * @param codedCollections
 */
export function joinCollectionLists(storedCollections: EntityCollection[], codedCollections: EntityCollection[] | undefined): EntityCollection[] {

    // merge collections that are in both lists
    const updatedCollections = (codedCollections ?? [])
        .map((codedCollection) => {
            const storedCollection = storedCollections?.find((collection) => {
                return collection.path === codedCollection.path || (collection.alias && codedCollection.alias && collection.alias === codedCollection.alias);
            });
            if (!storedCollection) {
                return codedCollection;
            } else {
                return mergeCollection(storedCollection, codedCollection);
            }
        });

    // fetched collections that are not in the base collections
    const resultStoredCollections = storedCollections
        .filter((col) => !updatedCollections.map(c => c.path).includes(col.path) || !updatedCollections.map(c => c.alias).includes(col.alias));

    return [...updatedCollections, ...resultStoredCollections];
}

/**
 *
 * @param target
 * @param source
 */
export function mergeCollection(target: EntityCollection, source: EntityCollection): EntityCollection {

    const subcollectionsMerged = joinCollectionLists(target?.subcollections ?? [], source?.subcollections ?? []);

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
    const mergedPropertiesOrder = [...new Set([...targetPropertiesOrder, ...sourcePropertiesOrder])];
    const mergedEntityViews = [...new Set([...(target.entityViews ?? []), ...(source.entityViews ?? [])])];

    return {
        ...mergedCollection,
        subcollections: subcollectionsMerged,
        properties: sortProperties(propertiesMerged, mergedPropertiesOrder),
        propertiesOrder: mergedPropertiesOrder,
        entityViews: mergedEntityViews
    }
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
