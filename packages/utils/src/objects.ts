import hash from "object-hash";
import { GeoPoint } from "@rebasepro/types";

/** @private is the value an empty array? */
export const isEmptyArray = (value?: unknown) =>
    Array.isArray(value) && value.length === 0;

/** @private is the given object a Function? */
export const isFunction = (obj: unknown): obj is Function =>
    typeof obj === "function";

/** @private is the given object an integer? */
export const isInteger = (obj: unknown): boolean =>
    String(Math.floor(Number(obj))) === String(obj);

/** @private is the given object a NaN? */
// eslint-disable-next-line no-self-compare
export const isNaN = (obj: unknown): boolean => obj !== obj;

/**
 * Deeply get a value from an object via its path.
 */
export function getIn(
    obj: Record<string, unknown> | unknown[] | unknown,
    key: string | string[],
    def?: unknown,
    p = 0
) {
    const path = toPath(key);
    while (obj && p < path.length) {
        obj = (obj as Record<string, unknown>)[path[p++]];
    }

    // check if path is not in the end
    if (p !== path.length && !obj) {
        return def;
    }

    return obj === undefined ? def : obj;
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
    const res = clone(obj) as Record<string, unknown>;
    let resVal: Record<string, unknown> = res;
    let i = 0;
    const pathArray = toPath(path);

    for (; i < pathArray.length - 1; i++) {
        const currentPath: string = pathArray[i];
        const currentObj = getIn(obj as Record<string, unknown>, pathArray.slice(0, i + 1));

        if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
            resVal = resVal[currentPath] = clone(currentObj) as Record<string, unknown>;
        } else {
            const nextPath: string = pathArray[i + 1];
            resVal = resVal[currentPath] =
                (isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {}) as Record<string, unknown>;
        }
    }

    // Return original object if new value is the same as current
    if ((i === 0 ? obj as Record<string, unknown> : resVal)[pathArray[i]] === value) {
        return obj;
    }

    if (value === undefined) {
        delete resVal[pathArray[i]];
    } else {
        resVal[pathArray[i]] = value;
    }

    // If the path array has a single element, the loop did not run.
    // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.
    if (i === 0 && value === undefined) {
        delete res[pathArray[i]];
    }

    return res as T;
}

export function clone<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as unknown as T;
    } else if (typeof value === "object" && value !== null) {
        return { ...value } as T;
    } else {
        return value; // This is for primitive types which do not need cloning.
    }
}

function toPath(value: string | string[]) {
    if (Array.isArray(value)) return value; // Already in path array form.
    // Replace brackets with dots, remove leading/trailing dots, then split by dot.
    return value.replace(/\[(\d+)]/g, ".$1").replace(/^\./, "").replace(/\.$/, "").split(".");
}


export const pick: <T extends Record<string, unknown>>(obj: T, ...args: (keyof T)[]) => Partial<T> = <T extends Record<string, unknown>>(obj: T, ...args: (keyof T)[]) => ({
    ...args.reduce<Record<string, unknown>>((res, key) => ({
        ...res,
        [key as string]: obj[key as string]
    }), {})
}) as Partial<T>;

export function isObject(item: unknown): item is Record<string, unknown> {
    return !!item && typeof item === "object" && !Array.isArray(item);
}

export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
    // 1. Rule out non-objects, null, and arrays
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return false;
    }

    // 2. Get the object's direct prototype
    const proto = Object.getPrototypeOf(obj);

    // 3. A plain object's direct prototype is Object.prototype
    return proto === Object.prototype;
}

