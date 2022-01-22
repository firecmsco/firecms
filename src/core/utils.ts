import {
    Entity,
    EntityReference,
    EntitySchema,
    EntitySchemaResolver,
    EntityStatus,
    EntityValues,
    GeoPoint,
    Properties,
    PropertiesOrBuilder,
    Property,
    ResolvedEntitySchema
} from "../models";
import { buildPropertyFrom } from "./util/property_builder";

export function isReadOnly(property: Property<any>): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "timestamp") {
        if (property.autoValue)
            return true;
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
    { schemaOrResolver, path, entityId, values, previousValues }: {
        schemaOrResolver: EntitySchema<M> | ResolvedEntitySchema<M> | EntitySchemaResolver<M>,
        path: string,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): ResolvedEntitySchema<M> {

    if (typeof schemaOrResolver === "function") {
        return schemaOrResolver({ entityId, values, previousValues });
    } else {

        const properties = computeProperties({
            propertiesOrBuilder: schemaOrResolver.properties as PropertiesOrBuilder<M>,
            path,
            entityId,
            values,
            previousValues
        });

        return {
            ...schemaOrResolver,
            properties,
            originalSchema: schemaOrResolver as EntitySchema<M>
        };
    }
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
    { propertiesOrBuilder, path, entityId, values, previousValues }: {
        propertiesOrBuilder: PropertiesOrBuilder<M>,
        path: string,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): Properties<M> {
    return Object.entries(propertiesOrBuilder)
        .map(([key, propertyOrBuilder]) => {
            return {
                [key]: buildPropertyFrom({
                    propertyOrBuilder,
                    values: values ?? {},
                    previousValues: previousValues ?? values ?? {},
                    path,
                    entityId
                })
            };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties<M>;
}



export function initWithProperties<M extends { [Key: string]: any }>
(properties: Properties<M>, defaultValues?: Partial<EntityValues<M>>): EntityValues<M> {
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
                                                                           properties: Properties<M>,
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
    properties: Properties<M>,
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
    properties: Properties<M>,
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
        value = traverseValues(inputValue, property.properties as Properties, operation);
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

