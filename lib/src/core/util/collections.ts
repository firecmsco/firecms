import {
    CMSType,
    EntityCollection,
    PropertiesOrBuilders,
    Property, PropertyOrBuilder, ResolvedEntityCollection
} from "../../models";
import { mergeDeep } from "./objects";
import { isPropertyBuilder } from "./entities";

export function mergeCollections(target: EntityCollection, source: EntityCollection): EntityCollection {
    const subcollectionsMerged = target.subcollections?.map((targetSubcollection) => {
        const modifiedCollection =
            source.subcollections?.find((sourceSubcollection) => sourceSubcollection.path === targetSubcollection.path) ??
            source.subcollections?.find((sourceSubcollection) => sourceSubcollection.alias === targetSubcollection.alias);

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

export function sortProperties<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, propertiesOrder?: (keyof M)[]): PropertiesOrBuilders<M> {
    try {
        const propertiesKeys = Object.keys(properties);
        const allPropertiesOrder = propertiesOrder ?? propertiesKeys;
        return allPropertiesOrder
            .map((key) => {
                if (properties[key as keyof M]) {
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
                } else {
                    return undefined;
                }
            })
            .filter((a) => a !== undefined)
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<M>;
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}

export function getFistAdditionalView<M extends Record<string, any>>(collection: EntityCollection<M> | ResolvedEntityCollection<M>) {
    const subcollections = collection.subcollections;
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.views;
    const customViewsCount = customViews?.length ?? 0;
    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;
    return !hasAdditionalViews ? undefined : (customViews && customViews?.length > 0 ? customViews[0] : (subcollections && subcollections?.length > 0 ? subcollections[0] : undefined));
}
