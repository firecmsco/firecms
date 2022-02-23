import {
    CMSType,
    Entity,
    EntityReference,
    EntityStatus,
    EntityValues,
    EnumConfig,
    EnumValueConfig,
    EnumValues,
    NumberProperty,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder,
    ResolvedArrayProperty,
    ResolvedNumberProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty,
    SchemaRegistry,
    StringProperty
} from "../../models";
import { mergeDeep } from "./objects";

export function isReadOnly(property: Property | ResolvedProperty): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "date") {
        if (property.autoValue)
            return true;
    }
    if (property.dataType === "reference") {
        return !property.path;
    }
    return false;
}

export function isHidden(property: Property | ResolvedProperty): boolean {
    return typeof property.disabled === "object" && Boolean(property.disabled.hidden);
}


/**
 * Replace enums declared as aliases for their corresponding enumValues,
 * defined in the root of the {@link SchemaRegistry}.
 * @param property
 * @param enumConfigs
 */
export function computePropertyEnums(property: Property, enumConfigs: EnumConfig[]): ResolvedProperty {
    if (property.dataType === "map" && property.properties) {
        const properties = computePropertiesEnums(property.properties, enumConfigs);
        return {
            ...property,
            properties
        };
    } else if (property.dataType === "array" && property.of) {
        if (property.of) {
            return {
                ...property,
                of: computePropertyEnums(property.of, enumConfigs)
            } as ResolvedArrayProperty;
        } else if (property.oneOf) {
            const properties = computePropertiesEnums(property.oneOf.properties, enumConfigs);
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
export function computePropertiesEnums<M>(properties: Properties<M>, enumConfigs: EnumConfig[]): ResolvedProperties<M> {
    return Object.entries<Property>(properties as Record<string, Property>)
        .map(([key, property]) => {
            return ({ [key]: computePropertyEnums(property, enumConfigs) });
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
    if (typeof property.enumValues === "string" || typeof property.enumValues === "object") {
        return {
            ...property,
            enumValues: resolveEnumValues(property.enumValues, enumConfigs)?.filter((value) => value && value.id && value.label) ?? [],
        }
    }
    return property as ResolvedStringProperty | ResolvedNumberProperty;
}

export function resolveEnumValues(input: EnumValues | string, enumConfigs: EnumConfig[]): EnumValueConfig[] | undefined {
    if (typeof input === "string") {
        const enumConfig = enumConfigs.find((ec) => ec.id === input);
        if (!enumConfig) {
            console.error("Not able to find enumConfig with id: " + input);
            return undefined;
        }
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

export function getDefaultValuesFor<M extends { [Key: string]: any }>(properties: PropertiesOrBuilder<M> | ResolvedProperties<M>): EntityValues<M> {
    return Object.entries(properties)
        .map(([key, property]) => {
            const value = getDefaultValueFor(property as Property);
            return value === undefined ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

function getDefaultValueFor(property: PropertyOrBuilder) {
    if (typeof property === "function") return undefined;
    if (property.dataType === "map" && property.properties) {
        const defaultValuesFor = getDefaultValuesFor(property.properties as Properties);
        if (Object.keys(defaultValuesFor).length === 0) return undefined;
        return defaultValuesFor;
    } else {
        return property.defaultValue;
    }
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
                                                                   }:
                                                                       {
                                                                           inputValues: Partial<EntityValues<M>>,
                                                                           properties: ResolvedProperties<M>,
                                                                           status: EntityStatus,
                                                                           timestampNowValue: any,
                                                                       }): EntityValues<M> {
    return traverseValuesProperties(
        inputValues,
        properties,
        (inputValue, property) => {
            if (property.dataType === "date") {
                if (status === "existing" && property.autoValue === "on_update") {
                    return timestampNowValue;
                } else if ((status === "new" || status === "copy") &&
                    (property.autoValue === "on_update" || property.autoValue === "on_create")) {
                    return timestampNowValue;
                } else {
                    return inputValue;
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
 * @category Datasource
 */
export function sanitizeData<M extends { [Key: string]: any }>
(
    values: EntityValues<M>,
    properties: ResolvedProperties<M>
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

export function traverseValuesProperties<M extends { [Key: string]: any }>(
    inputValues: Partial<EntityValues<M>>,
    properties: ResolvedProperties<M>,
    operation: (value: any, property: Property) => any
): EntityValues<M> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = traverseValueProperty(inputValue, property as Property, operation);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
    return { ...inputValues, ...updatedValues };
}

export function traverseValueProperty(inputValue: any,
                                      property: Property,
                                      operation: (value: any, property: Property) => any): any {

    let value;
    if (property.dataType === "map" && property.properties) {
        value = traverseValuesProperties(inputValue, property.properties as ResolvedProperties, operation);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => traverseValueProperty(e, property.of as Property, operation));
        } else if (property.oneOf && Array.isArray(inputValue)) {
            const typeField = property.oneOf?.typeField ?? "type";
            const valueField = property.oneOf?.valueField ?? "value";
            value = inputValue.map((e) => {
                if (e === null) return null;
                if (typeof e !== "object") return e;
                const type = e[typeField];
                const childProperty = property.oneOf?.properties[type];
                if (!type || !childProperty) return e;
                return {
                    [typeField]: type,
                    [valueField]: traverseValueProperty(e[valueField], childProperty, operation)
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
