import hash from "object-hash";
import { GeoPoint } from "../types";

export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({
        ...res,
        [key]: obj[key]
    }), {})
});

export function isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep<T extends object>(target: T, source: any): T {
    const targetIsObject = isObject(target);
    const output: T = targetIsObject ? { ...target } : target;
    if (targetIsObject && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    (output as any)[key] = mergeDeep((target as any)[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

// export function getValueInPath(o: object | undefined, path: string): any {
//     if (!o) return undefined;
//     if (typeof o === "object") {
//         if (path in o) {
//             return (o as any)[path];
//         }
//         if (path.includes(".")) {
//             const pathSegments = path.split(".");
//             return getValueInPath((o as any)[pathSegments[0]], pathSegments.slice(1).join("."))
//         }
//     }
//     return undefined;
// }

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

export function isEmptyObject(obj: object) {
    return obj &&
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.keys(obj).length === 0
}

export function removePropsIfExisting(source: any, comparison: any) {
    const isObject = (val: any) => typeof val === 'object' && val !== null;
    const isArray = (val: any) => Array.isArray(val);

    if (!isObject(source) || !isObject(comparison)) {
        return source;
    }

    const res = isArray(source) ? [...source] : { ...source };

    Object.keys(comparison).forEach(key => {
        if (key in res) {
            if (isObject(res[key]) && isObject(comparison[key])) {
                res[key] = removePropsIfExisting(res[key], comparison[key]);
            } else {
                isArray(res) ? res.splice(key, 1) : delete res[key];
            }
        }
    });

    return res;
}
