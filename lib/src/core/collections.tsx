import React from "react";
import {
    EntityCollection,
    EntityValues,
    Properties,
    PropertiesOrBuilder,
    PropertyOrBuilder,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty,
    UserConfigurationPersistence
} from "../models";
import { getValueInPath, mergeDeep } from "./util/objects";
import {
    buildPropertyFrom,
    computePropertyEnums,
    getDefaultValuesFor
} from "./util/entities";

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


export function resolveProperty<M>({
                                       propertyOrBuilder,
                                       values,
                                       previousValues,
                                       path,
                                       entityId,
                                       propertyId,
                                   }: {
    propertyOrBuilder: PropertyOrBuilder,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path: string,
    entityId: string | undefined,
    propertyId: string,
}): ResolvedProperty | null {
    try {
        const property = buildPropertyFrom({
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
                [key]: resolveProperty({
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
