// This file uses Vite's glob import to dynamically discover all schema files
// in the collections directory at build time. This ensures no manual array mapping is needed.

// @ts-ignore: Vite specific macro for frontend building
const collectionModules = import.meta.glob('./collections/*.ts', { eager: true });

// Extract the default exports from each Module object returned by Vite using a proper type cast
export const collections = Object.values(collectionModules).map((module: any) => module.default);

// Keep the export exactly as `test_collections` so the rest of the monorepo doesn't have to refactor names
export const test_collections = collections;
