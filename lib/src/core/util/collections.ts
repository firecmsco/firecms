import {
    EntityCollection,
    EntityValues,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty,
    UserConfigurationPersistence
} from "../../models";
import { getValueInPath, mergeDeep } from "./objects";
import {
    computePropertyEnums,
    getDefaultValuesFor,
    resolvePropertyBuilders
} from "./entities";

export const getResolvedCollection = <M extends { [Key: string]: any } = any, >
({
     collection,
     path,
     entityId,
     values,
     previousValues,
     userConfigPersistence
 }: {
    collection: EntityCollection<M> | ResolvedEntityCollection<M>;
    path: string,
    entityId?: string,
    values?: Partial<EntityValues<M>>,
    previousValues?: Partial<EntityValues<M>>,
    userConfigPersistence?: UserConfigurationPersistence
}): ResolvedEntityCollection<M> => {

    const collectionOverride = userConfigPersistence?.getCollectionConfig<M>(path);
    const storedProperties = getValueInPath(collectionOverride, "properties");

    const defaultValues = getDefaultValuesFor(collection.properties);
    const resolvedProperties = resolveProperties<M>({
        propertiesOrBuilder: collection.properties,
        path,
        entityId,
        values: values ?? defaultValues,
        previousValues: previousValues ?? values ?? defaultValues,
    });

    const properties: Properties = mergeDeep(resolvedProperties, storedProperties);
    const cleanedProperties = Object.entries(properties)
        .filter(([_, property]) => Boolean(property.dataType))
        .map(([id, property]) => ({ [id]: property }))
        .reduce((a, b) => ({ ...a, ...b }), {});

    return {
        ...collection,
        properties: cleanedProperties,
        originalCollection: collection
    } as ResolvedEntityCollection<M>;

};

export function resolvePropertyBuilder<M>({
                                              propertyOrBuilder,
                                              values,
                                              previousValues,
                                              path,
                                              entityId,
                                              propertyId
                                          }: {
    propertyOrBuilder: PropertyOrBuilder,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path: string,
    entityId: string | undefined,
    propertyId: string,
}): ResolvedProperty | null {
    try {
        const property = resolvePropertyBuilders({
            propertyOrBuilder,
            values: values ?? {},
            previousValues: previousValues ?? values ?? {},
            path,
            entityId
        });
        if (property === null) return null;
        return computePropertyEnums(property) as ResolvedProperty;
    } catch (e) {
        console.error("Error resolving property " + propertyId);
        console.error(e);
        return null;
    }
}

/**
 *
 * @param propertiesOrBuilder
 * @param values
 * @param previousValues
 * @param path
 * @param entityId
 * @param enumConfigs
 * @ignore
 */
function resolveProperties<M extends { [Key: string]: any }>(
    {
        propertiesOrBuilder,
        path,
        entityId,
        values,
        previousValues,
    }: {
        propertiesOrBuilder: PropertiesOrBuilder<M> | ResolvedProperties<M>,
        path: string,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): ResolvedProperties<M> {
    return Object.entries(propertiesOrBuilder)
        .map(([key, propertyOrBuilder]) => {

            return {
                [key]: resolvePropertyBuilder({
                    propertyOrBuilder: propertyOrBuilder,
                    values: values,
                    previousValues: previousValues,
                    path: path,
                    entityId: entityId,
                    propertyId: key,
                })
            };
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;
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
    if (typeof property === "function")
        return false;
    else if (property.editable === undefined)
        return true;
    return property.editable;
}
