import {
    InferencePropertyBuilderProps,
    TypesCount,
    TypesCountRecord,
    ValuesCountEntry,
    ValuesCountRecord
} from "./types";
import { buildStringProperty } from "./builders/string_property_builder";
import { buildValidation } from "./builders/validation_builder";
import { buildReferenceProperty } from "./builders/reference_property_builder";
import { extractEnumFromValues, mergeDeep, prettifyIdentifier, resolveEnumValues } from "./util";
import { DataType, EnumValues, Properties, Property, StringProperty } from "@firecms/types";

export type InferenceTypeBuilder = (value: any) => DataType;

export async function buildEntityPropertiesFromData(
    data: object[],
    getType: InferenceTypeBuilder
): Promise<Properties> {
    const typesCount: TypesCountRecord = {};
    const valuesCount: ValuesCountRecord = {};
    if (data) {
        data.forEach((entry) => {
            if (entry) {
                Object.entries(entry).forEach(([key, value]) => {
                    if (key.startsWith("_")) return; // Ignore properties starting with _
                    increaseMapTypeCount(typesCount, key, value, getType);
                    increaseValuesCount(valuesCount, key, value, getType);
                });
            }
        });
    }
    return buildPropertiesFromCount(data.length, typesCount, valuesCount);
}

export function buildPropertyFromData(
    data: any[],
    property: Property,
    getType: InferenceTypeBuilder
): Property {
    const typesCount = {};
    const valuesCount: ValuesCountRecord = {};
    if (data) {
        data.forEach((entry) => {
            increaseTypeCount(property.type, typesCount, entry, getType);
            increaseValuesCount(valuesCount, "inferred_prop", entry, getType);
        });
    }
    const enumValues = "enumValues" in property ? resolveEnumValues(property["enumValues"] as EnumValues) : undefined;
    if (enumValues) {
        const newEnumValues = extractEnumFromValues(Array.from(valuesCount["inferred_prop"].valuesCount.keys()));
        return {
            ...property,
            enum: [...newEnumValues, ...enumValues]
        } as StringProperty;
    }
    const generatedProperty = buildPropertyFromCount(
        "inferred_prop",
        data.length,
        property.type,
        typesCount,
        valuesCount["inferred_prop"]
    );
    return mergeDeep(generatedProperty, property);
}

export function buildPropertiesOrder(
    properties: Properties,
    propertiesOrder?: string[],
    priorityKeys?: string[]
): string[] {
    const lowerCasePriorityKeys = (priorityKeys ?? []).map((key) => key.toLowerCase());

    function propOrder(s: string) {
        const k = s.toLowerCase();
        if (lowerCasePriorityKeys.includes(k)) return 4;
        if (k === "title" || k === "name") return 3;
        if (k.includes("title") || k.includes("name")) return 2;
        if (k.includes("image") || k.includes("picture")) return 1;
        return 0;
    }

    const keys = propertiesOrder ?? Object.keys(properties);
    keys.sort(); // alphabetically
    keys.sort((a, b) => {
        return propOrder(b) - propOrder(a);
    });
    return keys;
}

/**
 * @param type
 * @param typesCount
 * @param fieldValue
 * @param getType
 */
