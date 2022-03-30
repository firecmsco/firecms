import {
    EntityCollection,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder
} from "../../models";
import { mergeDeep, removeFunctions } from "./objects";
import {
    setUndefinedToDelete
} from "../../firebase_app/hooks/useBuildFirestoreConfigurationPersistence";

export function prepareCollectionForPersistence<M>(collection: EntityCollection<M>) {
    const properties = setUndefinedToDelete(removeFunctions(removeNonEditableProperties(collection.properties)));
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

export function removeNonEditableProperties(properties: PropertiesOrBuilder<any>): Properties {
    return Object.entries(properties)
        .filter(([key, property]) => typeof property !== "function")
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

export function editableProperty(property: PropertyOrBuilder): boolean {
    if (typeof property === "function") return false;
    else if (property.editable === undefined) return true;
    return property.editable;
}
