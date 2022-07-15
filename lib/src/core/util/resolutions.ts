import {
    ArrayProperty,
    EntityCollection,
    EntityValues,
    EnumValueConfig,
    EnumValues,
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
} from "../../models";
import { getValueInPath, mergeDeep } from "./objects";
import { getDefaultValuesFor, isPropertyBuilder } from "./entities";
import { DEFAULT_ONE_OF_TYPE } from "./common";
import { getIn } from "formik";

export const resolveCollection = <M extends { [Key: string]: any } = any, >
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
    const usedValues = values ?? defaultValues;
    const usedPreviousValues = previousValues ?? values ?? defaultValues;

    const resolvedProperties = Object.entries(collection.properties)
        .map(([key, propertyOrBuilder]) => ({
            [key]: resolveProperty({
                propertyOrBuilder,
                values: usedValues,
                previousValues: usedPreviousValues,
                path,
                propertyValue: usedValues ? getIn(usedValues, key) : undefined,
                entityId
            })
        }))
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
export function resolveProperty<T, M>({
                                          propertyOrBuilder,
                                          propertyValue,
                                          fromBuilder = false,
                                          ...props
                                      }: {
    propertyOrBuilder: PropertyOrBuilder<T> | ResolvedProperty<T>,
    propertyValue?: unknown,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean
}): ResolvedProperty | null {

    if (typeof propertyOrBuilder === "object" && "resolved" in propertyOrBuilder) {
        return propertyOrBuilder as ResolvedProperty;
    }

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

        return resolveProperty({
            ...props,
            propertyOrBuilder: result,
            fromBuilder: true
        });
    } else if (propertyOrBuilder.dataType === "map" && propertyOrBuilder.properties) {
        const properties = resolveProperties({
            ...props,
            properties: propertyOrBuilder.properties as PropertiesOrBuilders,
            propertyValue
        });
        return {
            ...propertyOrBuilder,
            fromBuilder,
            properties
        } as ResolvedProperty;
    } else if (propertyOrBuilder.dataType === "array") {
        return resolveArrayProperty({
            property: propertyOrBuilder,
            propertyValue,
            fromBuilder,
            ...props
        })
    } else if ((propertyOrBuilder.dataType === "string" || propertyOrBuilder.dataType === "number") && propertyOrBuilder.enumValues) {
        return resolvePropertyEnum(propertyOrBuilder, fromBuilder);
    }

    return {
        ...propertyOrBuilder,
        resolved: true,
        fromBuilder
    } as ResolvedProperty;
}

export function resolveArrayProperty<T extends any[], M>({
                                                             property,
                                                             propertyValue,
                                                             ...props
                                                         }: {
    property: ArrayProperty<T> | ResolvedArrayProperty<T>,
    propertyValue: unknown,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path?: string,
    entityId?: string,
    index?: number,
    fromBuilder?: boolean
}): ResolvedArrayProperty {

    if (property.of) {
        if (Array.isArray(property.of)) {
            return {
                ...property,
                resolved: true,
                fromBuilder: props.fromBuilder,
                resolvedProperties: property.of.map((p, index) => {
                    return resolveProperty({
                        propertyOrBuilder: p as Property<any>,
                        propertyValue: Array.isArray(propertyValue) ? propertyValue[index] : undefined,
                        ...props
                    });
                })
            } as ResolvedArrayProperty;
        } else {
            const of = property.of;
            const resolvedProperties: ResolvedProperty[] = Array.isArray(propertyValue)
                ? propertyValue.map((v: any, index: number) => resolveProperty({
                    propertyOrBuilder: of,
                    propertyValue: v,
                    index,
                    ...props
                })).filter(e => Boolean(e)) as ResolvedProperty[]
                : [];
            const ofProperty = resolveProperty({
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
                    propertyOrBuilder: childProperty,
                    propertyValue,
                    ...props
                });
            }).filter(e => Boolean(e)) as ResolvedProperty[]
            : [];
        const properties = resolveProperties({
            properties: property.oneOf.properties as PropertiesOrBuilders,
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
export function resolveProperties<M>({
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
    fromBuilder?: boolean
}): ResolvedProperties<M> {
    return Object.entries<PropertyOrBuilder>(properties as Record<string, PropertyOrBuilder>)
        .map(([key, property]) => {
            return {
                [key]: resolveProperty({
                    propertyOrBuilder: property,
                    propertyValue: propertyValue && typeof propertyValue === "object" ? propertyValue[key] : undefined,
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
            (typeof value === "string" ? { id, label: value } : value));
    } else if (Array.isArray(input)) {
        return input as EnumValueConfig[];
    } else {
        return undefined;
    }
}
