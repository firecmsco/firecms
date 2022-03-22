/**
 * Remove the entity ids from a given path
 * `products/B44RG6APH/locales` => `products/locales`
 * @param path
 */
export function stripCollectionPath(path: string): string {
    return path
        .split("/")
        .filter((e, i) => i % 2 === 0)
        .reduce((a, b) => `${a}/${b}`);
}
