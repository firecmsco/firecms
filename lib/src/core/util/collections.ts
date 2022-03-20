import { EntityCollection, PropertiesOrBuilder, Property } from "../../models";
import { mergeDeep, removeFunctions } from "./objects";
import {
    setUndefinedToDelete
} from "../../firebase_app/hooks/useBuildFirestoreConfigurationPersistence";

export function prepareCollectionForPersistence<M>(collection: EntityCollection<M>) {
    const properties = setUndefinedToDelete(removeFunctions(collection.properties));
    const newCollection = {
        ...collection,
        properties
    };
    delete newCollection.permissions;
    delete newCollection.views;
    delete newCollection.additionalColumns;
    delete newCollection.callbacks;
    delete newCollection.extraActions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    return newCollection;
}

export function mergeCollections(target: EntityCollection, source: EntityCollection): EntityCollection {
    const subcollectionsMerged = target.subcollections?.map((targetSubcollection) => {
        const modifiedSchema = source.subcollections?.find((sourceSubcollection) => sourceSubcollection.path === targetSubcollection.path);
        if (!modifiedSchema) {
            return targetSubcollection;
        } else {
            return mergeCollections(targetSubcollection, modifiedSchema);
        }
    });

    const mergedCollection = mergeDeep(target, source);
    return {
        ...mergedCollection,
        subcollections: subcollectionsMerged,
        properties: sortProperties(mergedCollection.properties, mergedCollection.propertiesOrder)
    }
}

export function sortProperties<T>(properties: PropertiesOrBuilder<T>, propertiesOrder?: (keyof T)[]): PropertiesOrBuilder<T> {
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
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilder<T>;
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}
