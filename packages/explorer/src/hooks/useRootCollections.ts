import { useState, useEffect, useMemo } from "react";
import { useNavigationController } from "@firecms/core";
import { CollectionDiscovery, createCollectionDiscovery, ProjectsApi } from "../services/collectionDiscovery";

interface UseRootCollectionsProps {
    projectsApi?: ProjectsApi;
    projectId?: string;
}

/**
 * Hook to fetch and cache root collections
 */
export function useRootCollections(props?: UseRootCollectionsProps) {
    const navigationController = useNavigationController();
    const [collections, setCollections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Create collection discovery service
    const collectionDiscovery = useMemo(
        () => createCollectionDiscovery(
            navigationController,
            props?.projectsApi,
            props?.projectId
        ),
        [navigationController, props?.projectsApi, props?.projectId]
    );

    useEffect(() => {
        let mounted = true;

        const fetchCollections = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const rootCollections = await collectionDiscovery.getRootCollections();
                
                if (mounted) {
                    setCollections(rootCollections);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch root collections'));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchCollections();

        return () => {
            mounted = false;
        };
    }, [collectionDiscovery]);

    return {
        collections,
        loading,
        error
    };
}
