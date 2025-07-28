import {
    EnumValues,
    getFieldId,
    getValueInPath,
    isPropertyBuilder,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder
} from "@firecms/core";
import { InputProperty } from "../types/data_enhancement_controller";

export function getSimplifiedProperties<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, values: M, path = ""): Record<string, InputProperty> {
    if (!properties) return {};
    return Object.entries(properties)
        .map(([key, property]) => {
            if (isPropertyBuilder(property)) return {};
            const fullKey = path ? `${path}.${key}` : key;
            const valueInPath = getValueInPath(values, fullKey);
            return getSimplifiedProperty(property, fullKey, valueInPath)
        })
        .reduce((a, b) => ({ ...a, ...b }), {});
}

function getSimpleProperty(property: Property): InputProperty {
    const fieldId = getFieldId(property);
    if (!fieldId) {
        console.error("No fieldId found for property", property);
        throw new Error("Field id not found");
    }
    return {
        name: property.name,
        description: property.description,
        type: property.type,
        fieldConfigId: fieldId,
        enumValues: "enumValues" in property && property.enumValues
            ? getSimpleEnumValues(property.enumValues)
            : undefined,
        disabled: Boolean(property.disabled || property.readOnly)
    };
}

function getSimplifiedProperty(property: PropertyOrBuilder, path: string, value?: any): Record<string, InputProperty> {
    if (isPropertyBuilder(property)) return {};
    if (property.type === "array") {

        if (property.of && !isPropertyBuilder(property.of as PropertyOrBuilder)) {
            const arrayParentProperty: InputProperty = {
                name: property.name,
                description: property.description,
                type: property.type,
                fieldConfigId: "repeat",
                disabled: Boolean(property.disabled || property.readOnly),
                of: getSimpleProperty(property.of as Property)
            };

            const result = { [path]: arrayParentProperty };
            // if (Array.isArray(value)) {
            //     result = {
            //         ...result,
            //         ...value
            //             .map((v, i) => getSimplifiedProperty(property.of as PropertyOrBuilder, `${path}.${i}`, v))
            //             .reduce((a, b) => ({ ...a, ...b }), {})
            //     };
            // }
            //
            // const existingValuesCount = Array.isArray(value) ? value.length : 0;
            //
            // const newValuesCount = property.of && !isPropertyBuilder<any, any>(property.of) && (property.of as Property).type === "map" ? 1 : 3;
            // result = {
            //     ...result,
            //     // ...Array.from(Array(newValuesCount))
            //     //     .map((v, i) => getSimplifiedProperty(property.of as PropertyOrBuilder, `${path}.${i + existingValuesCount}`, v))
            //     //     .reduce((a, b) => ({ ...a, ...b }), {})
            // }

            return result;
        } else if (property.oneOf) {

            const arrayParentProperty: InputProperty = {
                name: property.name,
                description: property.description,
                type: property.type,
                fieldConfigId: "block",
                disabled: Boolean(property.disabled || property.readOnly),
                oneOf: {
                    typeField: property.oneOf.typeField,
                    valueField: property.oneOf.valueField,
                    properties: Object.entries(property.oneOf.properties)
                        .map(([key, prop]) => ({ [key]: getSimpleProperty(prop) }))
                        .reduce((a, b) => ({ ...a, ...b }), {})
                }
            };

            if (!Array.isArray(value)) {
                return { [path]: arrayParentProperty };
            }

            return value.map((v, i) => {
                const typeKey = property.oneOf!.typeField ?? "type";
                const oneOfType = v[typeKey];
                const valueKey = property.oneOf!.valueField ?? "value";
                const oneOfValue = v[valueKey];
                const childProperty = property.oneOf!.properties[oneOfType];
                if (childProperty === undefined) {
                    console.error(`No property found for type ${oneOfType}`, property.oneOf!.properties);
                    return {};
                }
                const simplifiedProperty = getSimplifiedProperty(childProperty, `${path}.${i}.${valueKey}`, oneOfValue);
                return {
                    [`${path}.${i}.${typeKey}`]: oneOfType,
                    ...simplifiedProperty
                };
            }).reduce((a, b) => ({ ...a, ...b }), { [path]: arrayParentProperty });
        }
    } else if (property.type === "map") {
        if (property.properties) {
            const mapProperties: Record<string, InputProperty> = Object.entries(property.properties)
                .map(([key, childProperty]) => {
                    const childValue = value?.[key];
                    return getSimplifiedProperty(childProperty, key, childValue);
                })
                .map(o => attachPathToKeys(o, path))
                .reduce((a, b) => ({ ...a, ...b }), {});

            if (Object.keys(mapProperties).length === 0) return {};
            const mapParentProperty: InputProperty = {
                name: property.name,
                description: property.description,
                type: property.type,
                fieldConfigId: "group",
                disabled: Boolean(property.disabled || property.readOnly)
            };
            return {
                [path]: mapParentProperty,
                ...mapProperties
            } as Record<string, InputProperty>;
        }
    } else {
        const fieldId = getFieldId(property);
        if (!fieldId) {
            console.warn(`No fieldId found for property ${path} with type ${property.type}`);
            return {};
        }
        return {
            [path]: getSimpleProperty(property)
        };
    }
    return {};
}

// attach a path to every key in an object
function attachPathToKeys(obj: Record<string, any>, path = ""): Record<string, any> {
    return Object.entries(obj)
        .map(([key, value]) => {
            const fullKey = path ? `${path}.${key}` : key;
            return { [fullKey]: value };
        })
        .reduce((a, b) => ({ ...a, ...b }), {});
}

function getSimpleEnumValues(enumValues: EnumValues): string[] {
    if (Array.isArray(enumValues))
        return enumValues.map(v => String(v.id));
    if (typeof enumValues === "object")
        return Object.keys(enumValues);
    throw Error("getSimpleEnumValues: Invalid enumValues");
}
