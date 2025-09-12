import {
    DataType,
    Entity,
    EntityReference,
    EntityRelation,
    EntityStatus,
    EntityValues,
    Properties,
    Property,
    ResolvedProperties,
    ResolvedProperty
} from "@firecms/types";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE } from "./common";

export function isReadOnly(property: Property | ResolvedProperty): boolean {
    if (property.readOnly)
        return true;
    if (property.type === "date") {
        if (property.autoValue)
            return true;
    }
    if (property.type === "reference") {
        return !property.path;
    }
    return false;
}

export function isHidden(property: Property | ResolvedProperty): boolean {
    return typeof property.disabled === "object" && Boolean(property.disabled.hidden);
}

export function isPropertyBuilder(propertyOrBuilder?: Property | ResolvedProperty) {
    return typeof propertyOrBuilder?.dynamicProps === "function";
}

export function getDefaultValuesFor<M extends Record<string, any>>(properties: Properties | ResolvedProperties): Partial<EntityValues<M>> {
    if (!properties) return {};
    return Object.entries(properties)
        .map(([key, property]) => {
            if (!property) return {};
            const value = getDefaultValueFor(property);
            return value === undefined ? {} : { [key]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<M>;
}

export function getDefaultValueFor(property?: Property) {
    if (!property) return undefined;
    if (isPropertyBuilder(property)) return undefined;
    if (property.defaultValue || property.defaultValue === null) {
        return property.defaultValue;
    } else if (property.type === "map" && property.properties) {
        const defaultValuesFor = getDefaultValuesFor(property.properties as Properties);
        if (Object.keys(defaultValuesFor).length === 0) return undefined;
        return defaultValuesFor;
    } else {
        return getDefaultValueFortype(property.type);
    }
}

export function getDefaultValueFortype(type: DataType) {
    if (type === "string") {
        return null;
    } else if (type === "number") {
        return null;
    } else if (type === "boolean") {
        return false;
    } else if (type === "date") {
        return null;
    } else if (type === "array") {
        return [];
    } else if (type === "map") {
        return {};
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
                                                                        properties: ResolvedProperties,
                                                                        status: EntityStatus,
                                                                        timestampNowValue: any,
                                                                        setDateToMidnight: (input?: any) => any | undefined
                                                                    }): EntityValues<M> {
    return traverseValuesProperties(
        inputValues,
        properties,
        (inputValue, property) => {
            if (property.type === "date") {
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
    properties: ResolvedProperties
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
    return new EntityReference(entity.id, entity.path);
}

export function getRelationFrom<M extends Record<string, any>>(entity: Entity<M>): EntityRelation {
    return new EntityRelation(entity.id, entity.path);
}

export function traverseValuesProperties<M extends Record<string, any>>(
    inputValues: Partial<EntityValues<M>>,
    properties: ResolvedProperties,
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
    if (property.type === "map" && property.properties) {
        value = traverseValuesProperties(inputValue, property.properties as ResolvedProperties, operation);
    } else if (property.type === "array") {
        const of = property.of;
        if (of && Array.isArray(inputValue) && !Array.isArray(of)) {
            value = inputValue.map((e) => traverseValueProperty(e, of, operation));
        } else if (of && Array.isArray(inputValue) && Array.isArray(of)) {
            value = inputValue.map((e, i) => {
                if (i < of.length)
                    return traverseValuesProperties(e, of[i], operation);
                return null
            }).filter(Boolean);
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
