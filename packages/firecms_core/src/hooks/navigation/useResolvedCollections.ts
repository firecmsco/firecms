import { useCallback, useEffect, useRef, useState } from "react";

import {
    AuthController,
    CollectionRegistryController,
    DataSource,
    EntityCollection,
    EntityCollectionsBuilder,
    FireCMSPlugin,
    User
} from "@firecms/types";
import { CollectionRegistry } from "@firecms/common";

import { resolveCollections } from "./useNavigationResolution";
import { areCollectionListsEqual } from "./utils";

export type UseResolvedCollectionsProps<EC extends EntityCollection, USER extends User> = {
    authController: AuthController<USER>;
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    dataSource: DataSource;
    plugins?: FireCMSPlugin[];
    disabled?: boolean;
    collectionRegistryController: CollectionRegistryController<EC> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> };
};

export type UseResolvedCollectionsResult = {
    collections: EntityCollection[];
    loading: boolean;
    error: Error | undefined;
    refresh: () => void;
};

/**
 * Hook that resolves collection props (which may be async builders or arrays)
 * into concrete EntityCollection[], and registers them with the CollectionRegistry.
 *
 * Uses refs for potentially-unstable dependencies (dataSource, authController,
 * plugins) to avoid re-triggering effects when their object identity changes.
 */
export function useResolvedCollections<EC extends EntityCollection, USER extends User>(
    props: UseResolvedCollectionsProps<EC, USER>
): UseResolvedCollectionsResult {

    const {
        authController,
        collections: collectionsProp,
        dataSource,
        plugins,
        disabled,
        collectionRegistryController
    } = props;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [resolvedCollections, setResolvedCollections] = useState<EntityCollection[]>([]);

    // Track the trigger count to allow force-refresh
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Use refs for values that may be new objects each render but shouldn't
    // re-trigger the effect. The effect reads them at execution time.
    const dataSourceRef = useRef(dataSource);
    dataSourceRef.current = dataSource;
    const authControllerRef = useRef(authController);
    authControllerRef.current = authController;
    const pluginsRef = useRef(plugins);
    pluginsRef.current = plugins;

    // Ref for resolved collections change detection
    const resolvedCollectionsRef = useRef<EntityCollection[]>([]);

    const initialLoading = authController.initialLoading;
    const user = authController.user;

    useEffect(() => {
        if (disabled || initialLoading) return;

        let cancelled = false;

        (async () => {
            try {
                const resolved = await resolveCollections(
                    collectionsProp,
                    authControllerRef.current,
                    dataSourceRef.current,
                    pluginsRef.current
                );

                if (cancelled) return;

                // Register with the CollectionRegistry; returns true if changed
                const changed = collectionRegistryController.collectionRegistryRef.current.registerMultiple(resolved);

                if (changed) {
                    console.debug("Collections have changed", resolved);
                }

                // Only update state if collections actually changed
                if (!areCollectionListsEqual(resolvedCollectionsRef.current, resolved)) {
                    resolvedCollectionsRef.current = resolved;
                    setResolvedCollections(resolved);
                }

                setError(undefined);
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    setError(e as Error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        collectionsProp,
        disabled,
        collectionRegistryController.collectionRegistryRef,
        refreshTrigger,
        initialLoading,
        user
    ]);

    return {
        collections: resolvedCollections,
        loading,
        error,
        refresh
    };
}
