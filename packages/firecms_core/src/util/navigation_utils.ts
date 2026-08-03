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

/**
 * Characters that would otherwise be read as structure once an entity id is joined into a
 * path: "/" separates segments, "?" and "#" start the query and hash in a URL, and "%"
 * has to be escaped first so that no escape sequence we introduce can be misread as one
 * that was already part of the id.
 *
 * Entity ids are escaped ONLY inside URL-facing strings — anything handed to
 * `buildUrlCollectionPath` or `navigate`. Every other path string (the `path` field of a
 * navigation entry, datasource paths, `EntityReference.path`) carries raw ids.
 *
 * @group Hooks and utilities
 */
export function encodeEntityId(entityId: string): string {
    return entityId
        .replaceAll("%", "%25")
        .replaceAll("/", "%2F")
        .replaceAll("#", "%23")
        .replaceAll("?", "%3F");
}

/**
 * Inverse of {@link encodeEntityId}. "%25" is undone last, mirroring the encoder, so an id
 * that legitimately contains the text "%2F" survives the round trip.
 *
 * @group Hooks and utilities
 */
export function decodeEntityId(encodedEntityId: string): string {
    return encodedEntityId
        .replaceAll("%2F", "/")
        .replaceAll("%23", "#")
        .replaceAll("%3F", "?")
        .replaceAll("%25", "%");
}

/**
 * Segments of a subcollection sitting under the entity `entityId` of `parentPathSegments`.
 *
 * The parent entity id is kept whole however many slashes it contains, while the
 * subcollection's own configured path is spread — a collection path never contains an
 * entity id, so splitting that one is unambiguous.
 *
 * So `["test"] + "test/test" + "accommodation"` yields three segments,
 * `["test", "test/test", "accommodation"]`, where splitting the flattened path
 * `"test/test/test/accommodation"` would wrongly yield four.
 *
 * Returns undefined when the parent segments are unknown: the parent chain cannot be
 * recovered from a flattened path, so there is nothing honest to build on.
 *
 * @group Hooks and utilities
 */
export function buildSubcollectionPathSegments(parentPathSegments: string[] | undefined,
                                               entityId: string | undefined,
                                               subcollectionPath: string): string[] | undefined {
    if (!parentPathSegments || !entityId) return undefined;
    const ownSegments = removeInitialAndTrailingSlashes(subcollectionPath).split("/");
    return [...parentPathSegments, entityId, ...ownSegments];
}

export function getLastSegment(path: string) {
    const cleanPath = removeInitialAndTrailingSlashes(path);
    if (cleanPath.includes("/")) {
        const segments = cleanPath.split("/");
        return segments[segments.length - 1];
    }
    return cleanPath;
}

/**
 * Resolve collection aliases in a segment array: every collection id is replaced by the
 * collection's real `path`, and every entity id is carried through untouched.
 *
 * This is the segment-wise counterpart of {@link resolveCollectionPathIds}, and the reason
 * it exists: that one works on the flattened string, so it has to *guess* where an entity
 * id ends — it reads up to the next "/". For an id containing "/" the guess is wrong, the
 * rest of the chain shifts by a segment, and resolution fails with
 * "Collection definition not found for segment starting with …". Here the boundaries are
 * given rather than guessed, so an id keeps its slashes.
 *
 * Matching accepts either a collection's `path` or its `id`, so already-resolved segments
 * pass through unchanged — the function is idempotent.
 *
 * Mirrors the string version when a chain cannot be matched: it warns and carries the
 * remainder through unresolved, rather than throwing.
 *
 * @group Hooks and utilities
 */
export function resolveCollectionPathSegments(pathSegments: string[], allCollections: EntityCollection[]): string[] {

    const resolved: string[] = [];
    let currentCollections: EntityCollection[] | undefined = allCollections;
    let index = 0;

    while (index < pathSegments.length) {

        const remaining = pathSegments.slice(index);

        if (!currentCollections || currentCollections.length === 0) {
            console.warn(`resolveCollectionPathSegments: Path structure implies subcollections, but none found before segment "${remaining[0]}" in [${pathSegments.join(", ")}]. Carrying the remaining segments through unresolved.`);
            resolved.push(...remaining);
            return resolved;
        }

        // A collection's own `path` may span several segments ("users/uid/experiences"), so
        // candidates are matched segment by segment and the longest match wins.
        let match: { collection: EntityCollection, length: number } | undefined;
        for (const collection of currentCollections) {
            for (const candidate of [collection.path, collection.id]) {
                if (!candidate) continue;
                const parts = removeInitialAndTrailingSlashes(candidate).split("/");
                if (parts.length > remaining.length) continue;
                if (parts.some((part, i) => part !== remaining[i])) continue;
                if (!match || parts.length > match.length) match = { collection, length: parts.length };
            }
        }

        if (!match) {
            console.warn(`resolveCollectionPathSegments: Collection definition not found for segment "${remaining[0]}" in [${pathSegments.join(", ")}]. Carrying the remaining segments through unresolved.`);
            resolved.push(...remaining);
            return resolved;
        }

        resolved.push(...removeInitialAndTrailingSlashes(match.collection.path).split("/"));
        index += match.length;

        if (index >= pathSegments.length) return resolved;

        // Exactly one segment is the entity id, however many slashes it contains.
        resolved.push(pathSegments[index]);
        index += 1;
        currentCollections = match.collection.subcollections;
    }

    return resolved;
}

export function resolveCollectionPathIds(path: string, allCollections: EntityCollection[], pathSegments?: string[]): string {

    // When the caller knows the real segment boundaries there is nothing to parse: the
    // ambiguity the string walk below has to guess its way through simply is not present.
    if (pathSegments) {
        return resolveCollectionPathSegments(pathSegments, allCollections).join("/");
    }

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
                match: col.path
            }, {
                col,
                match: col.id
            }])
            .filter(p => p.match && remainingPath.startsWith(p.match))
            .sort((a, b) => b.match.length - a.match.length);

        if (potentialMatches.length > 0) {
            const {
                col: foundCollection,
                match: matchString
            } = potentialMatches[0];

            resolvedPathParts.push(foundCollection.path); // Use the defined path
            remainingPath = removeInitialSlash(remainingPath.substring(matchString.length));

            // Check if we are at the end of the path
            if (remainingPath.length === 0) {
                foundMatch = true;
                break; // Path ends with a collection segment
            }

            // The next segment must be an entity ID
            const idSeparatorIndex = remainingPath.indexOf("/");
            let entityId: string;
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
                console.warn(`resolveCollectionPathIds: Path continues after entity ID "${entityId}", but no subcollections are defined for the preceding collection "${foundCollection.path}" in path "${path}". Appending remaining original path.`);
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
    const entries = subpaths.length > 0 && subpaths.length % 2 === 0 ? subpaths.slice(0, subpaths.length - 1) : subpaths;

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
                                     fullIdPath,
                                     pathSegments,
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
                                     fullIdPath?: string;
                                     /** `path` split at its real segment boundaries. */
                                     pathSegments?: string[];
                                     sideEntityController: SideEntityController;
                                     onClose?: () => void;
                                     navigation: NavigationController
                                 }) {

    if (openEntityMode === "side_panel") {

        sideEntityController.open({
            entityId,
            path,
            fullIdPath,
            pathSegments,
            copy,
            selectedTab,
            collection,
            updateUrl: true,
            onClose
        });

    } else {
        let to = navigation.buildUrlCollectionPath(entityId ? `${fullIdPath ?? path}/${encodeEntityId(entityId)}` : fullIdPath ?? path);
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
