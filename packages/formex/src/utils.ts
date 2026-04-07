/** @private is the value an empty array? */
export const isEmptyArray = (value?: unknown) =>
    Array.isArray(value) && value.length === 0;

/** @private is the given object a Function? */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (obj: unknown): obj is Function =>
    typeof obj === "function";

/** @private is the given object an Object? */
export const isObject = (obj: unknown): obj is Record<string, unknown> =>
    obj !== null && typeof obj === "object";

/** @private is the given object an integer? */
export const isInteger = (obj: unknown): boolean =>
    String(Math.floor(Number(obj))) === obj;

/** @private is the given object a NaN? */
// eslint-disable-next-line no-self-compare
export const isNaN = (obj: unknown): boolean => obj !== obj;

/**
 * Deeply get a value from an object via its path.
 */
export function getIn(
    obj: any,
    key: string | string[],
    def?: unknown,
    p = 0
): any {
    const path = toPath(key);
    let current: unknown = obj;
    while (current && p < path.length) {
        current = (current as Record<string, unknown>)[path[p++]];
    }

    // check if path is not in the end
    if (p !== path.length && !current) {
        return def;
    }

    return current === undefined ? def : current;
}

export function setIn(obj: any, path: string, value: unknown): any {
    const res = clone(obj) as Record<string, unknown>; // this keeps inheritance when obj is a class
    let resVal: Record<string, unknown> = res;
    let i = 0;
    const pathArray = toPath(path);

    for (; i < pathArray.length - 1; i++) {
        const currentPath: string = pathArray[i];
        const currentObj = getIn(obj, pathArray.slice(0, i + 1));

        if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
            resVal = resVal[currentPath] = clone(currentObj) as Record<string, unknown>;
        } else {
            const nextPath: string = pathArray[i + 1];
            resVal = resVal[currentPath] =
                (isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {}) as Record<string, unknown>;
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

export function clone(value: unknown): unknown {
    if (Array.isArray(value)) {
        return [...value];
    } else if (typeof value === "object" && value !== null) {
        // Preserve class instances (EntityReference, GeoPoint, etc.) - don't spread them
        if (Object.getPrototypeOf(value) !== Object.prototype) {
            return value;
        }
        return { ...(value as Record<string, unknown>) };
    } else {
        return value; // This is for primitive types which do not need cloning.
    }
}

function toPath(value: string | string[]) {
    if (Array.isArray(value)) return value; // Already in path array form.
    // Replace brackets with dots, remove leading/trailing dots, then split by dot.
    return value.replace(/\[(\d+)]/g, ".$1").replace(/^\./, "").replace(/\.$/, "").split(".");
}
