import hash from "object-hash";
import { GeoPoint } from "../../models";

export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
});

export function isObject(item: any) {
    return (item && typeof item === "object" && !Array.isArray(item));
}

export function mergeDeep<T extends {}>(target: T, source: any): T {
    const targetIsObject = isObject(target);
    const output:T = targetIsObject ? Object.assign({}, target) : target;
    if (targetIsObject && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    (output )[key] = mergeDeep((target )[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

export function getValueInPath(o: object | undefined, path: string): any {
    if (typeof o === "object") {
        if (path in o) {
            return (o )[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            return getValueInPath((o )[pathSegments[0]], pathSegments.slice(1).join("."))
        }
    }
    return undefined;
}

export function removeInPath(o: object, path: string): object | undefined {
    let currentObject = { ...o };
    const parts = path.split(".");
    const last = parts.pop();
    for (const part of parts) {
        currentObject = currentObject[part]
    }
    if (last)
        delete currentObject[last];
    return currentObject;
}

export function removeFunctions(o: object | undefined): any {
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
            return hash(v);
    }
    return hash(v, { ignoreUnknown: true });
}

export function removeUndefined(obj: object) {
    const res: object = {};
    Object.keys(obj).forEach((key) => {
        if (!isEmptyObject(obj)) {
            if (obj[key] === Object(obj[key])) {
                const childRes = removeUndefined(obj[key]);
                if (!isEmptyObject(childRes))
                    res[key] = childRes;
            } else if (obj[key] !== undefined) {
                res[key] = obj[key];
            }
        }
    });
    return res;
}

export function isEmptyObject(obj: object) {
    return obj &&
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.keys(obj).length === 0
}
