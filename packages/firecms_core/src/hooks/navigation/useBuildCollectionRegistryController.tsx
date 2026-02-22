import { useCallback, useRef, useState } from "react";
import { CollectionRegistry, getParentReferencesFromPath as commonGetParentReferencesFromPath, removeInitialAndTrailingSlashes, mergeDeep, getSubcollections } from "@firecms/common";
import { EntityCollection, EntityReference, UserConfigurationPersistence, CollectionRegistryController } from "@firecms/types";

export function useBuildCollectionRegistryController(props: {
    userConfigPersistence?: UserConfigurationPersistence
}): CollectionRegistryController & {
    collectionRegistryRef: React.MutableRefObject<CollectionRegistry>;
} {
    const { userConfigPersistence } = props;
    const collectionRegistryRef = useRef<CollectionRegistry>(new CollectionRegistry());
    const [initialised, setInitialised] = useState(false);

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

    const getParentReferencesFromPath = useCallback((path: string): EntityReference[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return [];
        }
        return commonGetParentReferencesFromPath({
            path,
            collections: registry.getCollections()
        });
    }, []);

    const getParentCollectionIds = useCallback((path: string): string[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return [];
        }
        const strings = path.split("/");
        const oddPathSegments = strings.filter((_: any, i: number) => i % 2 === 0);
        oddPathSegments.pop();

        const result: string[][] = [];

        for (let i = 1; i <= oddPathSegments.length; i++) {
            result.push(oddPathSegments.slice(0, i));
        }

        const getCollectionFromPaths = (pathSegments: string[]): EntityCollection | undefined => {
            if (!pathSegments?.length) return undefined;
            const testPath = pathSegments.reduce((acc, segment, idx) => {
                if (idx === 0) return segment;
                return `${acc}/fake_id/${segment}`;
            }, "");
            try {
                return registry.resolvePathToCollections(testPath).finalCollection;
            } catch (e) {
                return undefined;
            }
        };

        return result.map(r => getCollectionFromPaths(r)?.slug).filter(Boolean) as string[];
    }, []);

    const convertIdsToPaths = useCallback((ids: string[]): string[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) return [];
        let currentCollections: EntityCollection[] = registry.getCollections();
        const paths: string[] = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const collection: EntityCollection | undefined = currentCollections.find(c => c.slug === id);
            if (!collection)
                throw Error(`Collection with id ${id} not found`);
            paths.push(collection.slug ?? collection.dbPath); // Fallback to dbPath if slug doesn't exist? Wait, slug is correct.
            currentCollections = getSubcollections(collection) ?? [];
        }
        return paths;
    }, []);

    const collections = collectionRegistryRef.current.getCollections();

    // Determine initialised automatically based on whether collections exist,
    // though the NavigationStateController also plays a role in overall init
    if (!initialised && collections.length > 0) {
        setInitialised(true);
    }

    return {
        collections,
        initialised,
        getCollection,
        getRawCollection,
        getParentReferencesFromPath,
        getParentCollectionIds,
        convertIdsToPaths,
        collectionRegistryRef
    };
}
