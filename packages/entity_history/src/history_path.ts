import { buildSubcollectionPathSegments, encodeEntityId } from "@firecms/core";

export const HISTORY_COLLECTION_NAME = "__history";

/**
 * Build the path of the `__history` subcollection for an entity.
 *
 * The entity id is escaped. History is stored as a subcollection *under the entity*, so
 * the id becomes a path segment — and an id containing "/" would otherwise silently point
 * at a different location, or be rejected outright by backends that require an alternating
 * collection/document path (Firestore flips to an even segment count and throws).
 *
 * `encodeEntityId` is the identity function for any id without "/", "?", "#" or "%", so
 * this does not move the history of existing entities.
 *
 * Both the write side (the save callback) and the read sides (the history view and the
 * last-edited indicator) must use this helper — if they build the path independently they
 * will eventually disagree and history silently stops loading.
 */
export function buildEntityHistoryPath(path: string, entityId: string): string {
    return `${path}/${encodeEntityId(entityId)}/${HISTORY_COLLECTION_NAME}`;
}

/**
 * The segment-wise counterpart of {@link buildEntityHistoryPath}, for datasources whose
 * entity ids may contain "/".
 *
 * History is an ordinary subcollection of the entity, so the parent id is one segment kept
 * whole — unlike in the flattened path above, where it has to be escaped to survive.
 *
 * Returns undefined when the parent segments are unknown, rather than splitting the path:
 * a guess would be wrong in exactly the case this exists for.
 */
export function buildEntityHistoryPathSegments(pathSegments: string[] | undefined,
                                               entityId: string): string[] | undefined {
    return buildSubcollectionPathSegments(pathSegments, entityId, HISTORY_COLLECTION_NAME);
}
