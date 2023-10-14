import { DataType, Entity, EntityReference, getPropertyInPath, Properties } from "firecms";
import { unflattenObject } from "./file_to_json";

type DataTypeMapping = {
    from: DataType;
    fromSubtype?: DataType;
    to: DataType;
    toSubtype?: DataType;
}

export function convertDataToEntity(data: Record<any, any>,
                                    idColumn: string | undefined,
                                    headersMapping: Record<string, string | null>,
                                    properties: Properties,
                                    propertiesMapping: Record<string, DataTypeMapping>,
                                    path: string): Entity<any> {
    const flatObject = flattenEntry(data);
    if (idColumn)
        delete flatObject[idColumn];
    const mappedKeysObject = Object.entries(flatObject)
        .map(([key, value]) => {
            const mappedKey = headersMapping[key] ?? key;

            const mappedProperty = getPropertyInPath(properties, mappedKey);
            if (!mappedProperty)
                return {};

            const propertyMapping = propertiesMapping[mappedKey];
            let valueResult = value;
            if (propertyMapping) {
                valueResult = processValueMapping(value, propertyMapping);
            }
            return ({
                [mappedKey]: valueResult
            });
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const values = unflattenObject(mappedKeysObject);
    return {
        id: idColumn ? data[idColumn] : undefined,
        values,
        path
    };
}

export function flattenEntry(obj: any, parent = ""): any {
    return Object.keys(obj).reduce((acc, key) => {
        const prefixedKey = parent ? `${parent}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenEntry(obj[key], prefixedKey));
        } else {
            // @ts-ignore
            acc[prefixedKey] = obj[key];
        }

        return acc;
    }, {});
}

// export function convertDataEntryValue({
//                                           key,
//                                           fullKey,
//                                           value,
//                                           idColumn,
//                                           headersMapping,
//                                           properties,
//                                           propertiesMapping
//                                       }: {
//     key?: string,
//     fullKey: string,
//     value: any,
//     idColumn?: string,
//     headersMapping: Record<string, string | null>,
//     properties: Properties,
//     propertiesMapping: Record<string, DataTypeMapping>
// }): any {
//
//     if (value === undefined) return value;
//     if (value === null) return value;
//
//     if (Array.isArray(value)) {
//         const mappedKey = headersMapping[fullKey] || fullKey;
//         const valueMapping = propertiesMapping[mappedKey];
//         return processValueMapping(value, valueMapping);
//         // return value.map(v => convertDataEntryValue({ value: v, fullKey, idColumn, headersMapping, propertiesMapping }));
//     } else if (typeof value === "object") {
//         return convertDataObjectValue({
//             key,
//             fullKey,
//             value,
//             idColumn,
//             headersMapping,
//             properties,
//             propertiesMapping
//         });
//     } else {
//         const mappedKey = headersMapping[fullKey] || fullKey;
//         const valueMapping = propertiesMapping[mappedKey];
//         return processValueMapping(value, valueMapping);
//     }
// }

// export function convertDataObjectValue({
//                                            key,
//                                            fullKey,
//                                            value,
//                                            idColumn,
//                                            headersMapping,
//                                            properties,
//                                            propertiesMapping
//                                        }: {
//     key?: string,
//     fullKey?: string,
//     value: object,
//     idColumn?: string,
//     headersMapping: Record<string, string | null>,
//     properties: Properties,
//     propertiesMapping: Record<string, DataTypeMapping>
// }): object {
//
//     if (value instanceof Date) {
//         const mappedKey = fullKey ? headersMapping[fullKey] || fullKey : undefined;
//         const valueMapping = mappedKey ? propertiesMapping[mappedKey] : undefined;
//         return processValueMapping(value, valueMapping);
//     }
//
//     return Object.entries(value)
//         .map(([childKey, childValue]) => {
//             const childFullKey = fullKey ? `${fullKey}.${childKey}` : childKey;
//             const mappedKey = headersMapping[childFullKey] ?? childFullKey;
//             const mappedKeyLastPart = mappedKey.split(".").slice(-1)[0];
//             const property = getPropertyInPath(properties, mappedKey);
//             // if (!property) {
//             //     console.log("ppp", { properties, mappedKey,  })
//             //     return {};
//             // }
//             return ({
//                 [mappedKeyLastPart]: convertDataEntryValue({
//                     key: childKey,
//                     fullKey: childFullKey,
//                     value: childValue,
//                     idColumn,
//                     headersMapping,
//                     properties,
//                     propertiesMapping
//                 })
//             });
//         })
//         .reduce((acc, curr) => ({ ...acc, ...curr }), {});
// }

export function processValueMapping(value: any, valueMapping?: DataTypeMapping): any {
    if (valueMapping === undefined) return value;
    const {
        from,
        to
    } = valueMapping;
    if (from === "array" && to === "array" && valueMapping.fromSubtype && valueMapping.toSubtype && Array.isArray(value)) {
        return value.map(v => processValueMapping(v, {
            from: valueMapping.fromSubtype!,
            to: valueMapping.toSubtype!
        }));
    } else if (from === "string" && to === "number" && typeof value === "string") {
        return Number(value);
    } else if (from === "string" && to === "array" && valueMapping.toSubtype && typeof value === "string") {
        return value.split(",").map((v: string) => processValueMapping(v, {
            from: "string",
            to: valueMapping.toSubtype!
        }));
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
