import { EnumValueConfig, EnumValues } from "@firecms/types";

export function extractEnumFromValues(values: unknown[]) {
    if (!Array.isArray(values)) {
        return [];
    }
    const enumValues = values
        .map((value) => {
            if (typeof value === "string") {
                return ({ id: value, label: unslugify(value) });
            } else
                return null;
        }).filter(Boolean) as Array<{ id: string, label: string }>;
    enumValues.sort((a, b) => a.label.localeCompare(b.label));
    return enumValues;
}

export function unslugify(slug?: string): string {
    if (!slug) return "";
    if (slug.includes("-") || slug.includes("_") || !slug.includes(" ")) {
        const result = slug.replace(/[-_]/g, " ");
        return result.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        }).trim();
    } else {
        return slug.trim();
    }
}

export function resolveEnumValues(input: EnumValues): EnumValueConfig[] | undefined {
    if (typeof input === "object") {
        return Object.entries(input).map(([id, value]) =>
            (typeof value === "string"
                ? {
                    id,
                    label: value
                }
                : value));
    } else if (Array.isArray(input)) {
        return input as EnumValueConfig[];
    } else {
        return undefined;
    }
}

export function mergeDeep<T extends Record<any, any>, U extends Record<any, any>>(target: T, source: U, ignoreUndefined: boolean = false): T & U {
    const targetIsObject = isObject(target);
    const output = targetIsObject ? { ...target } : target;
    if (targetIsObject && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceElement = source[key];
            // Skip undefined values when ignoreUndefined is true
            if (ignoreUndefined && sourceElement === undefined) {
                return;
            }
            if (sourceElement instanceof Date) {
                // Assign a new Date instance with the same time value
                Object.assign(output, { [key]: new Date(sourceElement.getTime()) });
            } else if (isObject(sourceElement)) {
                if (!(key in target))
                    Object.assign(output, { [key]: sourceElement });
                else
                    (output as any)[key] = mergeDeep((target as any)[key], sourceElement);
            } else {
                Object.assign(output, { [key]: sourceElement });
            }
        });
    }
    return output as T;
}

export function isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
}


