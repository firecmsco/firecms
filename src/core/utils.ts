import {
    Entity,
    EntityReference,
    EntitySchema,
    EntityStatus,
    EntityValues,
    GeoPoint,
    Properties,
    Property,
    PropertyOrBuilder
} from "../models";
import { buildPropertyFrom } from "./util/property_builder";

export function isReadOnly(property: Property<any>): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "timestamp") {
        if (Boolean(property.autoValue))
            return true;
    }
    return false;
}

export function isHidden(property: Property<any>): boolean {
    return typeof property.disabled === "object" && Boolean(property.disabled.hidden);

}


/**
 *
 * @param schema
 * @param path
 * @param entityId
 * @param values
 * @ignore
 */
export function computeSchemaProperties<M extends { [Key: string]: any }>(
    schema: EntitySchema<M>,
    path: string,
    entityId?: string | undefined,
    values?: Partial<EntityValues<M>>
): Properties<M> {
    return Object.entries(schema.properties)
        .map(([key, propertyOrBuilder]) => {
            return { [key]: buildPropertyFrom(propertyOrBuilder as PropertyOrBuilder<any, M>, values ?? schema.defaultValues ?? {}, path, entityId) };
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties<M>;
}


/**
 * Functions used to set required fields to undefined in the initially created entity
 * @param schema
 * @param path
 * @param entityId
 * @ignore
 */
export function initEntityValues<M extends { [Key: string]: any }>
(schema: EntitySchema<M>, path: string, entityId?: string): EntityValues<M> {
    const properties: Properties<M> = computeSchemaProperties(schema, path, entityId);
    return initWithProperties(properties, schema.defaultValues);
}


function initWithProperties<M extends { [Key: string]: any }>
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
        value = initWithProperties(property.properties as Properties<any>, defaultValue);
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
                if (status == "existing" && property.autoValue === "on_update") {
                    return timestampNowValue;
                } else if ((status == "new" || status == "copy")
                    && (property.autoValue === "on_update" || property.autoValue === "on_create")) {
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
 * @param schema
 * @param path
 * @category Datasource
 */
export function sanitizeData<M extends { [Key: string]: any }>
(
    values: EntityValues<M>,
    schema: EntitySchema<M>,
    path: string
) {
    let result: any = values;
    Object.entries(computeSchemaProperties(schema, path))
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
        value = traverseValues(inputValue, property.properties as Properties<any>, operation);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => traverseValue(e, property.of as Property, operation));
        } else if (property.oneOf && Array.isArray(inputValue)) {
            const typeField = property.oneOf!.typeField ?? "type";
            const valueField = property.oneOf!.valueField ?? "value";
            value = inputValue.map((e) => {
                if (typeof e !== "object") return inputValue;
                const type = e[typeField];
                const childProperty = property.oneOf!.properties[type];
                if (!type || !childProperty) return inputValue;
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
