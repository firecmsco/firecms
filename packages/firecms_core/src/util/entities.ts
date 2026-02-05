import {
    CMSType,
    DataType,
    Entity,
    EntityReference,
    EntityStatus,
    EntityValues,
    Properties,
    PropertiesOrBuilders,
    Property,
    PropertyBuilder,
    PropertyOrBuilder,
    ResolvedProperties,
    ResolvedProperty
} from "../types";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE } from "./common";

export function isReadOnly(property: Property<any> | ResolvedProperty<any>): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "date") {
        if (property.autoValue)
            return true;
    }
    if (property.dataType === "reference") {
        return !property.path && !property.Field;
    }
    return false;
}

export function isHidden(property: Property | ResolvedProperty): boolean {
    return typeof property.disabled === "object" && Boolean(property.disabled.hidden);
}

export function isPropertyBuilder<T extends CMSType, M extends Record<string, any>>(propertyOrBuilder?: PropertyOrBuilder<T, M> | Property<T> | ResolvedProperty<T>): propertyOrBuilder is PropertyBuilder<T, M> {
    return typeof propertyOrBuilder === "function";
}

export function getDefaultValuesFor<M extends Record<string, any>>(properties: PropertiesOrBuilders<M> | ResolvedProperties<M>): Partial<EntityValues<M>> {
    if (!properties) return {};
    return Object.entries(properties)
        .map(([key, property]) => {
            if (!property) return {};
            const value = getDefaultValueFor(property as PropertyOrBuilder);
            return value === undefined ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

export function getDefaultValueFor(property?: PropertyOrBuilder) {
    if (!property) return undefined;
    if (isPropertyBuilder(property)) return undefined;
    if (property.defaultValue || property.defaultValue === null) {
        return property.defaultValue;
    } else if (property.dataType === "map" && property.properties) {
        const defaultValuesFor = getDefaultValuesFor(property.properties as Properties);
        if (Object.keys(defaultValuesFor).length === 0) return undefined;
        return defaultValuesFor;
    } else {
        return getDefaultValueForDataType(property.dataType);
    }
}

export function getDefaultValueForDataType(dataType: DataType) {
    if (dataType === "string") {
        return null;
    } else if (dataType === "number") {
        return null;
    } else if (dataType === "boolean") {
        return false;
    } else if (dataType === "date") {
        return null;
    } else if (dataType === "array") {
        return [];
    } else if (dataType === "map") {
        return {};
    } else if (dataType === "geopoint") {
        return null;
    } else {
        return null;
    }
}

/**
 * Update the automatic values in an entity before save
 * @group Datasource
 */
export function updateDateAutoValues<M extends Record<string, any>>({
                                                                        inputValues,
                                                                        properties,
                                                                        status,
                                                                        timestampNowValue,
                                                                        setDateToMidnight
                                                                    }:
                                                                        {
                                                                            inputValues: Partial<EntityValues<M>>,
                                                                            properties: ResolvedProperties<M>,
                                                                            status: EntityStatus,
                                                                            timestampNowValue: any,
                                                                            setDateToMidnight: (input?: any) => any | undefined
                                                                        }): EntityValues<M> {
    return traverseValuesProperties(
        inputValues,
        properties,
        (inputValue, property) => {
            if (property.dataType === "date") {
                let resultDate;
                if (status === "existing" && property.autoValue === "on_update") {
                    resultDate = timestampNowValue;
                } else if ((status === "new" || status === "copy") &&
                    (property.autoValue === "on_update" || property.autoValue === "on_create")) {
                    resultDate = timestampNowValue;
                } else {
                    resultDate = inputValue;
                }
                if (property.mode === "date")
                    resultDate = setDateToMidnight(resultDate);
                return resultDate;
            } else {
                return inputValue;
            }
        }
    ) ?? {} as M;
}

/**
 * Add missing required fields, expected in the collection, to the values of an entity
 * @param values
 * @param properties
 * @group Datasource
 */
export function sanitizeData<M extends Record<string, any>>
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

export function getReferenceFrom<M extends Record<string, any>>(entity: Entity<M>): EntityReference {
    return new EntityReference(entity.id, entity.path, entity.databaseId);
}

export function traverseValuesProperties<M extends Record<string, any>>(
    inputValues: Partial<EntityValues<M>>,
    properties: ResolvedProperties<M>,
    operation: (value: any, property: Property) => any
): EntityValues<M> | undefined {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues)[key];
            const updatedValue = traverseValueProperty(inputValue, property as Property, operation);
            if (updatedValue === null) return null;
            if (updatedValue === undefined) return undefined;
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
    const result = { ...inputValues, ...updatedValues };
    if (Object.keys(result).length === 0) return undefined;
    return result;
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
            const typeField = property.oneOf?.typeField ?? DEFAULT_ONE_OF_TYPE;
            const valueField = property.oneOf?.valueField ?? DEFAULT_ONE_OF_VALUE;
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
