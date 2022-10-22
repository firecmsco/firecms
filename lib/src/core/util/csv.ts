import {
    Entity,
    EntityReference,
    ExportConfig,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty,
    User
} from "../../types";
import { getValueInPath } from "./objects";

interface Header {
    key: string;
    label: string;
}

export function downloadCSV<M extends Record<string, any>>(data: Entity<M>[],
                               additionalData: Record<string, any>[] | undefined,
                               collection: ResolvedEntityCollection<M>,
                               path: string,
                               exportConfig: ExportConfig | undefined) {
    const properties = collection.properties;
    const headers = getExportHeaders(properties, path, exportConfig);
    const exportableData = getExportableData(data, additionalData, properties, headers);
    const headersData = entryToCSVRow(headers.map(h => h.label));
    const csvData = exportableData.map(entry => entryToCSVRow(entry));
    downloadBlob([headersData, ...csvData], `${collection.name}.csv`, "text/csv");
}

export function getExportableData(data: any[],
                                  additionalData: Record<string, any>[] | undefined,
                                  properties: ResolvedProperties,
                                  headers: Header[]
) {

    const mergedData: any[] = data.map(e => ({ id: e.id, ...processCSVValues(e.values, properties) }));
    if (additionalData) {
        additionalData.forEach((additional, index) => {
            mergedData[index] = { ...mergedData[index], ...additional };
        });
    }
    return mergedData && mergedData.map((entry) => {
        return headers.map((header) => getValueInPath(entry, header.key));
    });
}

function getExportHeaders<M extends Record<string, any>, UserType extends User>(properties: ResolvedProperties<M>,
                                                                      path: string,
                                                                      exportConfig?: ExportConfig<UserType>): Header[] {
    const headers = [
        { label: "id", key: "id" },
        ...Object.entries(properties)
            .map(([childKey, property]) => getHeaders(property as ResolvedProperty, childKey, ""))
            .flat()
    ];

    if (exportConfig?.additionalFields) {
        headers.push(...exportConfig.additionalFields.map((column) => ({
            label: column.key,
            key: column.key
        })));
    }

    return headers;
}

/**
 * Get headers for property. There could be more than one header per property
 * @param property
 * @param propertyKey
 * @param prefix
 */
function getHeaders(property: ResolvedProperty, propertyKey: string, prefix = ""): Header[] {
    const currentKey = prefix ? `${prefix}.${propertyKey}` : propertyKey;
    if (property.dataType === "map" && property.properties) {
        return Object.entries(property.properties)
            .map(([childKey, p]) => getHeaders(p, childKey, currentKey))
            .flat();
    } else {
        return [{ label: currentKey, key: currentKey }];
    }
}

function processCSVValue(inputValue: any,
                         property: ResolvedProperty): any {

    let value;
    if (property.dataType === "map" && property.properties) {
        value = processCSVValues(inputValue, property.properties as ResolvedProperties);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            if (Array.isArray(property.of)) {
                value = property.of.map((p, i) => processCSVValue(inputValue[i], p));
            } else if (property.of.dataType === "map") {
                value = inputValue.map((e) => JSON.stringify(e));
            } else {
                value = inputValue.map((e) => processCSVValue(e, property.of as ResolvedProperty));
            }
        } else {
            value = inputValue;
        }
    } else if (property.dataType === "reference") {
        const ref = inputValue ? inputValue as EntityReference : undefined;
        value = ref ? ref.pathWithId : null;
    } else if (property.dataType === "date") {
        value = inputValue ? inputValue.getTime() : null;
    } else {
        value = inputValue;
    }

    return value;
}

function processCSVValues<M extends Record<string, any>>
(inputValues: Record<keyof M, any>, properties: ResolvedProperties<M>): Record<keyof M, any> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues)[key];
            const updatedValue = processCSVValue(inputValue, property as ResolvedProperty);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Record<keyof M, any>;
    return { ...inputValues, ...updatedValues };
}

function entryToCSVRow(entry: any[]) {
    return entry
        .map((v: string | undefined) => {
            if (v === null || v === undefined) return "";
            const s = String(v);
            return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(",") + "\r\n";
}

export function downloadBlob(content: BlobPart[], filename: string, contentType: string) {
    const blob = new Blob(content, { type: contentType });
    const url = URL.createObjectURL(blob);
    const pom = document.createElement("a");
    pom.href = url;
    pom.setAttribute("download", filename);
    pom.click();
}
