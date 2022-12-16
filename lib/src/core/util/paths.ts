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
 * @param path
 */
export function fullPathToCollectionSegments(path: string): string[] {
    return path
        .split("/")
        .filter((e, i) => i % 2 === 0);
}
