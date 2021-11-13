export const pick: <T>(obj: T, ...args: any[]) => T = (obj: any, ...args: any[]) => ({
    ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
});

export function isObject(item:any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep<T>(target:T, source:any):T {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
