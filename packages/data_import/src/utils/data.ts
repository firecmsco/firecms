import {
    Entity,
    EntityReference,
    getPropertyInPath,
    isPropertyBuilder,
    mergeDeep,
    Properties,
    Property,
    PropertyOrBuilder,
    ResolvedProperty,
    resolveProperty
} from "@firecms/core";
import { unflattenObject } from "./file_to_json";
import { getIn } from "@firecms/formex";
import { inferTypeFromValue } from "@firecms/schema_inference";

export function convertDataToEntity(data: Record<any, any>,
                                    idColumn: string | undefined,
                                    headersMapping: Record<string, string | null>,
                                    properties: Properties,
                                    path: string,
                                    defaultValues: Record<string, any>): Entity<any> {
    const flatObject = flattenEntry(data);
    if (idColumn)
        delete flatObject[idColumn];
    const mappedKeysObject = Object.entries(flatObject)
        .map(([key, value]) => {
            const mappedKey = getIn(headersMapping, key) ?? key;

            const mappedProperty = getPropertyInPath(properties, mappedKey);
            if (!mappedProperty) {
                return {};
            }
            const processedValue = processValueMapping(value, mappedProperty);
            return ({
                [mappedKey]: processedValue
            });
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});

    const values = mergeDeep(defaultValues ?? {}, unflattenObject(mappedKeysObject));
    let id = idColumn ? data[idColumn] : undefined;
    if (typeof id === "string") {
        id = id.trim();
    } else if (typeof id === "number") {
        id = id.toString();
    } else if (typeof id === "boolean") {
        id = id.toString();
    } else if (id instanceof Date) {
        id = id.toISOString();
    } else if (id && "toString" in id) {
        id = id.toString();
    }

    return {
        id,
        values,
        path
    };
}

export function flattenEntry(obj: any, parent = ""): any {
    return Object.keys(obj).reduce((acc, key) => {
        const prefixedKey = parent ? `${parent}.${key}` : key;

        if (typeof obj[key] === "object" && !(obj[key] instanceof Date) && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenEntry(obj[key], prefixedKey));
        } else {
            // @ts-ignore
            acc[prefixedKey] = obj[key];
        }

        return acc;
    }, {});
}

export function processValueMapping(value: any, property?: PropertyOrBuilder): any {
    if (value === null) return null;

    if (property === undefined) return value;
    const usedProperty: ResolvedProperty | null = resolveProperty({
        propertyOrBuilder: property,
    })
    if (usedProperty === null) return value;
    const from = inferTypeFromValue(value);
    const to = usedProperty.dataType;

    if (from === "array" && to === "array" && Array.isArray(value) && usedProperty.of && !isPropertyBuilder(usedProperty.of as PropertyOrBuilder)) {
        return value.map(v => processValueMapping(v, usedProperty.of as Property));
    } else if (from === "string" && to === "number" && typeof value === "string") {
        return Number(value);
    } else if (from === "string" && to === "array" && typeof value === "string" && usedProperty.of && !isPropertyBuilder(usedProperty.of as PropertyOrBuilder)) {
        return value.split(",").map((v: string) => processValueMapping(v, usedProperty.of));
    } else if (from === "string" && to === "boolean") {
        return value === "true";
    } else if (from === "number" && to === "boolean") {
        return value === 1;
    } else if (from === "boolean" && to === "number") {
        return value ? 1 : 0;
    } else if (from === "boolean" && to === "string") {
        return value ? "true" : "false";
    } else if (from === "number" && to === "string" && typeof value === "number") {
        return value.toString();
    } else if (from === "string" && to === "array" && typeof value === "string") {
        return value.split(",").map((v: string) => v.trim());
    } else if (from === "string" && to === "date" && typeof value === "string") {
        try {
            return new Date(value);
        } catch (e) {
            return value;
        }
    } else if (from === "date" && to === "string") {
        return value instanceof Date && value.toISOString();
    } else if (from === "number" && to === "date" && typeof value === "number") {
        try {
            return new Date(value);
        } catch (e) {
            return value;
        }
    } else if (from === "string" && to === "reference" && typeof value === "string") {
        // split value into path and entityId (entityId is the last part of the path, after the last /)
        const path = value.split("/").slice(0, -1).join("/");
        const entityId = value.split("/").slice(-1)[0];
        return new EntityReference(entityId, path);

    } else if (from === to) {
        return value;
    } else if (from === "array" && to === "string" && Array.isArray(value)) {
        return value.join(",");
    }

    return value;
}
