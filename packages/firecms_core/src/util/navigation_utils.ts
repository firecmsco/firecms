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
    const cleanPath = removeInitialAndTrailingSlashes(path);
    const subpaths = cleanPath.split("/");

    if (subpaths.length % 2 === 0) {
        throw Error(`resolveCollectionPathIds: Collection paths must have an odd number of segments: ${path}`);
    }

    // Check if the path exactly matches a collection path
    const exactMatch = allCollections.find(col => col.path === cleanPath);
    if (exactMatch) {
        return exactMatch.path;
    }

    if (subpaths.length === 1) {
        // Find collection by ID and return its path
        const aliasedCollection = allCollections.find((col) => col.id === subpaths[0]);
        return aliasedCollection?.path ?? subpaths[0];
    }

    // Try to match a multi-segment collection path
    let matchingCollection: EntityCollection | undefined;
    let entityIndex = 1;

    // Check if the path starts with a multi-segment collection path
    for (const collection of allCollections) {
        const pathSegments = collection.path.split("/");
        if (pathSegments.length > 1 &&
            subpaths.slice(0, pathSegments.length).join("/") === collection.path) {
            matchingCollection = collection;
            entityIndex = pathSegments.length;
            break;
        }
    }

    // If no multi-segment match, fall back to single segment matching
    if (!matchingCollection) {
        const matchingCollections = allCollections.filter(col =>
            col.id === subpaths[0] || col.path === subpaths[0]
        );

        if (!matchingCollections.length) {
            return cleanPath;
        }

        matchingCollection = matchingCollections[0];
    }

    const entityId = subpaths[entityIndex];
    const remainingPath = subpaths.slice(entityIndex + 1);

    // If we have a subcollection ID, try to resolve it
    if (remainingPath.length > 0) {
        const subcollectionId = remainingPath[0];
        const subcollection = matchingCollection.subcollections?.find(
            subcol => subcol.id === subcollectionId
        );

        if (subcollection) {
            return `${matchingCollection.path}/${entityId}/${subcollection.path}`;
        }
    }

    // If there are no remaining path segments, just return the collection path with entity ID
    if (remainingPath.length === 0) {
        return `${matchingCollection.path}/${entityId}`;
    }

    // Default case - couldn't match subcollection
    return `${matchingCollection.path}/${entityId}/${remainingPath.join("/")}`;
}
/**
 * Find the corresponding view at any depth for a given path.
 * Note that path or segments of the paths can be collection aliases.
 * @param pathOrId
 * @param collections
 */
export function getCollectionByPathOrId(pathOrId: string, collections: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(pathOrId).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`getCollectionByPathOrId: Collection paths must have an odd number of segments: ${pathOrId}`);
    }

    const subpathCombinations = getCollectionPathsCombinations(subpaths);
    let result: EntityCollection | undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collections && collections
            .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
            .find((entry) => entry.id === subpathCombination || entry.path === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === pathOrId) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = pathOrId.replace(subpathCombination, "").split("/").slice(2).join("/");
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
                                     entityId?: string;
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
            path,
            copy,
            selectedTab,
            collection,
            updateUrl: true,
            onClose
        });

    } else {
        let to = navigation.buildUrlCollectionPath(entityId ? `${path}/${entityId}` : path);
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
