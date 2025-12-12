import { NavigationController } from "@firecms/core";

/**
 * Projects API interface for getting root collections
 */
export interface ProjectsApi {
    getRootCollections: (
        projectId: string,
        googleAccessToken?: string,
        serviceAccount?: object,
        retries?: number
    ) => Promise<string[]>;
}

/**
 * Service for discovering Firestore collections
 */
export class CollectionDiscovery {
    private navigationController: NavigationController;
    private projectsApi?: ProjectsApi;
    private projectId?: string;

    constructor(
        navigationController: NavigationController,
        projectsApi?: ProjectsApi,
        projectId?: string
    ) {
        this.navigationController = navigationController;
        this.projectsApi = projectsApi;
        this.projectId = projectId;
    }

    /**
     * Get root collections from Firestore via the projects API
     * Falls back to configured collections from navigation controller if API is not available
     */
    async getRootCollections(): Promise<string[]> {
        // Try to get collections from the projects API first (this gets ALL collections)
        if (this.projectsApi && this.projectId) {
            try {
                const collections = await this.projectsApi.getRootCollections(this.projectId);
                return collections;
            } catch (error) {
                console.warn('Failed to fetch root collections from API, falling back to navigation controller:', error);
            }
        }

        // Fallback: Get collections from navigation controller (only configured ones)
        const collections = this.navigationController.collections || [];
        
        // Extract collection paths
        const collectionPaths = collections.map(collection => 
            collection.id || collection.path
        );

        return collectionPaths;
    }

    /**
     * List subcollections for a document
     * Note: This requires Firestore Admin SDK which is not available in the browser
     * For now, we'll return an empty array and rely on navigation through known collections
     */
    async listSubcollections(documentPath: string): Promise<string[]> {
        // Subcollection listing requires Firestore Admin SDK
        // In a browser environment, we can't list subcollections directly
        // This would need to be implemented via a backend API endpoint
        console.warn('Subcollection listing is not yet implemented in browser environment');
        return [];
    }
}

/**
 * Create a CollectionDiscovery instance
 */
export function createCollectionDiscovery(
    navigationController: NavigationController,
    projectsApi?: ProjectsApi,
    projectId?: string
): CollectionDiscovery {
    return new CollectionDiscovery(navigationController, projectsApi, projectId);
}
