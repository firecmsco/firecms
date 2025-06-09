/** @private is the value an empty array? */
export const isEmptyArray = (value?: any) =>
    Array.isArray(value) && value.length === 0;

/** @private is the given object a Function? */
export const isFunction = (obj: any): obj is Function =>
    typeof obj === "function";

/** @private is the given object an Object? */
export const isObject = (obj: any): obj is Object =>
    obj !== null && typeof obj === "object";

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
