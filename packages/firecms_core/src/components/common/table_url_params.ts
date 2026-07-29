import { EntityReference, FilterValues, WhereFilterOp } from "../../types";
import { decodeEntityId, encodeEntityId } from "../../util/navigation_utils";

/**
 * Internal helpers used by `useDataSourceTableController` to persist the state of a
 * collection table (filters, sort and text search) in the URL query string.
 *
 * These functions are intentionally NOT re-exported by the package barrel files:
 * they are pure and live in their own module only so that they can be unit tested.
 * `encodeFilterAndSort` and `parseFilterAndSort` must stay exact inverses of each
 * other, otherwise state written to the URL is silently dropped on reload.
 */

/**
 * Serialise the state of a collection table into a URL query string,
 * without the leading `?`. Returns an empty string when there is no state to persist.
 */
export function encodeFilterAndSort(filterValues?: FilterValues<string>,
                                    sortBy?: [string, "asc" | "desc"] | undefined,
                                    searchString?: string) {
    const entries: Record<string, string> = {};
    if (sortBy) {
        entries["__sort"] = encodeURIComponent(sortBy[0]);
        entries["__sort_order"] = encodeURIComponent(sortBy[1]);
    }
    if (filterValues) {
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value) {
                const [op, val] = value;
                let encodedValue: any = val;
                try {
                    if (typeof val === "object") {
                        if (val instanceof Date) {
                            encodedValue = val.toISOString();
                        } else if (Array.isArray(val)) {
                            encodedValue = JSON.stringify(val, (key, value) => {
                                if (value instanceof EntityReference) {
                                    return encodeRef(value);
                                }
                                return value;
                            });
                        } else if (val instanceof EntityReference) {
                            encodedValue = encodeRef(val);
                        }
                    } else if (typeof val === "string") {
                        // JSON.stringify wraps the string in quotes (e.g. "4" → '"4"')
                        // so that decodeString's JSON.parse restores the string type,
                        // not a number. Without this, "4" round-trips as the number 4.
                        encodedValue = JSON.stringify(val);
                    }
                } catch (e) {
                    encodedValue = val;
                }
                if (encodedValue !== undefined) {
                    entries[encodeURIComponent(`${key}_op`)] = encodeURIComponent(op);
                    // Note: check for null/undefined explicitly instead of truthiness,
                    // otherwise falsy-but-valid values (boolean `false`, number `0`)
                    // would be serialized as "null" and round-trip back as `null`,
                    // breaking filters like `archived == false`.
                    entries[encodeURIComponent(`${key}_value`)] = encodedValue !== null && encodedValue !== undefined
                        ? encodeURIComponent(encodedValue.toString())
                        : "null";
                }
            }
        });
    }
    // The text search term is encoded once here; `parseFilterAndSort` reads it back with
    // `URLSearchParams`, which decodes exactly once. Do NOT decode it a second time or
    // terms containing a literal `%` (e.g. "50%") would throw a URIError.
    if (searchString) {
        entries["search"] = encodeURIComponent(searchString);
    }
    if (!Object.keys(entries).length) {
        return "";
    }
    return Object.entries(entries).map(([key, value]) => `${key}=${value}`).join("&");
}

/**
 * Restore the state of a collection table from a URL query string.
 * The inverse of {@link encodeFilterAndSort}.
 */
export function parseFilterAndSort<M>(search: string): {
    filterValues: FilterValues<string> | undefined,
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"],
    searchString?: string
} {
    const entries = new URLSearchParams(search);
    const filterValues: FilterValues<string> = {};
    let sortBy: [string, "asc" | "desc"] | undefined = undefined;
    entries.forEach((value, key) => {
        if (key === "__sort") {
            sortBy = [decodeURIComponent(value), entries.get("__sort_order") as "asc" | "desc"];
        } else if (key.endsWith("_op")) {
            const field = key.replace("_op", "");
            const filterOp = decodeURIComponent(value) as WhereFilterOp;
            const filterValStr = entries.get(`${field}_value`);
            if (filterValStr !== null) {
                filterValues[field] = [filterOp, decodeString(filterValStr)];
            }
        }
    });

    // `URLSearchParams` has already percent-decoded the value, so it is used as is.
    const searchString = entries.get("search") ?? undefined;

    return {
        filterValues: Object.keys(filterValues).length ? filterValues : undefined,
        sortBy,
        searchString: searchString ? searchString : undefined
    }
}

function isDate(dateString: string): boolean {
    // Define a regex pattern that matches the exact date format: 2025-01-07T23:00:00.000Z
    const regexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    // Test the dateString against the regex pattern
    if (!regexPattern.test(dateString)) {
        return false;
    }

    // If the regex matches, further validate if it is a valid UTC date
    const date = new Date(dateString);
    return date.toISOString() === dateString;
}

function encodeRef(val: EntityReference) {
    return `ref::${val.path}/${encodeEntityId(val.id)}`;
}

/**
 * Split a "path/id" reference on its LAST separator: the path may itself be a
 * subcollection path with several segments, and the id is escaped so it is always exactly
 * one segment.
 */
function decodeRef(encoded: string): EntityReference {
    const separatorIndex = encoded.lastIndexOf("/");
    if (separatorIndex < 0) return new EntityReference(encoded, "");
    return new EntityReference(
        decodeEntityId(encoded.substring(separatorIndex + 1)),
        encoded.substring(0, separatorIndex)
    );
}

function decodeString(val: string): EntityReference | Date | string {
    let parsedFilterVal: any = val;
    if (isDate(val)) {
        try {
            parsedFilterVal = new Date(val);
        } catch (e) {
            // ignore
        }
    }
    if (typeof parsedFilterVal === "string") {
        try {
            parsedFilterVal = JSON.parse(parsedFilterVal, (key, value) => {
                if (typeof value === "string" && value.startsWith("ref::")) {
                    return decodeRef(value.substring(5));
                }
                return value;
            });
        } catch (e) {
            // ignore
        }
    }

    if (typeof parsedFilterVal === "string" && parsedFilterVal.startsWith("ref::")) {
        return decodeRef(parsedFilterVal.substring(5));
    }
    return parsedFilterVal;
}
