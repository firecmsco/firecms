import hash from "object-hash";
import { GeoPoint } from "@firecms/types";

/** @private is the value an empty array? */
export const isEmptyArray = (value?: any) =>
    Array.isArray(value) && value.length === 0;

/** @private is the given object a Function? */
export const isFunction = (obj: any): obj is Function =>
    typeof obj === "function";

/** @private is the given object an integer? */
export const isInteger = (obj: any): boolean =>
    String(Math.floor(Number(obj))) === obj;

/** @private is the given object a NaN? */
// eslint-disable-next-line no-self-compare
export const isNaN = (obj: any): boolean => obj !== obj;

/**
 * Deeply get a value from an object via its path.
 */
export function getIn(
    obj: any,
    key: string | string[],
    def?: any,
    p = 0
) {
    const path = toPath(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }

    // check if path is not in the end
    if (p !== path.length && !obj) {
        return def;
    }

    return obj === undefined ? def : obj;
}

export function setIn(obj: any, path: string, value: any): any {
    const res: any = clone(obj); // this keeps inheritance when obj is a class
    let resVal: any = res;
    let i = 0;
    const pathArray = toPath(path);

    for (; i < pathArray.length - 1; i++) {
        const currentPath: string = pathArray[i];
        const currentObj: any = getIn(obj, pathArray.slice(0, i + 1));

        if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
            resVal = resVal[currentPath] = clone(currentObj);
        } else {
            const nextPath: string = pathArray[i + 1];
            resVal = resVal[currentPath] =
                isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
        }
    }

    // Return original object if new value is the same as current
    if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
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

    return res;
}

export function clone(value: any) {
    if (Array.isArray(value)) {
        return [...value];
    } else if (typeof value === "object" && value !== null) {
        return { ...value };
    } else {
        return value; // This is for primitive types which do not need cloning.
    }
}

function toPath(value: string | string[]) {
    if (Array.isArray(value)) return value; // Already in path array form.
    // Replace brackets with dots, remove leading/trailing dots, then split by dot.
    return value.replace(/\[(\d+)]/g, ".$1").replace(/^\./, "").replace(/\.$/, "").split(".");
}


export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({
        ...res,
        [key]: obj[key]
    }), {})
});

export function isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep<T extends Record<any, any>, U extends Record<any, any>>(
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
            const outputValue = (output as any)[key]; // Current value in our merged object (originating from target)

            // Skip if source value is undefined and ignoreUndefined is true.
            // This handles both not adding new undefined properties and not overwriting existing properties with undefined.
            if (ignoreUndefined && sourceValue === undefined) {
                continue;
            }

            if ((sourceValue as any) instanceof Date) {
                // If source value is a Date, create a new Date instance.
                (output as any)[key] = new Date(sourceValue.getTime());
            } else if (Array.isArray(sourceValue)) {
                // If source value is an array, create a shallow copy of the array.
                (output as any)[key] = [...sourceValue];
            } else if (isObject(sourceValue)) {
                // If source value is an object:
                if (isObject(outputValue)) {
                    // If the corresponding value in output (from target) is also an object, recurse.
                    // Ensure the ignoreUndefined flag is passed down.
                    (output as any)[key] = mergeDeep(outputValue, sourceValue, ignoreUndefined);
                } else {
                    // If output's value (from target) is not an object (e.g., null, primitive, or key didn't exist in original target),
                    // overwrite with the source object.
                    (output as any)[key] = sourceValue;
                }
            } else {
                // If source value is a primitive, null, or undefined (and not ignored).
                (output as any)[key] = sourceValue;
            }
        }
    }

    return output as T & U;
}


export function getValueInPath(o: object | undefined, path: string): any {
    if (!o) return undefined;
    if (typeof o === "object") {
        if (path in o) {
            return (o as any)[path];
        }
        if (path.includes(".") || path.includes("[")) {
            let pathSegments = path.split(/[.[]/);
            if (path.includes("[")) {
                pathSegments = pathSegments.map(segment => segment.replace("]", ""));
            }
            const firstSegment = pathSegments[0];
            const isArrayAndIndexExists = Array.isArray((o as any)[firstSegment]) && !isNaN(parseInt(pathSegments[1]));
            const nextObject = isArrayAndIndexExists
                ? (o as any)[firstSegment][parseInt(pathSegments[1])]
                : (o as any)[firstSegment];

            const nextPath = pathSegments.slice(isArrayAndIndexExists ? 2 : 1).join(".");
            if (nextPath === "")
                return nextObject;
            return getValueInPath(nextObject, nextPath)
        }
    }
    return undefined;
}

export function removeInPath(o: object, path: string): object | undefined {
    let currentObject = { ...o };
    const parts = path.split(".");
    const last = parts.pop();
    for (const part of parts) {
        currentObject = (currentObject as any)[part]
    }
    if (last)
        delete (currentObject as any)[last];
    return currentObject;
}

export function removeFunctions(o: object | undefined): any {
    if (o === undefined) return undefined;
    if (o === null) return null;
    if (typeof o === "object") {
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

export function getHashValue<T>(v: T) {
    if (!v) return null;
    if (typeof v === "object") {
        if ("id" in v)
            return (v as any).id;
        else if (v instanceof Date)
            return v.toLocaleString();
        else if (v instanceof GeoPoint)
            return hash(v as Record<string, unknown>);
    }
    return hash(v, { ignoreUnknown: true });
}

export function removeUndefined(value: any, removeEmptyStrings?: boolean): any {
    if (typeof value === "function") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v: any) => removeUndefined(v, removeEmptyStrings));
    }
    if (typeof value === "object") {
        const res: object = {};
        if (value === null)
            return value;
        Object.keys(value).forEach((key) => {
            if (!isEmptyObject(value)) {
                const childRes = removeUndefined(value[key], removeEmptyStrings);
                const isString = typeof childRes === "string";
                const shouldKeepIfString = !removeEmptyStrings || (removeEmptyStrings && !isString) || (removeEmptyStrings && isString && childRes !== "");
                if (childRes !== undefined && !isEmptyObject(childRes) && shouldKeepIfString)
                    (res as any)[key] = childRes;
            }
        });
        return res;
    }
    return value;
}

export function removeNulls(value: any): any {
    if (typeof value === "function") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v: any) => removeNulls(v));
    }
    if (typeof value === "object") {
        const res: object = {};
        if (value === null)
            return value;
        Object.keys(value).forEach((key) => {
            if (value[key] !== null)
                (res as any)[key] = removeNulls(value[key]);
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

export function removePropsIfExisting(source: any, comparison: any) {
    const isObject = (val: any) => typeof val === "object" && val !== null;
    const isArray = (val: any) => Array.isArray(val);

    if (!isObject(source) || !isObject(comparison)) {
        return source;
    }

    const res = isArray(source) ? [...source] : { ...source };

    if (isArray(res)) {
        for (let i = res.length - 1; i >= 0; i--) {
            if (res[i] === comparison[i]) {
                res.splice(i, 1);
            } else if (isObject(res[i]) && isObject(comparison[i])) {
                res[i] = removePropsIfExisting(res[i], comparison[i]);
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
