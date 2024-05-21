import {
    ArrayProperty,
    CMSType,
    EntityCollection,
    EntityCustomView,
    EntityValues,
    EnumValueConfig,
    EnumValues,
    NumberProperty,
    Properties,
    PropertiesOrBuilders,
    Property,
    PropertyConfig,
    PropertyOrBuilder,
    ResolvedArrayProperty,
    ResolvedEntityCollection,
    ResolvedNumberProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty,
    StringProperty,
    UserConfigurationPersistence
} from "../types";
import { getValueInPath, mergeDeep } from "./objects";
import { getDefaultValuesFor, isPropertyBuilder } from "./entities";
import { DEFAULT_ONE_OF_TYPE } from "./common";
import { getIn } from "@firecms/formex";
import { enumToObjectEntries } from "./enums";
import { isDefaultFieldConfigId } from "../core/field_configs";

// import util from "util";

export const resolveCollection = <M extends Record<string, any>, >
({
     collection,
     path,
     entityId,
     values,
     previousValues,
     userConfigPersistence,
     fields,
     ignoreMissingFields = false
 }: {
    collection: EntityCollection<M> | ResolvedEntityCollection<M>;
    path: string,
    entityId?: string,
    values?: Partial<EntityValues<M>>,
    previousValues?: Partial<EntityValues<M>>,
    userConfigPersistence?: UserConfigurationPersistence;
    fields?: Record<string, PropertyConfig>;
    ignoreMissingFields?: boolean;
}): ResolvedEntityCollection<M> => {

    const collectionOverride = userConfigPersistence?.getCollectionConfig<M>(path);
    const storedProperties = getValueInPath(collectionOverride, "properties");

    const defaultValues = getDefaultValuesFor(collection.properties);
    const usedValues = values ?? defaultValues;
    const usedPreviousValues = previousValues ?? values ?? defaultValues;

    const resolvedProperties = Object.entries(collection.properties)
        .map(([key, propertyOrBuilder]) => {
            const childResolvedProperty = resolveProperty({
                propertyKey: key,
                propertyOrBuilder: propertyOrBuilder as PropertyOrBuilder | ResolvedProperty,
                values: usedValues,
                previousValues: usedPreviousValues,
                path,
                entityId,
                fields,
                ignoreMissingFields
            });
            if (!childResolvedProperty) return {};
            return ({
                [key]: childResolvedProperty
            });
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;

    const properties: Properties = mergeDeep(resolvedProperties, storedProperties);
    const cleanedProperties = Object.entries(properties)
        .filter(([_, property]) => Boolean(property?.dataType))
        .map(([id, property]) => ({ [id]: property }))
        .reduce((a, b) => ({ ...a, ...b }), {});

    return {
        ...collection,
        properties: cleanedProperties,
        originalCollection: collection
    } as ResolvedEntityCollection<M>;

};

/**
 * Resolve property builders, enums and arrays.
 * @param propertyOrBuilder
 * @param propertyValue
 */
export function resolveProperty<T extends CMSType = CMSType, M extends Record<string, any> = any>({
                                                                                                      propertyOrBuilder,
                                                                                                      fromBuilder = false,
                                                                                                      ignoreMissingFields = false,
                                                                                                      ...props
                                                                                                  }: {
    propertyKey?: string,
    propertyOrBuilder: PropertyOrBuilder<T, M> | ResolvedProperty<T>,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, PropertyConfig<any>>;
    ignoreMissingFields?: boolean;
}): ResolvedProperty<T> | null {

    if (typeof propertyOrBuilder === "object" && "resolved" in propertyOrBuilder) {
        return propertyOrBuilder as ResolvedProperty<T>;
    }

    let resolvedProperty: ResolvedProperty<T> | null = null;

    if (!propertyOrBuilder) {
        return null;
    } else if (isPropertyBuilder(propertyOrBuilder)) {
        const path = props.path;
        if (!path)
            throw Error("Trying to resolve a property builder without specifying the entity path");

        const usedPropertyValue = props.propertyKey ? getIn(props.values, props.propertyKey) : undefined;
        const result: Property<T> | null = propertyOrBuilder({
            ...props,
            path,
            propertyValue: usedPropertyValue,
            values: props.values ?? {},
            previousValues: props.previousValues ?? props.values ?? {}
        });

        if (!result) {
            return null;
        }

        resolvedProperty = resolveProperty({
            ...props,
            propertyOrBuilder: result,
            fromBuilder: true,
            ignoreMissingFields
        });
    } else {
        const property = propertyOrBuilder as Property<T>;
        if (property.dataType === "map" && property.properties) {
            const properties = resolveProperties({
                ignoreMissingFields,
                ...props,
                properties: property.properties,
            });
            resolvedProperty = {
                ...property,
                resolved: true,
                fromBuilder,
                properties
            } as ResolvedProperty<T>;
        } else if (property.dataType === "array") {
            resolvedProperty = resolveArrayProperty({
                property,
                fromBuilder,
                ignoreMissingFields,
                ...props
            }) as ResolvedProperty<any>;
        } else if ((property.dataType === "string" || property.dataType === "number") && property.enumValues) {
            resolvedProperty = resolvePropertyEnum(property, fromBuilder) as ResolvedProperty<any>;
        }
    }

    if (!resolvedProperty) {
        resolvedProperty = {
            ...propertyOrBuilder,
            resolved: true,
            fromBuilder
        } as ResolvedProperty<T>;
    }

    if (resolvedProperty.propertyConfig && !isDefaultFieldConfigId(resolvedProperty.propertyConfig)) {
        const cmsFields = props.fields;
        if (!cmsFields && !ignoreMissingFields) {
            throw Error(`Trying to resolve a property with key '${resolvedProperty.propertyConfig}' that inherits from a custom property config but no custom property configs were provided. Use the property 'propertyConfigs' in your app config to provide them`);
        }
        const customField: PropertyConfig | undefined = cmsFields?.[resolvedProperty.propertyConfig];
        if (!customField) {
            console.warn(`Trying to resolve a property with key '${resolvedProperty.propertyConfig}' that inherits from a custom property config but no custom property config with that key was found. Check the 'propertyConfigs' in your app config`)
            console.warn("Available property configs", cmsFields);
            return null;
        }
        if (customField.property) {
            const configPropertyOrBuilder = customField.property;
            if ("propertyConfig" in configPropertyOrBuilder) {
                delete configPropertyOrBuilder.propertyConfig;
            }
            const customFieldProperty = resolveProperty<any>({
                propertyOrBuilder: configPropertyOrBuilder,
                ignoreMissingFields,
                ...props
            });
            if (customFieldProperty) {
                resolvedProperty = mergeDeep(customFieldProperty, resolvedProperty);
            }
        }

    }

    return resolvedProperty
        ? {
            ...resolvedProperty,
            resolved: true
        }
        : null;
}

export function resolveArrayProperty<T extends any[], M>({
                                                             propertyKey,
                                                             property,
                                                             ignoreMissingFields = false,
                                                             ...props
                                                         }: {
    propertyKey?: string,
    property: ArrayProperty<T> | ResolvedArrayProperty<T>,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, PropertyConfig>;
    ignoreMissingFields?: boolean;
}): ResolvedArrayProperty {
    const propertyValue = propertyKey ? getIn(props.values, propertyKey) : undefined;

    if (property.of) {
        if (Array.isArray(property.of)) {
            return {
                ...property,
                resolved: true,
                fromBuilder: props.fromBuilder,
                resolvedProperties: property.of.map((p, index) => {
                    return resolveProperty({
                        propertyKey: `${propertyKey}.${index}`,
                        propertyOrBuilder: p as Property<any>,
                        ignoreMissingFields,
                        ...props,
                        index
                    });
                })
            } as ResolvedArrayProperty;
        } else {
            const of = property.of;
            const resolvedProperties: ResolvedProperty[] = Array.isArray(propertyValue)
                ? propertyValue.map((v: any, index: number) => resolveProperty({
                    propertyKey: `${propertyKey}.${index}`,
                    propertyOrBuilder: of,
                    ignoreMissingFields,
                    ...props,
                    index
                })).filter(e => Boolean(e)) as ResolvedProperty[]
                : [];
            const ofProperty = resolveProperty({
                propertyKey: `${propertyKey}`,
                propertyOrBuilder: of,
                ignoreMissingFields,
                ...props
            });
            if (!ofProperty && !ignoreMissingFields)
                throw Error("When using a property builder as the 'of' prop of an ArrayProperty, you must return a valid child property")
            return {
                ...property,
                resolved: true,
                fromBuilder: props.fromBuilder,
                of: ofProperty,
                resolvedProperties
            } as ResolvedArrayProperty;
        }
    } else if (property.oneOf) {
        const typeField = property.oneOf?.typeField ?? DEFAULT_ONE_OF_TYPE;
        const resolvedProperties: ResolvedProperty[] = Array.isArray(propertyValue)
            ? propertyValue.map((v, index) => {
                const type = v && v[typeField];
                const childProperty = property.oneOf?.properties[type];
                if (!type || !childProperty) return null;
                return resolveProperty({
                    propertyKey: `${propertyKey}.${index}`,
                    propertyOrBuilder: childProperty,
                    ignoreMissingFields,
                    ...props
                });
            }).filter(e => Boolean(e)) as ResolvedProperty[]
            : [];
        const properties = resolveProperties<any>({
            properties: property.oneOf.properties,
            ignoreMissingFields,
            ...props
        });
        return {
            ...property,
            resolved: true,
            oneOf: {
                ...property.oneOf,
                properties
            },
            fromBuilder: props.fromBuilder,
            resolvedProperties
        } as ResolvedArrayProperty;
    } else if (!property.Field) {
        throw Error("The array property needs to declare an 'of' or a 'oneOf' property, or provide a custom `Field`")
    } else {
        return {
            ...property,
            resolved: true,
            fromBuilder: props.fromBuilder
        } as ResolvedArrayProperty;
    }

}

/**
 * Resolve enums and arrays for properties
 * @param properties
 * @param value
 */
export function resolveProperties<M extends Record<string, any>>({
                                                                     properties,
                                                                     ignoreMissingFields,
                                                                     ...props
                                                                 }: {
    properties: PropertiesOrBuilders<M>,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, PropertyConfig>;
    ignoreMissingFields?: boolean;
}): ResolvedProperties<M> {
    return Object.entries<PropertyOrBuilder>(properties as Record<string, PropertyOrBuilder>)
        .map(([key, property]) => {
            const childResolvedProperty = resolveProperty({
                propertyKey: key,
                propertyOrBuilder: property,
                ignoreMissingFields,
                ...props
            });
            if (!childResolvedProperty) return {};
            return {
                [key]: childResolvedProperty
            };
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;
}

/**
 * Resolve enum aliases for a string or number property
 * @param property
 * @param fromBuilder
 */
export function resolvePropertyEnum(property: StringProperty | NumberProperty, fromBuilder?: boolean): ResolvedStringProperty | ResolvedNumberProperty {
    if (typeof property.enumValues === "object") {
        return {
            ...property,
            resolved: true,
            enumValues: enumToObjectEntries(property.enumValues)?.filter((value) => value && (value.id || value.id === 0) && value.label) ?? [],
            fromBuilder: fromBuilder ?? false
        }
    }
    return property as ResolvedStringProperty | ResolvedNumberProperty;
}

export function resolveEnumValues(input: EnumValues): EnumValueConfig[] | undefined {
    if (typeof input === "object") {
        return Object.entries(input).map(([id, value]) =>
            (typeof value === "string"
                ? {
                    id,
                    label: value
                }
                : value));
    } else if (Array.isArray(input)) {
        return input as EnumValueConfig[];
    } else {
        return undefined;
    }
}

export function resolveEntityView(entityView: string | EntityCustomView<any>, contextEntityViews?: EntityCustomView<any>[]): EntityCustomView<any> | undefined {
    if (typeof entityView === "string") {
        return contextEntityViews?.find((entry) => entry.key === entityView);
    } else {
        return entityView;
    }
}
