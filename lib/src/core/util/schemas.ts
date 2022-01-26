import { EntitySchema, PropertiesOrBuilder, Property } from "../../models";
import { mergeDeep, removeFunctions } from "./objects";

export function prepareSchemaForPersistence<M>(schema: EntitySchema<M>) {
    const properties = removeFunctions(schema.properties);
    const newSchema = {
        ...schema,
        properties: properties
    };
    delete newSchema.views;
    delete newSchema.additionalColumns;
    return newSchema;
}

export function mergeSchemas(target: EntitySchema, source: EntitySchema): EntitySchema {
    const mergedSchema = mergeDeep(target, source);
    return {
        ...mergedSchema,
        properties: sortProperties(mergedSchema.properties, mergedSchema.propertiesOrder)
    }
}

export function sortProperties<T>(properties: PropertiesOrBuilder<T>, propertiesOrder?: (keyof T)[]): PropertiesOrBuilder<T> {
    try {
        const propertiesKeys = Object.keys(properties);
        const allPropertiesOrder = [
            ...(propertiesOrder ?? []),
            ...(!propertiesOrder ? propertiesKeys : propertiesKeys.filter((p) => !propertiesOrder.includes(p as keyof T)))
        ]
        return allPropertiesOrder
            .map((key) => {
                if (properties[key as keyof T]) {
                    const property = properties[key] as Property;
                    if (typeof property === "object" && property?.dataType === "map") {
                        return ({
                            [key]: {
                                ...property,
                                properties: sortProperties(property.properties ?? {}, property.propertiesOrder)
                            }
                        });
                    } else {
                        return ({ [key]: property });
                    }
                } else {
                    return undefined;
                }
            })
            .filter((a) => a !== undefined)
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilder<T>;
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}