function increaseTypeCount(
    type: DataType,
    typesCount: TypesCount,
    fieldValue: any,
    getType: InferenceTypeBuilder
) {
    if (type === "map") {
        if (fieldValue) {
            let mapTypesCount = typesCount[type];
            if (!mapTypesCount) {
                mapTypesCount = {};
                typesCount[type] = mapTypesCount;
            }
            Object.entries(fieldValue).forEach(([key, value]) => {
                increaseMapTypeCount(mapTypesCount as TypesCountRecord, key, value, getType);
            });
        }
    } else if (type === "array") {
        let arrayTypesCount = typesCount[type];
        if (!arrayTypesCount) {
            arrayTypesCount = {};
            typesCount[type] = arrayTypesCount;
        }
        if (fieldValue && Array.isArray(fieldValue) && fieldValue.length > 0) {
            const arrayType = getMostProbableTypeInArray(fieldValue, getType);
            if (arrayType === "map") {
                let mapTypesCount = arrayTypesCount[arrayType];
                if (!mapTypesCount) {
                    mapTypesCount = {};
                }
                fieldValue.forEach((value) => {
                    if (value && typeof value === "object" && !Array.isArray(value)) { // Ensure value is an object for Object.entries
                        Object.entries(value).forEach(([key, v]) =>
                            increaseMapTypeCount(mapTypesCount, key, v, getType)
                        );
                    }
                });
                arrayTypesCount[arrayType] = mapTypesCount;
            } else {
                if (!arrayTypesCount[arrayType]) arrayTypesCount[arrayType] = 1;
                else (arrayTypesCount[arrayType] as number)++;
            }
        }
    } else {
        if (!typesCount[type]) typesCount[type] = 1;
        else (typesCount[type] as number)++;
    }
}

function increaseMapTypeCount(
    typesCountRecord: TypesCountRecord,
    key: string,
    fieldValue: any,
    getType: InferenceTypeBuilder
) {
    if (key.startsWith("_")) return; // Ignore properties starting with _

    let typesCount: TypesCount = typesCountRecord[key];
    if (!typesCount) {
        typesCount = {};
        typesCountRecord[key] = typesCount;
    }

    if (fieldValue != null) {
        // Check that fieldValue is not null or undefined before proceeding
        const type = getType(fieldValue);
        increaseTypeCount(type, typesCount, fieldValue, getType);
    }
}

function increaseValuesCount(
    typeValuesRecord: ValuesCountRecord,
    key: string,
    fieldValue: any,
    getType: InferenceTypeBuilder
) {
    if (key.startsWith("_")) return; // Ignore properties starting with _

    const type = getType(fieldValue);

    let valuesRecord: {
        values: any[];
        valuesCount: Map<any, number>;
        map?: ValuesCountRecord;
    } = typeValuesRecord[key];

    if (!valuesRecord) {
        valuesRecord = {
            values: [],
            valuesCount: new Map()
        };
        typeValuesRecord[key] = valuesRecord;
    }

    if (type === "map") {
        let mapValuesRecord: ValuesCountRecord | undefined = valuesRecord.map;
        if (!mapValuesRecord) {
            mapValuesRecord = {};
            valuesRecord.map = mapValuesRecord;
        }
        if (fieldValue)
            Object.entries(fieldValue).forEach(([subKey, value]) =>
                increaseValuesCount(mapValuesRecord as ValuesCountRecord, subKey, value, getType)
            );
    } else if (type === "array") {
        if (Array.isArray(fieldValue)) {
            fieldValue.forEach((value) => {
                valuesRecord.values.push(value);
                valuesRecord.valuesCount.set(value, (valuesRecord.valuesCount.get(value) ?? 0) + 1);
            });
        }
    } else {
        if (fieldValue !== null && fieldValue !== undefined) {
            valuesRecord.values.push(fieldValue);
            valuesRecord.valuesCount.set(fieldValue, (valuesRecord.valuesCount.get(fieldValue) ?? 0) + 1);
        }
    }
}

function getHighestTypesCount(typesCount: TypesCount): number {
    let highestCount = 0;
    Object.entries(typesCount).forEach(([type, count]) => {
        let countValue = 0;
        if (type === "map") {
            countValue = getHighestRecordCount(count as TypesCountRecord);
        } else if (type === "array") {
            countValue = getHighestTypesCount(count as TypesCount);
        } else {
            countValue = count as number;
        }
        if (countValue > highestCount) {
            highestCount = countValue;
        }
    });

    return highestCount;
}

function getHighestRecordCount(record: TypesCountRecord): number {
    return Object.entries(record)
        .map(([key, typesCount]) => getHighestTypesCount(typesCount))
        .reduce((a, b) => Math.max(a, b), 0);
}

