import { EntityCollection, NavigationController, SideEntityController } from "../types";

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
    let remainingPath = removeInitialAndTrailingSlashes(path);
    if (!remainingPath) {
        return "";
    }

    let currentCollections: EntityCollection[] | undefined = allCollections;
    const resolvedPathParts: string[] = [];

    while (remainingPath.length > 0) {
        if (!currentCollections || currentCollections.length === 0) {
            // We have remaining path segments but no more collections to match against
            console.warn(`resolveCollectionPathIds: Path structure implies subcollections, but none found before segment starting with "${remainingPath}" in original path "${path}". Appending remaining original path.`);
            resolvedPathParts.push(remainingPath);
            remainingPath = ""; // Stop processing
            break;
        }

        let foundMatch = false;
        // Sort potential matches by length descending to prioritize longer matches (e.g., "a/b" over "a")
        const potentialMatches: { col: EntityCollection; match: string; }[] = currentCollections
            .flatMap(col => [{
                col,
                match: col.slug
            }])
            .filter(p => p.match && remainingPath.startsWith(p.match))
            .sort((a, b) => b.match.length - a.match.length);

        if (potentialMatches.length > 0) {
            const {
                col: foundCollection,
                match: matchString
            } = potentialMatches[0];

            resolvedPathParts.push(foundCollection.dbPath); // Use the defined path
            remainingPath = removeInitialSlash(remainingPath.substring(matchString.length));

            // Check if we are at the end of the path
            if (remainingPath.length === 0) {
                foundMatch = true;
                break; // Path ends with a collection segment
            }

            // The next segment must be an entity ID
            const idSeparatorIndex = remainingPath.indexOf("/");
            let entityId: string | number;
            if (idSeparatorIndex > -1) {
                entityId = remainingPath.substring(0, idSeparatorIndex);
                remainingPath = remainingPath.substring(idSeparatorIndex + 1);
            } else {
                // This should not happen if the original path is valid (odd segments)
                // but handle it defensively: assume the rest is the ID
                entityId = remainingPath;
                remainingPath = "";
                console.warn(`resolveCollectionPathIds: Path seems to end with an entity ID "${entityId}" instead of a collection segment in original path "${path}". This might indicate an invalid input path.`);
                // Even if it ends here, we still need to push the ID
            }

            resolvedPathParts.push(entityId); // Append entity ID
            currentCollections = foundCollection.subcollections; // Move to subcollections
            foundMatch = true;

            if (!currentCollections && remainingPath.length > 0) {
                // Warn if the path continues but no subcollections were defined
                console.warn(`resolveCollectionPathIds: Path continues after entity ID "${entityId}", but no subcollections are defined for the preceding collection "${foundCollection.slug}" in path "${path}". Appending remaining original path.`);
                resolvedPathParts.push(remainingPath); // Append the rest
                remainingPath = ""; // Stop processing
                break;
            }

        }

        if (!foundMatch) {
            // Collection definition not found for the start of the remaining path
            console.warn(`resolveCollectionPathIds: Collection definition not found for segment starting with "${remainingPath}" in original path "${path}". Appending remaining original path.`);
            resolvedPathParts.push(remainingPath); // Append the rest
            remainingPath = ""; // Stop processing
            break;
        }
    }

    return resolvedPathParts.join("/");
}

/**
 * Find the corresponding view at any depth for a given path.
 * Note that path or segments of the paths can be collection aliases.
 * @param pathOrId
 * @param collections
 */
export function getCollectionBySlugWithin(pathOrId: string, collections: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(pathOrId).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`getCollectionBySlug: Collection paths must have an odd number of segments: ${pathOrId}`);
    }

    const subpathCombinations = getCollectionPathsCombinations(subpaths);
    let result: EntityCollection | undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collections && collections
            .sort((a, b) => (a.slug ?? "").localeCompare(b.slug ?? ""))
            .find((entry) => entry.slug === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === pathOrId) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = pathOrId.replace(subpathCombination, "").split("/").slice(2).join("/");
                if (newPath.length > 0)
                    result = getCollectionBySlugWithin(newPath, navigationEntry.subcollections);
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

export function navigateToEntity({
                                     openEntityMode,
                                     collection,
                                     entityId,
                                     copy,
                                     path,
                                     selectedTab,
                                     sideEntityController,
                                     onClose,
                                     navigation
                                 }:

                                 {
                                     openEntityMode: "side_panel" | "full_screen";
                                     collection?: EntityCollection;
                                     entityId?: string | number;
                                     selectedTab?: string;
                                     copy?: boolean;
                                     path: string;
                                     sideEntityController: SideEntityController;
                                     onClose?: () => void;
                                     navigation: NavigationController
                                 }) {

    if (openEntityMode === "side_panel") {

        sideEntityController.open({
            entityId,
            path: path,
            copy,
            selectedTab,
            collection,
            updateUrl: true,
            onClose
        });

    } else {
        let to = navigation.buildUrlCollectionPath(entityId ? `${path ?? path}/${entityId}` : path ?? path);
        if (entityId && selectedTab) {
            to += `/${selectedTab}`;
        }
        if (!entityId) {
            to += "#new";
        }
        if (copy) {
            to += "#copy";
        }
        navigation.navigate(to);
    }

}
