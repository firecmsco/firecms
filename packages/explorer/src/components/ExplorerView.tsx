import React, { useState } from "react";
import { useRootCollections } from "../hooks/useRootCollections";
import { ProjectsApi } from "../services/collectionDiscovery";
import { CollectionSelectionView } from "./CollectionSelectionView";
import { CollectionDataView } from "./CollectionDataView";

interface ExplorerViewProps {
    projectsApi?: ProjectsApi;
    projectId?: string;
}

/**
 * Main Explorer view component - handles routing between collection selection and data views
 * Supports navigation through collection paths and subcollections
 */
export const ExplorerView: React.FC<ExplorerViewProps> = ({ projectsApi, projectId }) => {
    const [navigationPath, setNavigationPath] = useState<string[]>([]);

    // Fetch root collections
    const { collections: rootCollections, loading: collectionsLoading } = useRootCollections({
        projectsApi,
        projectId
    });

    const handleCollectionSelect = (collectionPath: string) => {
        setNavigationPath([collectionPath]);
    };

    const handleNavigateToSubcollection = (fullSubcollectionPath: string) => {
        // The fullSubcollectionPath is already complete (e.g., "products/B000P0MDMS/reviews")
        // We need to parse it and update the navigation path accordingly
        const pathSegments = fullSubcollectionPath.split('/');
        setNavigationPath(pathSegments);
    };

    const handleNavigateBack = (targetIndex?: number) => {
        if (targetIndex !== undefined) {
            // Navigate to specific level in breadcrumb
            setNavigationPath(prev => prev.slice(0, targetIndex + 1));
        } else {
            // Navigate back one level
            setNavigationPath(prev => prev.slice(0, -1));
        }
    };

    const handleBackToSelection = () => {
        setNavigationPath([]);
    };

    // Current collection path (join all navigation segments)
    const currentCollectionPath = navigationPath.length > 0 ? navigationPath.join('/') : null;

    // Show collection data view if a collection is selected
    if (currentCollectionPath) {
        return (
            <CollectionDataView
                collectionPath={currentCollectionPath}
                navigationPath={navigationPath}
                onBack={handleBackToSelection}
                onNavigateBack={handleNavigateBack}
                onNavigateToSubcollection={handleNavigateToSubcollection}
            />
        );
    }

    // Show collection selection view by default
    return (
        <CollectionSelectionView
            rootCollections={rootCollections}
            collectionsLoading={collectionsLoading}
            onCollectionSelect={handleCollectionSelect}
        />
    );
};