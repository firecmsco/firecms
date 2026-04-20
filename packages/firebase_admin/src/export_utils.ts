import { AdminDocument } from "./api/admin_api";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "json";

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Flatten a nested object to dot-notation keys.
 * e.g. { a: { b: 1 }, c: [2,3] } → { "a.b": 1, "c": [2,3] }
 * Arrays are NOT flattened — they're kept as values and serialized as JSON in CSV.
 */
function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (
            value !== null &&
            value !== undefined &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            !isTimestampLike(value) &&
            !isGeoPointLike(value) &&
            !isReferenceLike(value)
        ) {
            Object.assign(result, flattenObject(value, fullKey));
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

function isTimestampLike(v: any): boolean {
    return v && typeof v === "object" && ("_seconds" in v || "_nanoseconds" in v);
}

function isGeoPointLike(v: any): boolean {
    return v && typeof v === "object" && "_lat" in v && "_long" in v;
}

function isReferenceLike(v: any): boolean {
    return v && typeof v === "object" && "_path" in v;
}

/**
 * Serialize a single value for CSV output.
 */
function serializeCsvValue(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value;
    if (isTimestampLike(value)) {
        return new Date(value._seconds * 1000).toISOString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (isGeoPointLike(value)) {
        return `${value._lat},${value._long}`;
    }
    if (isReferenceLike(value)) {
        return value._path;
    }
    // Arrays & remaining objects → JSON
    return JSON.stringify(value);
}

/**
 * Escape and quote a value for CSV.
 */
function csvEscape(value: string): string {
    if (value.includes(",") || value.includes("\"") || value.includes("\n") || value.includes("\r")) {
        return "\"" + value.replace(/"/g, "\"\"") + "\"";
    }
    return value;
}

// ─── Exports ────────────────────────────────────────────────────────────────

/**
 * Convert admin documents to CSV text.
 * Flattens nested objects to dot-notation columns.
 */
export function documentsToCSV(documents: AdminDocument[], collectionPath: string): string {
    if (documents.length === 0) return "";

    // Flatten all documents and collect unique headers
    const flatDocs: Record<string, any>[] = documents.map(doc => ({
        __id: doc.id,
        __path: doc.path,
        ...flattenObject(doc.values ?? {}),
    }));

    // Gather all unique keys preserving insertion order
    const headerSet = new Set<string>();
    headerSet.add("__id");
    headerSet.add("__path");
    for (const flat of flatDocs) {
        for (const key of Object.keys(flat)) {
            headerSet.add(key);
        }
    }
    const headers = Array.from(headerSet);

    // Build CSV
    const rows: string[] = [];
    rows.push(headers.map(h => csvEscape(h)).join(","));
    for (const flat of flatDocs) {
        const row = headers.map(h => {
            const raw = flat[h];
            return csvEscape(serializeCsvValue(raw));
        });
        rows.push(row.join(","));
    }
    return rows.join("\r\n") + "\r\n";
}

/**
 * Convert admin documents to a JSON string.
 * Each document becomes an object with "id", "path", and all field values.
 * Timestamps are converted to ISO strings for readability.
 */
export function documentsToJSON(documents: AdminDocument[]): string {
    const data = documents.map(doc => ({
        __id: doc.id,
        __path: doc.path,
        ...processValuesForJson(doc.values ?? {}),
    }));
    return JSON.stringify(data, null, 2);
}

function processValuesForJson(values: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(values)) {
        result[key] = processValueForJson(value);
    }
    return result;
}

function processValueForJson(value: any): any {
    if (value === null || value === undefined) return value;
    if (isTimestampLike(value)) {
        return new Date(value._seconds * 1000).toISOString();
    }
    if (isGeoPointLike(value)) {
        return { lat: value._lat, lng: value._long };
    }
    if (isReferenceLike(value)) {
        return value._path;
    }
    if (Array.isArray(value)) {
        return value.map(processValueForJson);
    }
    if (typeof value === "object") {
        return processValuesForJson(value);
    }
    return value;
}

/**
 * Download a string as a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Build a sanitized filename from a collection path.
 */
export function collectionFilename(path: string, format: ExportFormat): string {
    const safeName = path.replace(/\//g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
    return `${safeName}_${timestamp}.${format}`;
}
