import { useCallback, useRef } from "react";
import { CollectionRegistry, getParentReferencesFromPath, getSubcollections, mergeDeep, removeInitialAndTrailingSlashes } from "@firecms/common";
import { EntityCollection, EntityReference, UserConfigurationPersistence } from "@firecms/types";

export function useNavigationRegistry(userConfigPersistence?: UserConfigurationPersistence) {
    const collectionRegistryRef = useRef<CollectionRegistry>(new CollectionRegistry());

    const getCollection = useCallback((
        slugOrPath: string,
        includeUserOverride = false
    ): EntityCollection | undefined => {

        const registry = collectionRegistryRef.current;

        const cleanedPath = removeInitialAndTrailingSlashes(slugOrPath);
        if (!cleanedPath) return undefined;

        const pathSegments = cleanedPath.split("/");

        let collectionPath = cleanedPath;
        // If the path has an even number of segments, it points to an entity, so we get the parent collection
        if (pathSegments.length > 0 && pathSegments.length % 2 === 0) {
            collectionPath = pathSegments.slice(0, -1).join("/");
        }

        if (!collectionPath) return undefined;

        let collection: EntityCollection | undefined;
        try {
            collection = registry.resolvePathToCollections(collectionPath).finalCollection;
        } catch (e) {
            console.debug(`Could not resolve path to collection: ${collectionPath}`, e);
            return undefined;
        }

        if (!collection) {
            return undefined;
        }

        const userOverride = includeUserOverride ? userConfigPersistence?.getCollectionConfig(slugOrPath) : undefined;
        const overriddenCollection = collection ? mergeDeep(collection, userOverride ?? {}) : undefined;

        if (!overriddenCollection) return undefined;

        let result: Partial<EntityCollection> | undefined = overriddenCollection;
        const subcollections = overriddenCollection.subcollections;
        const callbacks = overriddenCollection.callbacks;
        const permissions = overriddenCollection.permissions;
        result = {
            ...result,
            subcollections: result?.subcollections ?? subcollections,
            callbacks: result?.callbacks ?? callbacks,
            permissions: result?.permissions ?? permissions
        };

        return { ...overriddenCollection, ...result } as EntityCollection;

    }, [userConfigPersistence]);

    const getRawCollection = useCallback((slugOrPath: string): EntityCollection | undefined => {
        const registry = collectionRegistryRef.current;
        if (registry === undefined) return undefined;

        const cleanedPath = removeInitialAndTrailingSlashes(slugOrPath);
        if (!cleanedPath) return undefined;

        return registry.getRaw(cleanedPath) as EntityCollection | undefined;
    }, []);

    const getCollectionFromPaths = useCallback(<EC extends EntityCollection>(pathSegments: string[]): EC | undefined => {
        const registry = collectionRegistryRef.current;
        if (registry === undefined)
            throw Error("getCollectionFromPaths: Collections have not been initialised yet");

        if (!pathSegments?.length) {
            return undefined;
        }

        const path = pathSegments.reduce((acc, segment, i) => {
            if (i === 0) return segment;
            return `${acc}/fake_id/${segment}`;
        }, "");

        try {
            const { finalCollection } = registry.resolvePathToCollections(path);
            return finalCollection as EC | undefined;
        } catch (e) {
            console.debug(`Could not resolve path segments to collection: ${pathSegments.join("/")}`, e);
            return undefined;
        }
    }, []);

    const getAllParentReferencesForPath = useCallback((path: string): EntityReference[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return [];
        }
        return getParentReferencesFromPath({
            path,
            collections: registry.getCollections()
        });
    }, []);

    const getParentCollectionIds = useCallback((path: string): string[] => {
        const strings = path.split("/");
        const oddPathSegments = strings.filter((_, i) => i % 2 === 0);
        oddPathSegments.pop();

        const result: string[][] = [];

        for (let i = 1; i <= oddPathSegments.length; i++) {
            result.push(oddPathSegments.slice(0, i));
        }

        return result.map(r => getCollectionFromPaths(r)?.slug).filter(Boolean) as string[];
    }, [getAllParentReferencesForPath, getCollectionFromPaths]);

    const convertIdsToPaths = useCallback((ids: string[]): string[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            throw new Error("convertIdsToPaths: collectionRegistryRef not initialised");
        }
        let currentCollections: EntityCollection[] = registry.getCollections();
        const paths: string[] = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const collection: EntityCollection | undefined = currentCollections.find(c => c.slug === id);
            if (!collection)
                throw Error(`Collection with id ${id} not found`);
            paths.push(collection.dbPath);
            currentCollections = getSubcollections(collection) ?? [];
        }
        return paths;
    }, []);

    return {
        collectionRegistryRef,
        getCollection,
        getRawCollection,
        getParentReferencesFromPath: getAllParentReferencesForPath,
        getParentCollectionIds,
        convertIdsToPaths
    };
}
