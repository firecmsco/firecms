export function flattenObject(obj: Record<string, unknown>, parentKey = "") {
    if (!obj) return obj;
    return Object.keys(obj).reduce((flatObj, key) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item: unknown, index: number) => {
                    Object.assign(flatObj, flattenObject(item as Record<string, unknown>, `${newKey}[${index}]`));
                });
            } else {
                Object.assign(flatObj, flattenObject(obj[key] as Record<string, unknown>, newKey));
            }
        } else {
            flatObj[newKey] = obj[key];
        }

        return flatObj;
    }, {} as { [key: string]: unknown });
}


// map from nested property key like "a.b.c" to the maximum array count found in a list of objects for that array
export type ArrayValuesCount = Record<string, number>;

export function getArrayValuesCount(array: Record<string, unknown>[]): ArrayValuesCount {
    return array.reduce((acc: ArrayValuesCount, obj: Record<string, unknown>) => {
        Object.entries(obj).forEach(([key, value]) => {
            // proceed only if value is an array
            if (Array.isArray(value)) {
                acc[key] = Math.max(acc[key] || 0, value.length);
            }

            // handle nested object
            if (typeof value === "object" && value !== null) {
                const nested = getArrayValuesCount([value as Record<string, unknown>]);
                Object.entries(nested).forEach(([nestedKey, nestedCount]) => {
                    const compoundKey = `${key}.${nestedKey}`;
                    acc[compoundKey] = Math.max(acc[compoundKey] || 0, nestedCount);
                });
            }
        });
        return acc;
    }, {});
}