function getMostProbableType(typesCount: TypesCount): DataType {
    let highestCount = -1;
    let probableType: DataType = "string"; // default
    Object.entries(typesCount).forEach(([type, count]) => {
        let countValue;
        if (type === "map") {
            countValue = getHighestRecordCount(count as TypesCountRecord);
        } else if (type === "array") {
            countValue = getHighestTypesCount(count as TypesCount);
        } else {
            countValue = count as number;
        }
        if (countValue > highestCount) {
            highestCount = countValue;
            probableType = type as DataType;
        }
    });
    return probableType;
}

function buildPropertyFromCount(
    key: string,
    totalDocsCount: number,
    mostProbableType: DataType,
    typesCount: TypesCount,
    valuesResult?: ValuesCountEntry
): Property {
    let title: string | undefined;

    if (key) {
        title = prettifyIdentifier(key);
    }

    let result: Property | undefined = undefined;
    if (mostProbableType === "map") {
        const highVariability = checkTypesCountHighVariability(typesCount);
        if (highVariability) {
            result = {
                type: "map",
                name: title,
                keyValue: true,
                properties: {}
            };
        }
        const properties = buildPropertiesFromCount(
            totalDocsCount,
            typesCount.map as TypesCountRecord,
            valuesResult ? valuesResult.mapValues : undefined
        );
        result = {
            type: "map",
            name: title,
            properties
        };
    } else if (mostProbableType === "array") {
        const arrayTypesCount = typesCount.array as TypesCount;
        const arrayMostProbableType = getMostProbableType(arrayTypesCount);
        const of = buildPropertyFromCount(
            key,
            totalDocsCount,
            arrayMostProbableType,
            arrayTypesCount,
            valuesResult
        );
        result = {
            type: "array",
            name: title,
            of
        };
    }

    if (!result) {
        const propertyProps: InferencePropertyBuilderProps = {
            name: key,
            totalDocsCount,
            valuesResult
        };
        if (mostProbableType === "string") {
            result = buildStringProperty(propertyProps);
        } else if (mostProbableType === "reference") {
            result = buildReferenceProperty(propertyProps);
        } else {
            result = {
                type: mostProbableType
            } as Property;
        }

        if (title) {
            result.name = title;
        }

        const validation = buildValidation(propertyProps);
        if (validation) {
            result.validation = validation;
        }
    }

    return {
        ...result,
        editable: true
    };
}

function buildPropertiesFromCount(
    totalDocsCount: number,
    typesCountRecord: TypesCountRecord,
    valuesCountRecord?: ValuesCountRecord
): Properties {
    const res: Properties = {};
    Object.entries(typesCountRecord).forEach(([key, typesCount]) => {
        const mostProbableType = getMostProbableType(typesCount);
        res[key] = buildPropertyFromCount(
            key,
            totalDocsCount,
            mostProbableType,
            typesCount,
            valuesCountRecord ? valuesCountRecord[key] : undefined
        );
    });
    return res;
}

function countMaxDocumentsUnder(typesCount: TypesCount) {
    let count = 0;
    Object.entries(typesCount).forEach(([type, value]) => {
        if (typeof value === "object") {
            count = Math.max(count, countMaxDocumentsUnder(value as TypesCountRecord));
        } else {
            count = Math.max(count, value as number);
        }
    });
    return count;
}

function getMostProbableTypeInArray(
    array: any[],
    getType: InferenceTypeBuilder
): DataType {
    const typesCount: TypesCount = {};
    array.forEach((value) => {
        increaseTypeCount(getType(value), typesCount, value, getType);
    });
    return getMostProbableType(typesCount);
}

function checkTypesCountHighVariability(typesCount: TypesCount) {
    const maxCount = countMaxDocumentsUnder(typesCount);
    let keysWithFewValues = 0;
    Object.entries(typesCount.map ?? {}).forEach(([key, value]) => {
        const count = countMaxDocumentsUnder(value);
        if (count < maxCount / 3) {
            keysWithFewValues++;
        }
    });
    return keysWithFewValues / Object.entries(typesCount.map ?? {}).length > 0.5;
}


export function inferTypeFromValue(value: any): DataType {
    if (value === null || value === undefined) return "string";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "map";
    return "string";
}
