import { EntityCollection } from "../types";

export function unslugify(slug: string): string {
    if (slug.includes("-") || slug.includes("_") || !slug.includes(" ")) {
        const result = slug.replace(/[-_]/g, " ");
        return result.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        });
    } else {
        return slug;
        // const unCamelCased = slug.replace(/([a-z])([A-Z])/g, "$1 $2");
        // return unCamelCased.replace(/\b\w/g, function (l) {
        //     return l.toUpperCase()
        // });
    }
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

export function resolveCollectionPathIds(path: string, allCollections: EntityCollection[]): string {

    const cleanPath = removeInitialAndTrailingSlashes(path);
    const subpaths = cleanPath.split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`resolveCollectionPathAliases: Collection paths must have an odd number of segments: ${path}`);
    }

    const aliasedCollection = allCollections.find((col) => col.id === subpaths[0]);
    let resolvedAliased;
    if (aliasedCollection) {
        resolvedAliased = aliasedCollection.path;
    }

    if (subpaths.length > 1) {
        const segmentCollection = getCollectionByPathOrId(resolvedAliased ?? subpaths[0], allCollections);
        if (!segmentCollection?.subcollections) {
            return cleanPath;
        }
        const restOfThePath = cleanPath.split("/").slice(2).join("/");
        return (resolvedAliased ?? subpaths[0]) + "/" + subpaths[1] + "/" + resolveCollectionPathIds(restOfThePath, segmentCollection.subcollections);
    } else {
        return resolvedAliased ?? cleanPath;
    }
}

/**
 * Find the corresponding view at any depth for a given path.
 * Note that path or segments of the paths can be collection aliases.
 * @param pathOrAlias
 * @param collections
 */
export function getCollectionByPathOrId(pathOrAlias: string, collections: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(pathOrAlias).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`getCollectionByPathOrAlias: Collection paths must have an odd number of segments: ${pathOrAlias}`);
    }

    const subpathCombinations = getCollectionPathsCombinations(subpaths);
    let result: EntityCollection | undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collections && collections
            .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
            .find((entry) => entry.id === subpathCombination || entry.path === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === pathOrAlias) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = pathOrAlias.replace(subpathCombination, "").split("/").slice(2).join("/");
                if (newPath.length > 0)
                    result = getCollectionByPathOrId(newPath, navigationEntry.subcollections);
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
