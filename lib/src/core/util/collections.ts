import {
    EntityCollection,
    Properties,
    PropertiesOrBuilders,
    Property
} from "../../models";
import { mergeDeep } from "./objects";
import { editableProperty } from "./entities";

export function mergeCollections(target: EntityCollection, source: EntityCollection): EntityCollection {
    const subcollectionsMerged = target.subcollections?.map((targetSubcollection) => {
        const modifiedCollection = source.subcollections?.find((sourceSubcollection) => sourceSubcollection.path === targetSubcollection.path);
        if (!modifiedCollection) {
            return targetSubcollection;
        } else {
            return mergeCollections(targetSubcollection, modifiedCollection);
        }
    });

    const mergedCollection = mergeDeep(target, source);
    return {
        ...mergedCollection,
        subcollections: subcollectionsMerged,
        properties: sortProperties(mergedCollection.properties, mergedCollection.propertiesOrder)
    }
}

export function sortProperties<T>(properties: PropertiesOrBuilders<T>, propertiesOrder?: (keyof T)[]): PropertiesOrBuilders<T> {
    try {
        const propertiesKeys = Object.keys(properties);
        const allPropertiesOrder = propertiesOrder ?? propertiesKeys;
        return allPropertiesOrder
            .map((key) => {
                if (properties[key as keyof T]) {
                    const property = properties[key] as Property;
                    if (typeof property === "object" && property?.dataType === "map") {
                        return ({
                            [key]: {
                                ...property,
                                properties: sortProperties(property.properties ?? {}, property.propertiesOrder)
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
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<T>;
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}

export function removeNonEditableProperties(properties: PropertiesOrBuilders<any>): Properties {
    return Object.entries(properties)
        .filter(([_, property]) => editableProperty(property))
        .map(([key, propertyOrBuilder]) => {
            const property = propertyOrBuilder as Property;
            if (!editableProperty(property)) {
                return undefined;
            } else if (property.dataType === "map" && property.properties) {
                return {
                    [key]: {
                        ...property,
                        properties: removeNonEditableProperties(property.properties)
                    }
                };
            } else {
                return { [key]: property };
            }
        })
        .filter((e) => Boolean(e))
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties;
}

export function getFistAdditionalView<M>(collection: EntityCollection<M>) {
    const subcollections = collection.subcollections;
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.views;
    const customViewsCount = customViews?.length ?? 0;
    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;
    return !hasAdditionalViews ? undefined : (customViews && customViews?.length > 0 ? customViews[0] : (subcollections && subcollections?.length > 0 ? subcollections[0] : undefined));
}
