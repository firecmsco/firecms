import { EntityCollection, EntityReference } from "../types";
import {
    decodeEntityId,
    getCollectionPathsCombinations,
    removeInitialAndTrailingSlashes,
    walkPathSegments
} from "./navigation_utils";

/**
 * References to every parent entity in a path.
 *
 * NOTE on encoding: `path` is expected ESCAPED, because it comes from the URL — the entity
 * ids in it are decoded on the way out. Pass `pathSegments` instead whenever the path at
 * hand is a raw datasource path (`entity.path`), which is not escaped and whose ids may
 * therefore contain a bare "/": splitting that would silently produce the wrong references.
 */
export function getParentReferencesFromPath(props: {
    path: string,
    collections: EntityCollection[] | undefined,
    currentFullPath?: string,
    currentPathSegments?: string[],
    /** `path` split at its real segment boundaries, with RAW ids. Takes precedence. */
    pathSegments?: string[],
}): EntityReference [] {

    const {
        path,
        collections = [],
        currentFullPath,
        currentPathSegments = [],
        pathSegments,
    } = props;

    if (pathSegments) {
        return getParentReferencesFromPathSegments(pathSegments, collections);
    }

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    const result: EntityReference[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];

        const collection: EntityCollection<any> | undefined = collections && collections.find((entry) => entry.id === subpathCombination || entry.path === subpathCombination);

        // If we find a collection, we add the reference and continue
        if (collection) {
            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + collection.path)
                : collection.path;
            // A collection's own path may span several segments, and those are
            // unambiguous, so they are spread rather than kept whole.
            const collectionSegments = [...currentPathSegments, ...collection.path.split("/")];

            const restOfThePath = removeInitialAndTrailingSlashes(removeInitialAndTrailingSlashes(path).replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                // `path` comes from the URL, so the id segment is escaped. References are
                // datasource-facing, so they carry the raw id.
                const entityId = decodeEntityId(nextSegments[0]);
                const fullPath = collectionPath + "/" + entityId;
                // The id is ONE segment however many slashes it contains.
                const entitySegments = [...collectionSegments, entityId];
                result.push(new EntityReference(entityId, collectionPath, undefined, collectionSegments));
                if (nextSegments.length > 1) {
                    const newPath = nextSegments.slice(1).join("/");
                    if (!collection) {
                        throw Error("collection not found resolving path: " + collection);
                    }
                    if (collection.subcollections) {
                        result.push(...getParentReferencesFromPath({
                            path: newPath,
                            collections: collection.subcollections,
                            currentFullPath: fullPath,
                            currentPathSegments: entitySegments
                        }));
                    }
                }
            }
            break;
        }

    }
    return result;
}

/**
 * The segment-wise counterpart: the boundaries are given, so an entity id keeps its
 * slashes and nothing has to be decoded.
 */
export function getParentReferencesFromPathSegments(pathSegments: string[],
                                                    collections: EntityCollection[]): EntityReference[] {
    return walkPathSegments(pathSegments, collections).steps
        .filter(step => step.entityId !== undefined)
        .map(step => new EntityReference(step.entityId!, step.collectionPath, undefined, step.collectionSegments));
}
