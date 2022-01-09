export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
});

export function isObject(item: any) {
    return (item && typeof item === "object" && !Array.isArray(item));
}

export function mergeDeep<T>(target: T, source: any): T {
    const output:T = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
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

export function getValueInPath(o: object | undefined, path: string): any {
    if (typeof o === "object") {
        if (path in o) {
            return (o as any)[path];
        }
        if (path.includes(".")) {
            const pathSegments = path.split(".");
            return getValueInPath((o as any)[pathSegments[0]], pathSegments.slice(1).join("."))
        }
    }
    return undefined;
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
