import * as admin from "firebase-admin";
import {DataType, EntitySchema, Properties, Property} from "@camberi/firecms";
import {
    PropertyBuilderProps,
    TypesCount,
    TypesCountRecord,
    ValuesCountEntry,
    ValuesCountRecord
} from "./models";
import {buildStringProperty} from "./builders/string_property_builder";
import {buildValidation} from "./builders/validation_builder";
import {unslugify} from "./util";
import {buildReferenceProperty} from "./builders/reference_property_builder";
import {getDocuments} from "./firestore";

/**
 * Build the guesses entity schema from a collection
 * @param collectionPath
 */
export async function getEntitySchema(collectionPath: string): Promise<EntitySchema> {
    const docs = await getDocuments(collectionPath);
    console.log("Building schema from documents:", docs.map(d => d.ref.path))
    const entityProperties = await buildEntityProperties(docs);
    const collectionName = collectionPath.includes("/") ? collectionPath.split("/").slice(-1)[0] : collectionPath;
    return {
        id: collectionPath,
        name: unslugify(collectionName),
        properties: entityProperties
    };
}


export async function buildEntityProperties(docs: admin.firestore.DocumentSnapshot[]): Promise<Properties> {
    const typesCount: TypesCountRecord = {};
    const valuesCount: ValuesCountRecord = {};
    docs.forEach((doc) => {
        let data = doc.data();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                increaseMapTypeCount(typesCount, key, value);
                increaseValuesCount(valuesCount, key, value);
            })
        }
    });
    return buildPropertiesFromCount(docs.length, typesCount, valuesCount);
}

/**
 *
 * @param type
 * @param typesCount
 * @param fieldValue
 */
function increaseTypeCount(type: DataType, typesCount: TypesCount, fieldValue: any) {
    if (type === "map") {
        if (fieldValue) {
            let mapTypesCount = typesCount[type];
            if (!mapTypesCount) {
                mapTypesCount = {};
                typesCount[type] = mapTypesCount;
            }
            Object.entries(fieldValue).forEach(([key, value]) => {
                increaseMapTypeCount(mapTypesCount as TypesCountRecord, key, value);
            })
        }
    } else if (type === "array") {
        let arrayTypesCount = typesCount[type];
        if (!arrayTypesCount) {
            arrayTypesCount = {};
            typesCount[type] = arrayTypesCount;
        }
        (fieldValue as any[]).forEach(value => {
            const arrayType = getType(value);
            increaseTypeCount(arrayType, arrayTypesCount as TypesCount, value);
        });
    } else {
        if (!typesCount[type]) typesCount[type] = 1;
        else (typesCount[type] as number)++;
    }
}

function increaseMapTypeCount(
    typesCountRecord: TypesCountRecord,
    key: string,
    fieldValue: any
) {

    let typesCount: TypesCount = typesCountRecord[key];
    if (!typesCount) {
        typesCount = {};
        typesCountRecord[key] = typesCount;
    }

    const type = getType(fieldValue);
    increaseTypeCount(type, typesCount, fieldValue);
}

function increaseValuesCount(
    typeValuesRecord: ValuesCountRecord,
    key: string,
    fieldValue: any,
) {

    const dataType = getType(fieldValue);

    let valuesRecord: {
        values: any[];
        valuesCount: Map<any, number>;
        map?: ValuesCountRecord;
    } = typeValuesRecord[key];

    if (!valuesRecord) {
        valuesRecord = {values: [], valuesCount: new Map()};
        typeValuesRecord[key] = valuesRecord;
    }

    if (dataType === "map") {
        let mapValuesRecord: ValuesCountRecord | undefined = valuesRecord.map;
        if (!mapValuesRecord) {
            mapValuesRecord = {};
            valuesRecord.map = mapValuesRecord;
        }
        if (fieldValue)
            Object.entries(fieldValue).forEach(([key, value]) => increaseValuesCount(mapValuesRecord as ValuesCountRecord, key, value))
    } else if (dataType === "array") {
        if (Array.isArray(fieldValue)) {
            fieldValue.forEach((value) => {
                valuesRecord.values.push(value);
                valuesRecord.valuesCount.set(value, (valuesRecord.valuesCount.get(value) ?? 0) + 1);
            })
        }
    } else {
        if (fieldValue) {
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
        .reduce((a, b) => Math.max(a, b));
}

function getMostProbableType(typesCount: TypesCount): DataType {
    let highestCount = 0;
    let probableType: DataType = "string"; //default
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

function buildPropertyFromCount(name: string, totalDocsCount: number, mostProbableType: DataType, typesCount: TypesCount, valuesResult?: ValuesCountEntry, key?: string,): Property {
    let title: string | undefined = undefined;

    if (key) {
        title = unslugify(key);
    }

    if (mostProbableType === "map") {
        const properties = buildPropertiesFromCount(totalDocsCount, typesCount.map as TypesCountRecord, valuesResult ? valuesResult.mapValues : undefined);
        return {
            dataType: "map",
            name: title,
            properties
        };
    } else if (mostProbableType === "array") {
        const arrayTypesCount = typesCount.array as TypesCount;
        const arrayMostProbableType = getMostProbableType(arrayTypesCount);
        const of = buildPropertyFromCount(name, totalDocsCount, arrayMostProbableType, arrayTypesCount, valuesResult);
        return {
            dataType: "array",
            name: title,
            of
        };
    }
    let result: Property;
    let propertyProps:PropertyBuilderProps = {
        name,
        totalDocsCount,
        valuesResult
    };
    if (mostProbableType === "string") {
        result = buildStringProperty(propertyProps);
    } else if (mostProbableType === "reference") {
        result = buildReferenceProperty(propertyProps);
    } else {
        result = {
            dataType: mostProbableType,
        } as Property;
    }

    if (title) {
        result.name = title;
    }

    let validation = buildValidation(propertyProps);
    if (validation) {
        result.validation = validation;
    }

    return result;
}

function buildPropertiesFromCount(totalDocsCount: number, typesCountRecord: TypesCountRecord, valuesCountRecord?: ValuesCountRecord): Properties {

    console.log("buildPropertiesFromCount", valuesCountRecord);

    const res: Properties = {};
    Object.entries(typesCountRecord).forEach(([key, typesCount]) => {
        let mostProbableType = getMostProbableType(typesCount);
        res[key] = buildPropertyFromCount(key, totalDocsCount, mostProbableType, typesCount, valuesCountRecord ? valuesCountRecord[key] : undefined, key);
    })
    return res;
}

function getType(value: any): DataType {
    if (typeof value === "number")
        return "number";
    else if (typeof value === "string")
        return "string";
    else if (typeof value === "boolean")
        return "boolean";
    else if (Array.isArray(value))
        return "array";
    else if (value instanceof admin.firestore.Timestamp)
        return "timestamp";
    else if (value instanceof admin.firestore.GeoPoint)
        return "geopoint";
    else if (value instanceof admin.firestore.DocumentReference)
        return "reference";
    return "map";
}


