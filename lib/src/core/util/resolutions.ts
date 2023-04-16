import {
    ArrayProperty,
    CMSType,
    EntityCollection,
    EntityValues,
    EnumValueConfig,
    EnumValues,
    FieldConfig,
    NumberProperty,
    Properties,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder,
    ResolvedArrayProperty,
    ResolvedEntityCollection,
    ResolvedNumberProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty,
    StringProperty,
    UserConfigurationPersistence
} from "../../types";
import { getValueInPath, mergeDeep } from "./objects";
import { getDefaultValuesFor, isPropertyBuilder } from "./entities";
import { DEFAULT_ONE_OF_TYPE } from "./common";
import { getIn } from "formik";

export const resolveCollection = <M extends Record<string, any>, >
({
     collection,
     path,
     entityId,
     values,
     previousValues,
     userConfigPersistence,
     fields
 }: {
    collection: EntityCollection<M> | ResolvedEntityCollection<M>;
    path: string,
    entityId?: string,
    values?: Partial<EntityValues<M>>,
    previousValues?: Partial<EntityValues<M>>,
    userConfigPersistence?: UserConfigurationPersistence;
    fields?: Record<string, FieldConfig>;
}): ResolvedEntityCollection<M> => {

    const collectionOverride = userConfigPersistence?.getCollectionConfig<M>(path);
    const storedProperties = getValueInPath(collectionOverride, "properties");

    const defaultValues = getDefaultValuesFor(collection.properties);
    const usedValues = values ?? defaultValues;
    const usedPreviousValues = previousValues ?? values ?? defaultValues;

    const resolvedProperties = Object.entries(collection.properties)
        .map(([key, propertyOrBuilder]) => {
            const propertyValue = usedValues ? getIn(usedValues, key) : undefined;
            return ({
                [key]: resolveProperty({
                    propertyKey: key,
                    propertyOrBuilder: propertyOrBuilder as PropertyOrBuilder | ResolvedProperty,
                    values: usedValues,
                    previousValues: usedPreviousValues,
                    path,
                    propertyValue,
                    entityId,
                    fields
                })
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
 * @param values
 */
export function resolveProperty<T extends CMSType = CMSType, M extends Record<string, any> = any>({
                                                                                                      propertyOrBuilder,
                                                                                                      propertyValue,
                                                                                                      fromBuilder = false,
                                                                                                      ...props
                                                                                                  }: {
    propertyKey?: string,
    propertyOrBuilder: PropertyOrBuilder<T, M> | ResolvedProperty<T>,
    propertyValue?: unknown,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, FieldConfig<any>>;
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

        const result: Property<T> | null = propertyOrBuilder({
            ...props,
            path,
            propertyValue,
            values: props.values ?? {},
            previousValues: props.previousValues ?? props.values ?? {}
        });

        if (!result) {
            console.debug("Property builder not returning `Property` so it is not rendered", path, props.entityId, propertyOrBuilder);
            return null;
        }

        resolvedProperty = resolveProperty({
            ...props,
            propertyValue,
            propertyOrBuilder: result,
            fromBuilder: true
        });
    } else {
        const property = propertyOrBuilder as Property<T>;
        if (property.dataType === "map" && property.properties) {
            const properties = resolveProperties({
                ...props,
                properties: property.properties,
                propertyValue
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
                propertyValue,
                fromBuilder,
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

    if (resolvedProperty.fieldConfig) {
        const cmsFields = props.fields;
        if (!cmsFields)
            throw Error("Trying to resolve a property that inherits from a custom field but no custom fields were provided. Use the property `fields` in your top level component to provide them");
        const customField: FieldConfig<any> = cmsFields[resolvedProperty.fieldConfig];
        if (!customField)
            throw Error(`Trying to resolve a property that inherits from a custom field but no custom field with id ${resolvedProperty.fieldConfig} was found. Check the \`fields\` in your top level component`);
        if (customField.defaultProperty) {
            const customFieldProperty = resolveProperty<any>({
                propertyOrBuilder: customField.defaultProperty,
                propertyValue,
                ...props
            });
            if (customFieldProperty) {
                resolvedProperty = mergeDeep(customFieldProperty, resolvedProperty);
            }
        }
        if (customField.Field) {
            resolvedProperty!.Field = customField.Field;
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
                                                             propertyValue,
                                                             ...props
                                                         }: {
    propertyKey?: string,
    property: ArrayProperty<T> | ResolvedArrayProperty<T>,
    propertyValue: any,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, FieldConfig>;
}): ResolvedArrayProperty {

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
                        propertyValue: Array.isArray(propertyValue) ? propertyValue[index] : undefined,
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
                    propertyValue: v,
                    ...props,
                    index
                })).filter(e => Boolean(e)) as ResolvedProperty[]
                : [];
            const ofProperty = resolveProperty({
                propertyKey: `${propertyKey}`,
                propertyOrBuilder: of,
                propertyValue: undefined,
                ...props
            });
            if (!ofProperty)
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
                    propertyValue,
                    ...props
                });
            }).filter(e => Boolean(e)) as ResolvedProperty[]
            : [];
        const properties = resolveProperties<any>({
            properties: property.oneOf.properties,
            propertyValue: undefined,
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
                                                                     propertyValue,
                                                                     ...props
                                                                 }: {
    properties: PropertiesOrBuilders<M>,
    propertyValue: unknown,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean;
    fields?: Record<string, FieldConfig>;
}): ResolvedProperties<M> {
    return Object.entries<PropertyOrBuilder>(properties as Record<string, PropertyOrBuilder>)
        .map(([key, property]) => {
            return {
                [key]: resolveProperty({
                    propertyKey: key,
                    propertyOrBuilder: property,
                    propertyValue: propertyValue && typeof propertyValue === "object" ? getValueInPath(propertyValue, key) : undefined,
                    ...props
                })
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
            enumValues: resolveEnumValues(property.enumValues)?.filter((value) => value && value.id && value.label) ?? [],
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
