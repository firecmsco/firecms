export function flattenObject(obj: any, parentKey = "") {
    if (!obj) return obj;
    return Object.keys(obj).reduce((flatObj, key) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item: any, index: number) => {
                    Object.assign(flatObj, flattenObject(item, `${newKey}[${index}]`));
                });
            } else {
                Object.assign(flatObj, flattenObject(obj[key], newKey));
            }
        } else {
            flatObj[newKey] = obj[key];
        }

        return flatObj;
    }, {} as { [key: string]: any });
}

// map from nested property key like "a.b.c" to the maximum array count found in a list of objects for that array
export type ArrayValuesCount = Record<string, number>;

export function getArrayValuesCount(array: any[]): ArrayValuesCount {
    return array.reduce((acc: ArrayValuesCount, obj: any) => {
        Object.entries(obj).forEach(([key, value]) => {
            // proceed only if value is an array
            if (Array.isArray(value)) {
                acc[key] = Math.max(acc[key] || 0, value.length);
            }

            // handle nested object
            if (typeof value === "object" && value !== null) {
                const nested = getArrayValuesCount([value]);
                Object.entries(nested).forEach(([nestedKey, nestedCount]) => {
                    const compoundKey = `${key}.${nestedKey}`;
                    acc[compoundKey] = Math.max(acc[compoundKey] || 0, nestedCount);
                });
            }
        });
        return acc;
    }, {});
}
