import {
    CMSType,
    Entity,
    EntityReference,
    EntitySchema,
    EntitySchemaResolver,
    EntityStatus,
    EntityValues,
    EnumConfig,
    EnumValueConfig,
    EnumValues,
    GeoPoint,
    NumberProperty,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder,
    ResolvedArrayProperty,
    ResolvedEntitySchema,
    ResolvedNumberProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty,
    SchemaRegistry,
    StringProperty
} from "../models";
import { mergeDeep } from "./util/objects";

export function isReadOnly(property: Property<any>): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "timestamp") {
        if (property.autoValue)
            return true;
    }
    if (property.dataType === "reference") {
        return !property.path;
    }
    return false;
}

export function isHidden(property: Property<any>): boolean {
    return typeof property.disabled === "object" && Boolean(property.disabled.hidden);
}

/**
 * This utility function computes an {@link EntitySchema} or a {@link EntitySchemaResolver}
 * into a {@link ResolvedEntitySchema}, which has no property builders but has all
 * the properties resolved.
 * @param schema
 * @param values
 * @param path
 * @param entityId
 * @category Hooks and utilities
 */
export function computeSchema<M extends { [Key: string]: any }>(
    {
        schemaResolver,
        entityId,
        values,
        previousValues
    }: {
        schemaResolver: EntitySchemaResolver<M>,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): ResolvedEntitySchema<M> {
    return schemaResolver({ entityId, values, previousValues });
}

/**
 *
 * @param propertiesOrBuilder
 * @param values
 * @param previousValues
 * @param path
 * @param entityId
 * @ignore
 */
export function computeProperties<M extends { [Key: string]: any }>(
    {
        propertiesOrBuilder,
        path,
        entityId,
        values,
        previousValues,
        enumConfigs
    }: {
        propertiesOrBuilder: PropertiesOrBuilder<M>,
        path: string,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
        enumConfigs: EnumConfig[]
    }): ResolvedProperties<M> {
    return Object.entries(propertiesOrBuilder)
        .map(([key, propertyOrBuilder]) => {
            const property = buildPropertyFrom({
                propertyOrBuilder,
                values: values ?? {},
                previousValues: previousValues ?? values ?? {},
                path,
                entityId
            });
            if (property === null) return null;
            return {
                [key]: computeEnum(
                    property,
                    enumConfigs)
            };
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;
}

/**
 * Replace enums declared as aliases for their corresponding enumValues,
 * defined in the root of the {@link SchemaRegistry}.
 * @param property
 * @param enumConfigs
 */
export function computeEnum(property: Property, enumConfigs: EnumConfig[]): ResolvedProperty {
    if (property.dataType === "map" && property.properties) {
        const properties = computeEnums(property.properties, enumConfigs);
        return {
            ...property,
            properties
        };
    } else if (property.dataType === "array" && property.of) {
        if (property.of) {
            return {
                ...property,
                of: computeEnum(property.of, enumConfigs)
            } as ResolvedArrayProperty;
        } else if (property.oneOf) {
            const properties = computeEnums(property.oneOf.properties, enumConfigs);
            return {
                ...property,
                oneOf: {
                    ...property.oneOf,
                    properties
                }
            } as ResolvedArrayProperty;
        }
    } else if ((property.dataType === "string" || property.dataType === "number") && property.enumValues) {
        return resolvePropertyEnum(property, enumConfigs);
    }
    return property as ResolvedProperty;
}

/**
 * Replace enums declared as aliases for their corresponding enumValues,
 * defined in the root of the {@link SchemaRegistry}.
 * @param properties
 * @param enumConfigs
 */
export function computeEnums<M>(properties: Properties<M>, enumConfigs: EnumConfig[]): ResolvedProperties<M> {
    return Object.entries<Property>(properties as Record<string, Property>)
        .map(([key, property]) => {
            return ({ [key]: computeEnum(property, enumConfigs) });
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;
}

/**
 * Resolve enum aliases for a string or number propery
 * @param property
 * @param enumConfigs
 */
export function resolvePropertyEnum(property: StringProperty | NumberProperty, enumConfigs: EnumConfig[]): ResolvedStringProperty | ResolvedNumberProperty {
    if (typeof property.enumValues === "string") {
        return {
            ...property,
            enumValues: resolveEnum(property.enumValues, enumConfigs) ?? [],
        }
    }
    return property as ResolvedStringProperty | ResolvedNumberProperty;
}

export function resolveEnum(input: EnumValues | string, enumConfigs: EnumConfig[]): EnumValueConfig[] | undefined {
    if (typeof input === "string") {
        const enumConfig = enumConfigs.find((ec) => ec.id === input);
        if (!enumConfig)
            throw Error("Not able to find enumConfig with id: " + input)
        return enumConfig.enumValues;
    } else if (typeof input === "object") {
        return Object.entries(input).map(([id, value]) =>
            (typeof value === "string" ? { id, label: value } : value));
    } else if (Array.isArray(input)) {
        return input as EnumValueConfig[];
    } else {
        return undefined;
    }
}

export function initWithProperties<M extends { [Key: string]: any }>
(properties: Properties<M> | ResolvedProperties<M>, defaultValues?: Partial<EntityValues<M>>): EntityValues<M> {
    return Object.entries(properties)
        .map(([key, property]) => {
            const propertyDefaultValue = defaultValues && key in defaultValues ? (defaultValues as any)[key] : undefined;
            const value = initPropertyValue(key, property as Property, propertyDefaultValue);
            return value === undefined ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

function initPropertyValue(key: string, property: Property, defaultValue: any) {
    let value: any;
    if (property.dataType === "map" && property.properties) {
        value = initWithProperties(property.properties as Properties, defaultValue);
    } else if (defaultValue !== undefined) {
        value = defaultValue;
    } else {
        value = undefined;
    }
    return value;
}

/**
 * Update the automatic values in an entity before save
 * @category Datasource
 */

export function updateAutoValues<M extends { [Key: string]: any }>({
                                                                       inputValues,
                                                                       properties,
                                                                       status,
                                                                       timestampNowValue,
                                                                       referenceConverter,
                                                                       geopointConverter
                                                                   }:
                                                                       {
                                                                           inputValues: Partial<EntityValues<M>>,
                                                                           properties: ResolvedProperties<M>,
                                                                           status: EntityStatus,
                                                                           timestampNowValue: any,
                                                                           referenceConverter?: (value: EntityReference) => any,
                                                                           geopointConverter?: (value: GeoPoint) => any
                                                                       }): EntityValues<M> {
    return traverseValues(
        inputValues,
        properties,
        (inputValue, property) => {
            if (property.dataType === "timestamp") {
                if (status === "existing" && property.autoValue === "on_update") {
                    return timestampNowValue;
                } else if ((status === "new" || status === "copy") &&
                    (property.autoValue === "on_update" || property.autoValue === "on_create")) {
                    return timestampNowValue;
                } else {
                    return inputValue;
                }
            } else if (referenceConverter && property.dataType === "reference") {
                if (inputValue instanceof EntityReference) {
                    return referenceConverter(inputValue);
                }
            } else if (geopointConverter && property.dataType === "geopoint") {
                if (inputValue instanceof GeoPoint) {
                    return geopointConverter(inputValue);
                }
            } else {
                return inputValue;
            }
        }
    );
}

/**
 * Add missing required fields, expected in the schema, to the values of an entity
 * @param values
 * @param properties
 * @param path
 * @category Datasource
 */
export function sanitizeData<M extends { [Key: string]: any }>
(
    values: EntityValues<M>,
    properties: ResolvedProperties<M>,
    path: string
) {
    const result: any = values;
    Object.entries(properties)
        .forEach(([key, property]) => {
            if (values && values[key] !== undefined) result[key] = values[key];
            else if ((property as Property).validation?.required) result[key] = null;
        });
    return result;
}

export function getReferenceFrom(entity: Entity<any>): EntityReference {
    return new EntityReference(entity.id, entity.path);
}

export function traverseValues<M extends { [Key: string]: any }>(
    inputValues: Partial<EntityValues<M>>,
    properties: ResolvedProperties<M>,
    operation: (value: any, property: Property) => any
): EntityValues<M> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = traverseValue(inputValue, property as Property, operation);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
    return { ...inputValues, ...updatedValues };
}

export function traverseValue(inputValue: any,
                              property: Property,
                              operation: (value: any, property: Property) => any): any {

    let value;
    if (property.dataType === "map" && property.properties) {
        value = traverseValues(inputValue, property.properties as ResolvedProperties, operation);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => traverseValue(e, property.of as Property, operation));
        } else if (property.oneOf && Array.isArray(inputValue)) {
            const typeField = property.oneOf!.typeField ?? "type";
            const valueField = property.oneOf!.valueField ?? "value";
            value = inputValue.map((e) => {
                if (e === null) return null;
                if (typeof e !== "object") return e;
                const type = e[typeField];
                const childProperty = property.oneOf!.properties[type];
                if (!type || !childProperty) return e;
                return {
                    [typeField]: type,
                    [valueField]: traverseValue(e[valueField], childProperty, operation)
                };
            });
        } else {
            value = inputValue;
        }
    } else {
        value = operation(inputValue, property);
    }

    return value;
}


export function buildPropertyFrom<T extends CMSType, M extends { [Key: string]: any }>
({
     propertyOrBuilder,
     values,
     previousValues,
     path,
     entityId,
     propertyOverride,
 }: {
     propertyOrBuilder: PropertyOrBuilder<T, M>,
     values: Partial<EntityValues<M>>,
     previousValues?: Partial<EntityValues<M>>,
     path: string,
     entityId?: string,
     propertyOverride?: Partial<Property<T>>,
 }
): Property<T> | null {
    let result: Property<T> | null;
    if (typeof propertyOrBuilder === "function") {
        result = propertyOrBuilder({ values, previousValues, entityId, path });
        if (!result) {
            console.debug("Property builder not returning `Property` so it is not rendered", path, entityId, propertyOrBuilder);
            return null;
        }
    } else {
        result = propertyOrBuilder as Property<T>;
    }

    if (propertyOverride)
        result = mergeDeep(result, propertyOverride);

    return result;
}
