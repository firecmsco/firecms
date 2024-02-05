export function flatMapEntityValues<M extends object>(values: M, path = ""): object {
    if (!values) return {};
    return Object.entries(values).flatMap(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "object") {
            return flatMapEntityValues(value, currentPath);
        } else {
            return { [currentPath]: value };
        }
    }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
}