export function mergeDeep<T extends Record<string, any>, U extends Record<string, any>>(
    target: T,
    source: U,
    ignoreUndefined: boolean = false
): T & U {
    // If target is not a true object (e.g., null, array, primitive), return target itself.
    if (!isObject(target)) {
        return target as T & U;
    }

    // Create a shallow copy of the target to avoid modifying the original object.
    const output = { ...target };

    // If source is not a true object, there's nothing to merge from it.
    // Return the shallow copy of target.
    if (!isObject(source)) {
        return output as T & U;
    }

    // Iterate over keys in the source object.
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const outputValue = (output as Record<string, unknown>)[key]; // Current value in our merged object (originating from target)

            // Skip if source value is undefined and ignoreUndefined is true.
            // This handles both not adding new undefined properties and not overwriting existing properties with undefined.
            if (ignoreUndefined && sourceValue === undefined) {
                continue;
            }

            if ((sourceValue as unknown) instanceof Date) {
                // If source value is a Date, create a new Date instance.
                (output as Record<string, unknown>)[key] = new Date((sourceValue as unknown as Date).getTime());
            } else if (Array.isArray(sourceValue)) {
                if (Array.isArray(outputValue)) {
                    const newArray = [];
                    const maxLength = Math.max(outputValue.length, sourceValue.length);
                    for (let i = 0; i < maxLength; i++) {
                        const sourceItem = sourceValue[i];
                        const targetItem = outputValue[i];

                        if (i >= sourceValue.length) { // source is shorter
                            newArray[i] = targetItem;
                        } else if (i >= outputValue.length) { // target is shorter
                            newArray[i] = sourceItem;
                        } else if (sourceItem === null) {
                            newArray[i] = targetItem;
                        } else if (isPlainObject(sourceItem) && isPlainObject(targetItem)) {
                            // Only recursively merge plain objects, preserve class instances
                            newArray[i] = mergeDeep(targetItem, sourceItem, ignoreUndefined);
                        } else {
                            // For class instances and primitives, use source directly
                            newArray[i] = sourceItem;
                        }
                    }
                    (output as Record<string, unknown>)[key] = newArray;
                } else {
                    // If output's value (from target) is not an array,
                    // overwrite with a shallow copy of the source array.
                    (output as Record<string, unknown>)[key] = [...sourceValue];
                }
            } else if (isPlainObject(sourceValue)) {
                // If source value is a plain object (not a class instance like EntityReference, GeoPoint, etc.):
                if (isPlainObject(outputValue)) {
                    // If the corresponding value in output (from target) is also a plain object, recurse.
                    // Ensure the ignoreUndefined flag is passed down.
                    (output as Record<string, unknown>)[key] = mergeDeep(outputValue as Record<string, unknown>, sourceValue, ignoreUndefined);
                } else {
                    // If output's value (from target) is not a plain object (e.g., null, primitive, class instance, or key didn't exist in original target),
                    // overwrite with the source object.
                    (output as Record<string, unknown>)[key] = sourceValue;
                }
            } else if (isObject(sourceValue)) {
                // If source value is a class instance (not a plain object), use it directly to preserve prototype
                (output as Record<string, unknown>)[key] = sourceValue;
            } else {
                // If source value is a primitive, null, or undefined (and not ignored).
                (output as Record<string, unknown>)[key] = sourceValue;
            }
        }
    }

    return output as T & U;
}

export function getValueInPath(o: object | undefined, path: string): unknown {
    if (!o) return undefined;
    if (typeof o === "object") {
        if (path in o) {
            return (o as Record<string, unknown>)[path];
        }
        if (path.includes(".") || path.includes("[")) {
            let pathSegments = path.split(/[.[]/);
            if (path.includes("[")) {
                pathSegments = pathSegments.map(segment => segment.replace("]", ""));
            }
            const firstSegment = pathSegments[0];
            const isArrayAndIndexExists = Array.isArray((o as Record<string, unknown>)[firstSegment]) && !isNaN(parseInt(pathSegments[1]));
            const nextObject = isArrayAndIndexExists
                ? ((o as Record<string, unknown>)[firstSegment] as unknown[])[parseInt(pathSegments[1])]
                : (o as Record<string, unknown>)[firstSegment];

            const nextPath = pathSegments.slice(isArrayAndIndexExists ? 2 : 1).join(".");
            if (nextPath === "")
                return nextObject;
            return getValueInPath(nextObject as object | undefined, nextPath);
        }
    }
    return undefined;
}

export function removeInPath(o: object, path: string): object | undefined {
    let currentObject = { ...o };
    const parts = path.split(".");
    const last = parts.pop();
    for (const part of parts) {
        currentObject = (currentObject as Record<string, unknown>)[part] as Record<string, unknown>;
    }
    if (last)
        delete (currentObject as Record<string, unknown>)[last];
    return currentObject;
}

export function removeFunctions(o: unknown): unknown {
    if (o === undefined) return undefined;
    if (o === null) return null;
    if (typeof o === "object") {
        // Handle arrays first - map over them recursively
        if (Array.isArray(o)) {
            return o.map(v => removeFunctions(v));
        }
        // Preserve class instances (EntityReference, GeoPoint, etc.) - don't recurse into them
        if (!isPlainObject(o)) {
            return o;
        }
        return Object.entries(o)
            .filter(([_, value]) => typeof value !== "function")
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return { [key]: value.map(v => removeFunctions(v)) };
                } else if (typeof value === "object") {
                    return { [key]: removeFunctions(value) };
                } else return { [key]: value };
            })
            .reduce((a, b) => ({ ...a, ...b }), {});
    }
    return o;
}

