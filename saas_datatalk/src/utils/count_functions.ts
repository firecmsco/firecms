export function countFunctionsInObject(obj: any, path = ""): {count: number, paths: string[]} {
    let count = 0;
    let paths: string[] = [];

    // Check if it's an object, and if so iterate over its keys
    if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
            const newPath = path ? `${path}.${key}` : key;
            const result = countFunctionsInObject(obj[key], newPath);
            count += result.count;
            paths = [...paths, ...result.paths];
        }
    }

    // If it's a function, then increment the count and add the path to the list
    if (typeof obj === "function") {
        count++;
        paths.push(path);
    }

    return { count, paths };
}
