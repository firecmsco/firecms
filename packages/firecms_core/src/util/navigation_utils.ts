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
 * The outcome of walking a segment chain against a collection tree.
 * @group Hooks and utilities
 */
export type PathSegmentsWalkStep = {
    collection: EntityCollection;
    /** Resolved path of this collection, e.g. `"products/pid/locales"`. */
    collectionPath: string;
    /** `collectionPath` split at its real segment boundaries. */
    collectionSegments: string[];
    /** The entity addressed inside it, when the chain continues past the collection. */
    entityId?: string;
};

export type PathSegmentsWalk = {
    /** Segments with every collection id replaced by the collection's real `path`. */
    resolved: string[];
    /** The collection the chain ends in, if the whole chain matched. */
    collection?: EntityCollection;
    /** One entry per collection level traversed, outermost first. */
    steps: PathSegmentsWalkStep[];
    /** The first segment that could not be matched, if the walk stopped early. */
    unmatched?: string;
};

/**
 * Walk a segment chain against a collection tree, matching a collection by either its
 * `path` or its `id` and treating exactly one segment as each entity id.
 *
 * This is the primitive the string-based helpers cannot have: working on the flattened
 * path they must *guess* where an entity id ends by reading up to the next "/", which is
 * wrong for any id that contains one. Here the boundaries are given.
 *
 * Stops at the first segment it cannot match and reports it, rather than throwing.
 *
 * @group Hooks and utilities
 */
export function walkPathSegments(pathSegments: string[], allCollections: EntityCollection[]): PathSegmentsWalk {

    const resolved: string[] = [];
    const steps: PathSegmentsWalkStep[] = [];
    let currentCollections: EntityCollection[] | undefined = allCollections;
    let index = 0;

    while (index < pathSegments.length) {

        const remaining = pathSegments.slice(index);

        if (!currentCollections || currentCollections.length === 0) {
            resolved.push(...remaining);
            return {
                resolved,
                steps,
                unmatched: remaining[0]
            };
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
            resolved.push(...remaining);
            return {
                resolved,
                steps,
                unmatched: remaining[0]
            };
        }

        resolved.push(...removeInitialAndTrailingSlashes(match.collection.path).split("/"));
        index += match.length;

        const step: PathSegmentsWalkStep = {
            collection: match.collection,
            collectionPath: resolved.join("/"),
            collectionSegments: [...resolved]
        };
        steps.push(step);

        // The chain ends on a collection, which is the one being addressed.
        if (index >= pathSegments.length) {
            return {
                resolved,
                steps,
                collection: match.collection
            };
        }

        // Exactly one segment is the entity id, however many slashes it contains.
        step.entityId = pathSegments[index];
        resolved.push(pathSegments[index]);
        index += 1;

        // The chain ends on an entity, which lives in the collection just matched.
        if (index >= pathSegments.length) {
            return {
                resolved,
                steps,
                collection: match.collection
            };
        }

        currentCollections = match.collection.subcollections;
    }

    return { resolved, steps };
}

/**
 * Resolve collection aliases in a segment array: every collection id is replaced by the
 * collection's real `path`, and every entity id is carried through untouched.
 *
 * The segment-wise counterpart of {@link resolveCollectionPathIds}, and the reason it
 * exists: that one works on the flattened string, so an entity id containing "/" shifts
 * the rest of the chain by a segment and resolution fails with
 * "Collection definition not found for segment starting with …".
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
    const walk = walkPathSegments(pathSegments, allCollections);
    if (walk.unmatched !== undefined) {
        console.warn(`resolveCollectionPathSegments: Collection definition not found for segment "${walk.unmatched}" in [${pathSegments.join(", ")}]. Carrying the remaining segments through unresolved.`);
    }
    return walk.resolved;
}

/**
 * Find the collection a segment chain addresses, whether it ends on the collection itself
 * or on one of its entities.
 *
 * The segment-wise counterpart of {@link getCollectionByPathOrId}, which asserts an odd
 * number of "/"-separated parts — an assertion a slash-bearing entity id fails, throwing
 * where it should simply have resolved.
 *
 * @group Hooks and utilities
 */
export function getCollectionByPathSegments(pathSegments: string[], collections: EntityCollection[]): EntityCollection | undefined {
    return walkPathSegments(pathSegments, collections).collection;
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
export function getCollectionByPathOrId(pathOrId: string, collections: EntityCollection[], pathSegments?: string[]): EntityCollection | undefined {

    // Given the real boundaries there is nothing to parse, and no parity to assert: a chain
    // whose entity id contains "/" splits into an even number of parts below and would be
    // rejected outright, even though it is perfectly valid.
    if (pathSegments) {
        return getCollectionByPathSegments(pathSegments, collections);
    }

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