export function getHashValue<T>(v: T): string | null {
    if (!v) return null;
    if (typeof v === "object" && v !== null) {
        if ("id" in v)
            return String((v as Record<string, unknown>).id);
        else if (v instanceof Date)
            return v.toLocaleString();
        else if (v instanceof GeoPoint)
            return hash(v as unknown as Record<string, unknown>);
    }
    return hash(v as object, { ignoreUnknown: true });
}

export function removeUndefined(value: unknown, removeEmptyStrings?: boolean): unknown {
    if (typeof value === "function") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v: unknown) => removeUndefined(v, removeEmptyStrings));
    }
    if (typeof value === "object") {
        if (value === null)
            return value;
        // Preserve class instances (EntityReference, GeoPoint, etc.) - don't recurse into them
        if (!isPlainObject(value)) {
            return value;
        }
        const res: Record<string, unknown> = {};
        Object.keys(value).forEach((key) => {
            if (!isEmptyObject(value as object)) {
                const childRes = removeUndefined((value as Record<string, unknown>)[key], removeEmptyStrings);
                const isString = typeof childRes === "string";
                const shouldKeepIfString = !removeEmptyStrings || (removeEmptyStrings && !isString) || (removeEmptyStrings && isString && childRes !== "");
                if (childRes !== undefined && !isEmptyObject(childRes as object) && shouldKeepIfString)
                    res[key] = childRes;
            }
        });
        return res;
    }
    return value;
}

export function removeNulls(value: unknown): unknown {
    if (typeof value === "function") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v: unknown) => removeNulls(v));
    }
    if (typeof value === "object") {
        if (value === null)
            return value;
        // Preserve class instances (EntityReference, GeoPoint, etc.) - don't recurse into them
        if (!isPlainObject(value)) {
            return value;
        }
        const res: Record<string, unknown> = {};
        const obj = value as Record<string, unknown>;
        Object.keys(obj).forEach((key) => {
            if (obj[key] !== null)
                res[key] = removeNulls(obj[key]);
        });
        return res;
    }
    return value;
}

export function isEmptyObject(obj: object) {
    return obj &&
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.keys(obj).length === 0
}

export function removePropsIfExisting(source: Record<string, unknown> | unknown[], comparison: Record<string, unknown> | unknown[]) {
    const isObject = (val: unknown): val is Record<string, unknown> => typeof val === "object" && val !== null;
    const isArray = (val: unknown): val is unknown[] => Array.isArray(val);

    if (!isObject(source) || !isObject(comparison)) {
        return source;
    }

    const res = isArray(source) ? [...source] : { ...source };

    if (isArray(res)) {
        for (let i = res.length - 1; i >= 0; i--) {
            if (res[i] === comparison[i]) {
                res.splice(i, 1);
            } else if (isObject(res[i]) && isObject(comparison[i])) {
                res[i] = removePropsIfExisting(res[i] as Record<string, unknown>, (comparison as unknown as unknown[])[i] as Record<string, unknown>);
            }
        }
    } else {
        Object.keys(comparison).forEach(key => {
            if (key in res) {
                if (isObject(res[key]) && isObject(comparison[key])) {
                    res[key] = removePropsIfExisting(res[key], comparison[key]);
                } else if (res[key] === comparison[key]) {
                    delete res[key];
                }
            }
        });
    }

    return res;
}
