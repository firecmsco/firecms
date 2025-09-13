import {
    ArrayValuesCount,
    Entity,
    EntityReference,
    getArrayValuesCount,
    getValueInPath, Properties,
    Property,
} from "@firecms/core";

interface Header {
    key: string;
    label: string;
}

export interface DownloadEntitiesExportParams<M extends Record<string, any>> {
    data: Entity<M>[];
    additionalData: Record<string, any>[] | undefined;
    properties: Properties;
    propertiesOrder: string[] | undefined;
    name: string;
    flattenArrays: boolean;
    additionalHeaders: string[] | undefined;
    exportType: "csv" | "json";
    dateExportType: "timestamp" | "string";
}

export function downloadEntitiesExport<M extends Record<string, any>>({
                                                                          data,
                                                                          additionalData,
                                                                          properties,
                                                                          propertiesOrder,
                                                                          name,
                                                                          flattenArrays,
                                                                          additionalHeaders,
                                                                          exportType,
                                                                          dateExportType
                                                                      }: DownloadEntitiesExportParams<M>
) {

    console.debug("Downloading export", {
        dataLength: data.length,
        properties,
        exportType,
        dateExportType
    });

    if (exportType === "csv") {
        const arrayValuesCount = flattenArrays ? getArrayValuesCount(data.map(d => d.values)) : {};
        const headers = getExportHeaders(properties, propertiesOrder, additionalHeaders, arrayValuesCount);
        const exportableData = getEntityCSVExportableData(data, additionalData, properties, headers, dateExportType);
        const headersData = entryToCSVRow(headers.map(h => h.label));
        const csvData = exportableData.map(entry => entryToCSVRow(entry));
        downloadBlob([headersData, ...csvData], `${name}.csv`, "text/csv");
    } else {
        const exportableData = getEntityJsonExportableData(data, additionalData, properties, dateExportType);
        const json = JSON.stringify(exportableData, null, 2);
        downloadBlob([json], `${name}.json`, "application/json");
    }
}

export function getEntityCSVExportableData(data: Entity<any>[],
                                           additionalData: Record<string, any>[] | undefined,
                                           properties: Properties,
                                           headers: Header[],
                                           dateExportType: "timestamp" | "string"
) {

    const mergedData: any[] = data.map(e => ({
        id: e.id,
        ...processValuesForExport(e.values, properties, "csv", dateExportType)
    }));

    if (additionalData) {
        additionalData.forEach((additional, index) => {
            mergedData[index] = { ...mergedData[index], ...additional };
        });
    }

    return mergedData && mergedData.map((entry) => {
        return headers.map((header) => getValueInPath(entry, header.key));
    });
}

export function getEntityJsonExportableData(data: Entity<any>[],
                                            additionalData: Record<string, any>[] | undefined,
                                            properties: Properties,
                                            dateExportType: "timestamp" | "string"
) {

    const mergedData: any[] = data.map(e => ({
        id: e.id,
        ...processValuesForExport(e.values, properties, "json", dateExportType)
    }));

    if (additionalData) {
        additionalData.forEach((additional, index) => {
            mergedData[index] = { ...mergedData[index], ...additional };
        });
    }

    return mergedData;
}

function getExportHeaders<M extends Record<string, any>>(properties: Properties,
                                                         propertiesOrder: string[] | undefined,
                                                         additionalHeaders: string[] | undefined,
                                                         arrayValuesCount?: ArrayValuesCount): Header[] {

    const headers: Header[] = [
        {
            label: "id",
            key: "id"
        },
        ...(propertiesOrder ?? Object.keys(properties))
            .flatMap((childKey) => {
                const property = properties[childKey];
                if (!property) {
                    console.warn("Property not found", childKey, properties);
                    return [];
                }
                if (arrayValuesCount && arrayValuesCount[childKey] > 1) {
                    return Array.from({ length: arrayValuesCount[childKey] },
                        (_, i) => getHeaders(property as Property, `${childKey}[${i}]`, ""))
                        .flat();
                } else {
                    return getHeaders(property as Property, childKey, "");
                }
            })
    ];

    if (additionalHeaders) {
        headers.push(...additionalHeaders.map(h => ({
            label: h,
            key: h
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
function getHeaders(property: Property, propertyKey: string, prefix = ""): Header[] {
    const currentKey = prefix ? `${prefix}.${propertyKey}` : propertyKey;
    if (property.type === "map" && property.properties) {
        return Object.entries(property.properties)
            .map(([childKey, p]) => getHeaders(p, childKey, currentKey))
            .flat();
    } else {
        return [{
            label: currentKey,
            key: currentKey
        }];
    }
}

function processValueForExport(inputValue: any,
                               property: Property,
                               exportType: "csv" | "json",
                               dateExportType: "timestamp" | "string"
): any {

    let value;
    if (property.type === "map" && property.properties) {
        value = processValuesForExport(inputValue, property.properties as Properties, exportType, dateExportType);
    } else if (property.type === "array") {
        if (property.of && Array.isArray(inputValue)) {
            if (Array.isArray(property.of)) {
                value = property.of.map((p, i) => processValueForExport(inputValue[i], p, exportType, dateExportType));
            } else if (property.of.type === "map") {
                value = exportType === "csv"
                    ? inputValue.map((e) => JSON.stringify(e))
                    : inputValue.map((e) => processValueForExport(e, property.of as Property, exportType, dateExportType));
                ;
            } else {
                value = inputValue.map((e) => processValueForExport(e, property.of as Property, exportType, dateExportType));
            }
        } else {
            value = inputValue;
        }
    } else if (property.type === "reference" && inputValue && inputValue.isEntityReference && inputValue.isEntityReference()) {
        const ref = inputValue ? inputValue as EntityReference : undefined;
        value = ref ? ref.pathWithId : null;
    } else if (property.type === "date" && inputValue instanceof Date) {
        value = inputValue ? (dateExportType === "timestamp" ? inputValue.getTime() : inputValue.toISOString()) : null;
    } else {
        value = inputValue;
    }

    return value;
}

function processValuesForExport<M extends Record<string, any>>
(inputValues: Record<keyof M, any>,
 properties: Properties,
 exportType: "csv" | "json",
 dateExportType: "timestamp" | "string"
): Record<keyof M, any> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues)[key];
            const updatedValue = processValueForExport(inputValue, property as Property, exportType, dateExportType);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Record<keyof M, any>;
    return { ...inputValues, ...updatedValues };
}

function entryToCSVRow(entry: any[]) {
    return entry
        .map((v: any) => {
            if (v === null || v === undefined) return "";
            if (Array.isArray(v))
                return "\"" + JSON.stringify(v).replaceAll("\"", "\"\"") + "\"";
            const s = String(v);
            return "\"" + s.replaceAll("\"", "\"\"") + "\"";
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

export function downloadDataAsCsv(data: object[], name: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(header => {
            const value = (row as any)[header];
            if (value === null || value === undefined) return "";
            if (Array.isArray(value)) return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(","))
    ].join("\r\n");

    downloadBlob([csvContent], `${name}.csv`, "text/csv");
}
