import {
    DefaultSelectedViewBuilder,
    DefaultSelectedViewParams,
    EntityCollection,
    PropertiesOrBuilders,
    PropertyOrBuilder
} from "../../types";
import { mergeDeep } from "./objects";
import { isPropertyBuilder } from "./entities";

function getCollectionKeys(collection: EntityCollection) {
    return [
        ...Object.keys(collection.properties),
        ...(collection.additionalFields ?? [])?.map(f => f.id)
    ];
}

/**
 *
 * @param target
 * @param source
 */
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
    const targetPropertiesOrder = target.propertiesOrder ?? getCollectionKeys(target);
    const sourcePropertiesOrder = source.propertiesOrder ?? getCollectionKeys(source);
    const mergedPropertiesOrder = [...new Set([...targetPropertiesOrder, ...sourcePropertiesOrder])];
    const mergedEntityViews = [...new Set([...(target.entityViews ?? []), ...(source.entityViews ?? [])])];

    return {
        ...mergedCollection,
        subcollections: subcollectionsMerged,
        properties: sortProperties(mergedCollection.properties, mergedPropertiesOrder),
        propertiesOrder: mergedPropertiesOrder,
        entityViews: mergedEntityViews
    }
}

/**
 *
 * @param fetchedCollections
 * @param baseCollections
 */
export function joinCollectionLists(fetchedCollections: EntityCollection[], baseCollections: EntityCollection[] | undefined): EntityCollection[] {
    const resolvedFetchedCollections: EntityCollection[] = fetchedCollections.map(c => ({
        ...c,
        editable: true,
        deletable: true
    }));
    const updatedCollections = (baseCollections ?? [])
        .map((navigationCollection) => {
            const storedCollection = resolvedFetchedCollections?.find((collection) => {
                return collection.path === navigationCollection.path || (collection.alias && navigationCollection.alias && collection.alias === navigationCollection.alias);
            });
            if (!storedCollection) {
                return { ...navigationCollection, deletable: false };
            } else {
                const mergedCollection = mergeCollections(storedCollection, navigationCollection);
                return { ...mergedCollection, deletable: false };
            }
        });
    const storedCollections = resolvedFetchedCollections
        .filter((col) => !updatedCollections.map(c => c.path).includes(col.path) || !updatedCollections.map(c => c.alias).includes(col.alias));

    return [...updatedCollections, ...storedCollections];
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
