import { QueryOptions } from "../types";

/**
 * Map PostgREST-style operators to Rebase WhereFilterOp
 */
export function mapOperator(op: string): string | null {
    switch (op) {
        case "eq": return "==";
        case "neq": return "!=";
        case "gt": return ">";
        case "gte": return ">=";
        case "lt": return "<";
        case "lte": return "<=";
        case "in": return "in";
        case "nin": return "not-in";
        case "cs": return "array-contains";
        case "csa": return "array-contains-any";
        default: return null;
    }
}

/**
 * Parse query parameters into QueryOptions
 */
export function parseQueryOptions(query: Record<string, unknown>): QueryOptions {
    const options: QueryOptions = {};

    // Pagination
    if (query.limit) options.limit = parseInt(String(query.limit));
    if (query.offset) options.offset = parseInt(String(query.offset));
    if (query.page) {
        const page = parseInt(String(query.page));
        const limit = options.limit || 20;
        options.offset = (page - 1) * limit;
    }

    // Filtering
    options.where = {};

    // Legacy JSON where clause
    if (query.where) {
        try {
            const parsedWhere = typeof query.where === "string"
                ? JSON.parse(query.where)
                : query.where;
            if (typeof parsedWhere !== "object" || parsedWhere === null || Array.isArray(parsedWhere)) {
                throw new Error("Filter must be a JSON object");
            }
            Object.assign(options.where, parsedWhere);
        } catch (e) {
            const message = e instanceof Error ? e.message : "malformed JSON";
            const err = new Error(`Invalid 'where' filter: ${message}`) as Error & { code?: string; statusCode?: number };
            err.code = "BAD_REQUEST";
            err.statusCode = 400;
            throw err;
        }
    }

    // PostgREST style filtering
    const reservedQueryKeys = ["limit", "offset", "page", "orderBy", "where", "include", "fields"];
    for (const [key, rawValue] of Object.entries(query)) {
        if (reservedQueryKeys.includes(key)) continue;

        const value = Array.isArray(rawValue) ? rawValue[rawValue.length - 1] : rawValue;

        if (typeof value === "string") {
            const parts = value.split(".");
            if (parts.length >= 2) {
                const op = parts[0];
                const val = parts.slice(1).join(".");
                const rebaseOp = mapOperator(op);

                if (rebaseOp) {
                    let parsedVal: string | number | boolean | null | (string | number | boolean | null)[] = val;
                    // Attempt to parse primitive types or arrays
                    if (val === "true") parsedVal = true;
                    else if (val === "false") parsedVal = false;
                    else if (val === "null") parsedVal = null;
                    else if (!isNaN(Number(val)) && val.trim() !== "") parsedVal = Number(val);
                    else if (val.startsWith("(")) {
                        // Array for 'in' or 'not-in' ops (e.g. (1,2,3) or (a,b,c))
                        const arrayContent = val.endsWith(")") ? val.slice(1, -1) : val.slice(1);
                        parsedVal = arrayContent.split(",").map(v => {
                            const trimmed = v.trim();
                            if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
                            if (trimmed === "true") return true;
                            if (trimmed === "false") return false;
                            if (trimmed === "null") return null;
                            return trimmed;
                        });
                    }

                    options.where[key] = [rebaseOp, parsedVal];
                } else {
                    // Fallback: assume implicit eq if the dot wasn't an operator (e.g. email or float)
                    let parsedVal: string | number | boolean | null = value;
                    if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);
                    options.where[key] = ["==", parsedVal];
                }
            } else {
                // Implicit eq
                let parsedVal: string | number | boolean | null = value;
                if (value === "true") parsedVal = true;
                else if (value === "false") parsedVal = false;
                else if (value === "null") parsedVal = null;
                else if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);

                options.where[key] = ["==", parsedVal];
            }
        }
    }

    if (Object.keys(options.where).length === 0) {
        delete options.where;
    }

    // Sorting
    if (query.orderBy) {
        try {
            options.orderBy = typeof query.orderBy === "string"
                ? JSON.parse(query.orderBy)
                : query.orderBy;
        } catch {
            // Try simple format: "field:direction"
            if (typeof query.orderBy === "string") {
                const [field, direction] = query.orderBy.split(":");
                const dir = (direction === "desc" ? "desc" : "asc") as "asc" | "desc";
                options.orderBy = [
                    {
                        field,
                        direction: dir
                    }
                ];
            }
        }
    }

    // Relation includes
    if (query.include) {
        const includeStr = String(query.include).trim();
        if (includeStr === "*") {
            options.include = ["*"];
        } else {
            options.include = includeStr.split(",").map(s => s.trim()).filter(Boolean);
        }
    }

    // Field selection
    if (query.fields) {
        const fieldsStr = String(query.fields).trim();
        options.fields = fieldsStr.split(",").map(s => s.trim()).filter(Boolean);
    }

    return options;
}
