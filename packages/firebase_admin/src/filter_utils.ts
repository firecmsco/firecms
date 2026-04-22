import { AdminDocument } from "./api/admin_api";

// ─── Field type inference ──────────────────────────────────────────────────

export type FieldType =
    | "string"
    | "number"
    | "boolean"
    | "timestamp"
    | "array"
    | "map"
    | "geopoint"
    | "reference"
    | "null"
    | "unknown";

/**
 * Scan loaded documents and infer the predominant type for each field.
 * Looks at up to MAX_SAMPLE non-null values per field.
 */
const MAX_SAMPLE = 20;

export function inferFieldTypes(documents: AdminDocument[]): Record<string, FieldType> {
    const result: Record<string, FieldType> = {};
    const counts: Record<string, Record<FieldType, number>> = {};

    for (const doc of documents) {
        if (!doc.values) continue;
        for (const [key, value] of Object.entries(doc.values)) {
            if (!counts[key]) counts[key] = {} as Record<FieldType, number>;
            const t = detectValueType(value);
            counts[key][t] = (counts[key][t] || 0) + 1;
        }
    }

    for (const [key, typeCounts] of Object.entries(counts)) {
        // Pick the most frequent non-null type
        let best: FieldType = "unknown";
        let bestCount = 0;
        for (const [t, c] of Object.entries(typeCounts)) {
            if (t === "null") continue;
            if (c > bestCount) {
                bestCount = c;
                best = t as FieldType;
            }
        }
        result[key] = best;
    }

    return result;
}

function detectValueType(value: any): FieldType {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";

    if (value instanceof Date) return "timestamp";
    // Firestore timestamp objects
    if (value && typeof value === "object" && "_seconds" in value && "_nanoseconds" in value) return "timestamp";
    // Firestore Timestamp-like with seconds/nanoseconds
    if (value && typeof value === "object" && "seconds" in value && "nanoseconds" in value) return "timestamp";

    if (Array.isArray(value)) return "array";

    if (typeof value === "object") {
        // Geopoint: has latitude + longitude
        if ("latitude" in value && "longitude" in value && Object.keys(value).length === 2) return "geopoint";
        // Reference: has _path or referenceValue
        if ("_path" in value || "referenceValue" in value || "path" in value) return "reference";
        return "map";
    }

    return "unknown";
}

// ─── Operators per type ────────────────────────────────────────────────────

export type FilterOp =
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "in"
    | "not-in"
    | "array-contains"
    | "array-contains-any"
    | "is-null";

export const OPERATOR_LABELS: Record<FilterOp, string> = {
    "==": "equals",
    "!=": "not equals",
    "<": "less than",
    "<=": "less or equal",
    ">": "greater than",
    ">=": "greater or equal",
    "in": "in",
    "not-in": "not in",
    "array-contains": "contains",
    "array-contains-any": "contains any",
    "is-null": "is null",
};

const OPS_COMPARISON: FilterOp[] = ["==", "!=", "<", "<=", ">", ">=", "in", "not-in", "is-null"];
const OPS_BOOLEAN: FilterOp[] = ["==", "!=", "is-null"];
const OPS_ARRAY: FilterOp[] = ["array-contains", "array-contains-any", "is-null"];
const OPS_NULL_ONLY: FilterOp[] = ["==", "is-null"];

export function getOperatorsForType(fieldType: FieldType): FilterOp[] {
    switch (fieldType) {
        case "string":
        case "number":
        case "timestamp":
            return OPS_COMPARISON;
        case "boolean":
            return OPS_BOOLEAN;
        case "array":
            return OPS_ARRAY;
        case "map":
        case "geopoint":
        case "reference":
            return OPS_NULL_ONLY;
        default:
            return OPS_COMPARISON; // fallback for unknown
    }
}

// ─── Type badge labels ─────────────────────────────────────────────────────

export const TYPE_BADGES: Record<FieldType, { label: string; color: string }> = {
    string: { label: "Str", color: "text-blue-400" },
    number: { label: "Num", color: "text-emerald-400" },
    boolean: { label: "Bool", color: "text-amber-400" },
    timestamp: { label: "Time", color: "text-purple-400" },
    array: { label: "Arr", color: "text-orange-400" },
    map: { label: "Map", color: "text-pink-400" },
    geopoint: { label: "Geo", color: "text-cyan-400" },
    reference: { label: "Ref", color: "text-rose-400" },
    null: { label: "Null", color: "text-surface-400" },
    unknown: { label: "?", color: "text-surface-400" },
};

// ─── Multi-value operators ─────────────────────────────────────────────────

export const MULTI_VALUE_OPS: FilterOp[] = ["in", "not-in", "array-contains-any"];

export function isMultiValueOp(op: string): boolean {
    return MULTI_VALUE_OPS.includes(op as FilterOp);
}

// ─── Filter definition ─────────────────────────────────────────────────────

export type FilterDef = {
    field: string;
    op: FilterOp;
    value: any; // string | number | boolean | Date | any[] | null
    valueType: FieldType; // user-selected data type (defaults to inferred, can be overridden)
};

// Types available in the value-type selector — all Firestore types for NoSQL flexibility
export const FILTERABLE_VALUE_TYPES: FieldType[] = [
    "string",
    "number",
    "boolean",
    "timestamp",
    "array",
    "map",
    "geopoint",
    "reference",
    "null",
];

// ─── Parse a filter value for the API ──────────────────────────────────────

export function parseFilterValueForApi(filter: FilterDef): { field: string; op: string; value: any } {
    const { field, op, value } = filter;

    if (op === "is-null") {
        return { field, op: "==", value: null };
    }

    return { field, op, value };
}

// ─── LocalStorage keys ─────────────────────────────────────────────────────

const LS_FILTER_PREFIX = "firecms_admin_filters_";

export function readPersistedFilters(path: string): FilterDef[] | null {
    try {
        const raw = localStorage.getItem(LS_FILTER_PREFIX + path);
        if (raw) {
            const parsed = JSON.parse(raw) as FilterDef[];
            // Migrate old filters that lack valueType
            return parsed.map(f => ({
                ...f,
                valueType: f.valueType ?? "string",
            }));
        }
    } catch { /* ignore */ }
    return null;
}

export function persistFilters(path: string, filters: FilterDef[]) {
    try {
        if (filters.length === 0) {
            localStorage.removeItem(LS_FILTER_PREFIX + path);
        } else {
            localStorage.setItem(LS_FILTER_PREFIX + path, JSON.stringify(filters));
        }
    } catch { /* ignore */ }
}
