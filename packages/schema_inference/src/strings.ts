import { ValuesCountEntry } from "./types";

/**
 * Parse a reference string value which can be in the format:
 * - Simple: "path/entityId"
 * - With database: "database_name:::path/entityId"
 * Returns the path and database (undefined if not specified or if "(default)")
 */
export function parseReferenceString(value: string): { path: string; database?: string } | null {
    if (!value) return null;

    let database: string | undefined = undefined;
    let fullPath = value;

    // Parse the new format: database_name:::path/entityId
    if (value.includes(":::")) {
        const [dbName, pathPart] = value.split(":::");
        if (dbName && dbName !== "(default)") {
            database = dbName;
        }
        fullPath = pathPart;
    }

    // Check if it looks like a path (contains at least one slash)
    if (!fullPath || !fullPath.includes("/")) {
        return null;
    }

    // Extract the collection path (everything before the last slash)
    const path = fullPath.substring(0, fullPath.lastIndexOf("/"));

    return { path, database };
}

/**
 * Check if a string value looks like a reference
 */
export function looksLikeReference(value: any): boolean {
    if (typeof value !== "string") return false;
    return parseReferenceString(value) !== null;
}

export function findCommonInitialStringInPath(valuesCount?: ValuesCountEntry) {

    if (!valuesCount) return undefined;

    function getPath(value: any): string | undefined {
        let pathString: string | undefined;

        if (typeof value === "string") {
            pathString = value;
        } else if (value.slug) {
            pathString = value.slug;
        } else {
            console.warn("findCommonInitialStringInPath: value is not a string or document with path", value);
            return undefined;
        }

        if (!pathString) return undefined;

        // Parse the new format: database_name:::path/entityId
        // Extract just the path portion for comparison
        if (pathString.includes(":::")) {
            const [, pathPart] = pathString.split(":::");
            pathString = pathPart;
        }

        return pathString;
    }

    const strings: string[] = valuesCount.values.map((v) => getPath(v)).filter(v => !!v) as string[];
    const pathWithSlash = strings.find((s) => s.includes("/"));
    if (!pathWithSlash)
        return undefined;

    const searchedPath = pathWithSlash.substr(0, pathWithSlash.lastIndexOf("/"));

    const yep = valuesCount.values
        .filter((value) => {
            const path = getPath(value);
            if (!path) return false;
            return path.startsWith(searchedPath)
        }).length > valuesCount.values.length / 3 * 2;

    return yep ? searchedPath : undefined;

}

export function removeInitialAndTrailingSlashes(s: string): string {
    return removeInitialSlash(removeTrailingSlash(s));
}

export function removeInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s.slice(1);
    else return s;
}

export function removeTrailingSlash(s: string) {
    if (s.endsWith("/"))
        return s.slice(0, -1);
    else return s;
}
