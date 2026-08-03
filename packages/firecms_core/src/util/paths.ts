export const COLLECTION_PATH_SEPARATOR = "::";

/**
 * Remove the entity ids from a given path
 * `products/B44RG6APH/locales` => `products::locales`
 * @param path
 */
export function stripCollectionPath(path: string): string {
    return segmentsToStrippedPath(fullPathToCollectionSegments(path));
}

export function segmentsToStrippedPath(paths: string[]) {
    if (paths.length === 1)
        return paths[0];
    return paths.reduce((a, b) => `${a}${COLLECTION_PATH_SEPARATOR}${b}`);
}

/**
 * Extract the collection path routes
 * `products/B44RG6APH/locales` => [`products`, `locales`]
 *
 * Finds the entity ids by position, which only works while no id contains "/" — with one,
 * every following segment shifts and the wrong elements are kept. Use
 * {@link collectionSegmentsFrom} when the real boundaries are known.
 *
 * @param path
 */
export function fullPathToCollectionSegments(path: string): string[] {
    return positionalCollectionSegments(path);
}

/**
 * The collection chain of an already-segmented path:
 * `['products', 'B44RG6APH', 'locales']` => [`products`, `locales`]
 *
 * The counterpart of {@link fullPathToCollectionSegments} for callers that know the real
 * segment boundaries. Kept as a separate function rather than an extra parameter on that
 * one: these helpers are small enough to be passed point-free, and `paths.map(fn)` would
 * then hand the array index in as the new argument.
 */
export function collectionSegmentsFrom(pathSegments: string[]): string[] {
    return keepCollectionPositions(pathSegments);
}

/**
 * The historical, positional reading of a flattened path:
 * `products/B44RG6APH/locales` => [`products`, `locales`]
 *
 * This produces a **collection chain**, not a datasource `pathSegments` value, and must
 * never be used as one — see `path_segments_no_fabrication.test.ts`. It is only correct
 * while no entity id contains "/", which is why every caller prefers real segments when
 * they are available, and why it is named for what it assumes.
 *
 * It is still the right reading for a path that came from a URL, where entity ids arrive
 * escaped and so cannot contain a bare "/".
 */
export function positionalCollectionSegments(path: string): string[] {
    return keepCollectionPositions(path.split("/"));
}

/** Keep the even positions of an alternating collection/entity-id chain. */
function keepCollectionPositions(segments: string[]): string[] {
    return segments.filter((e, i) => i % 2 === 0);
}
