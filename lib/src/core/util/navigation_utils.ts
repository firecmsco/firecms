import { EntityCollection } from "../../models";

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

export function addInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s;
    else return `/${s}`;
}

export function getLastSegment(path: string) {
    const cleanPath = removeInitialAndTrailingSlashes(path);
    if (cleanPath.includes("/")) {
        const segments = cleanPath.split("/");
        return segments[segments.length - 1];
    }
    return cleanPath;
}

export function resolveCollectionAliases(path: string, collections: EntityCollection[]): string {
    const cleanPath = removeInitialAndTrailingSlashes(path);
    const subpaths = cleanPath.split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }

    let resolvedSegment = subpaths[0];
    const aliasedCollection = collections.find((col) => col.alias === subpaths[0]);
    if (aliasedCollection) {
        resolvedSegment = aliasedCollection.path as string;
    }

    if (subpaths.length > 1) {
        const segmentCollection = getCollectionByPath(resolvedSegment, collections);
        const restOfThePath = cleanPath.split("/").slice(2).join("/");
        if (!segmentCollection?.subcollections) {
            throw Error("Unable to resolve collection aliases for " + path);
        }
        return resolvedSegment + "/" + subpaths[1] + "/" + resolveCollectionAliases(restOfThePath, segmentCollection.subcollections);
    } else {
        return resolvedSegment;
    }
}

/**
 * Find the corresponding view at any depth for a given path.
 * Note that path or segments of the paths can be collection aliases.
 * @param path
 * @param collections
 */
export function getCollectionByPath<M extends { [Key: string]: any }>(path: string, collections: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }

    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    let result: EntityCollection | undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collections && collections
            .sort((a, b) => (a.alias ?? "").localeCompare(b.alias ?? ""))
            .find((entry) => entry.alias === subpathCombination || entry.path === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === path) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = path.replace(subpathCombination, "").split("/").slice(2).join("/");
                if (newPath.length > 0)
                    result = getCollectionByPath(newPath, navigationEntry.subcollections);
            }
        }
        if (result) break;
    }
    return result;
}

/**
 * Get the subcollection combinations from a path:
 * "sites/es/locales" => ["sites/es/locales", "sites"]
 * @param subpaths
 */
export function getCollectionPathsCombinations(subpaths: string[]): string[] {
    const entries = subpaths.length > 0 && subpaths.length % 2 === 0 ? subpaths.splice(0, subpaths.length - 1) : subpaths;

    const length = entries.length;
    const result: string[] = [];
    for (let i = length; i > 0; i = i - 2) {
        result.push(entries.slice(0, i).join("/"));
    }
    return result;

}
