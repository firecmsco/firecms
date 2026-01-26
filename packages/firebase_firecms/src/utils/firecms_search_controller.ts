import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
import { FirebaseApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

/**
 * Configuration returned by the FireCMS Search Extension
 */
interface SearchConfig {
    host: string;
    port: number;
    protocol: "http" | "https";
    apiKey: string;
    collectionsToIndex: string[];
    path?: string;
}
/**
 * Options for building the FireCMS Search Controller
 */
export interface FireCMSSearchControllerOptions {
    /**
     * The Firebase region where the extension is deployed.
     */
    region: string;

    /**
     * The extension instance ID. Defaults to "firecms-search".
     * Use this if you installed the extension with a custom instance ID.
     */
    extensionInstanceId?: string;

    /**
     * Custom Typesense configuration. If provided, skips fetching from extension.
     * Use this if you want to connect to your own Typesense instance.
     */
    customConfig?: {
        host: string;
        port?: number;
        protocol?: "http" | "https";
        apiKey: string;
        path?: string;
    };
}

/**
 * Creates a text search controller that uses the FireCMS Search Extension.
 *
 * This requires the `firecms-search` extension to be installed in the user's
 * Firebase project. The extension automatically deploys Typesense to Cloud Run
 * and syncs Firestore data.
 *
 * @example
 * ```typescript
 * import { buildFireCMSSearchController } from "@firecms/firebase";
 *
 * // Using the extension (recommended)
 * const textSearchControllerBuilder = buildFireCMSSearchController();
 *
 * // Or with custom Typesense instance
 * const textSearchControllerBuilder = buildFireCMSSearchController({
 *   customConfig: {
 *     host: "your-typesense-instance.com",
 *     apiKey: "your-api-key"
 *   }
 * });
 *
 * <FireCMSApp
 *   textSearchControllerBuilder={textSearchControllerBuilder}
 *   collections={[
 *     {
 *       path: "products",
 *       name: "Products",
 *       textSearchEnabled: true, // Enable search for this collection
 *       properties: { ... }
 *     }
 *   ]}
 * />
 * ```
 *
 * @param options - Configuration options
 * @returns A FirestoreTextSearchControllerBuilder
 *
 * @group Firebase
 */
export function buildFireCMSSearchController(
    options?: FireCMSSearchControllerOptions
): FirestoreTextSearchControllerBuilder {
    const region = options?.region || "us-central1";
    const extensionInstanceId = options?.extensionInstanceId || "firecms-search";

    let searchConfig: SearchConfig | null = null;
    let typesenseClient: any = null;
    let initPromise: Promise<void> | null = null;

    return ({ firebaseApp }: { firebaseApp: FirebaseApp }): FirestoreTextSearchController => {

        /**
         * Initializes the Typesense client
         */
        const initializeClient = async (): Promise<void> => {
            if (typesenseClient) return;

            // Use custom config if provided
            if (options?.customConfig) {
                searchConfig = {
                    host: options.customConfig.host,
                    port: options.customConfig.port || 443,
                    protocol: options.customConfig.protocol || "https",
                    apiKey: options.customConfig.apiKey,
                    path: options.customConfig.path,
                    collectionsToIndex: ["*"],
                };
            } else {
                // Fetch config from extension
                const functions = getFunctions(firebaseApp, region);
                const getConfig = httpsCallable<void, SearchConfig>(
                    functions,
                    `ext-${extensionInstanceId}-getSearchConfig`
                );

                try {
                    const result = await getConfig();
                    searchConfig = result.data;
                } catch (error: any) {
                    console.error("Failed to get search config from extension:", error);
                    throw new Error(
                        "Failed to initialize FireCMS Search. " +
                        "Make sure the firecms-search extension is installed and configured. " +
                        `Error: ${error.message || error}`
                    );
                }
            }

            if (!searchConfig) {
                throw new Error("Search config not available");
            }

            // Dynamically import Typesense client to avoid bundling if not used
            const Typesense = (await import("typesense")).default;

            typesenseClient = new Typesense.Client({
                nodes: [{
                    host: searchConfig.host,
                    port: searchConfig.port,
                    protocol: searchConfig.protocol,
                    path: searchConfig.path || "",
                }],
                apiKey: searchConfig.apiKey,
                connectionTimeoutSeconds: 5,
                retryIntervalSeconds: 0.5,
                numRetries: 2,
            });
        };

        /**
         * Converts a Firestore path to Typesense collection name
         * e.g., "users/123/orders" -> "users_orders"
         */
        const getTypesenseCollectionName = (path: string): string => {
            const pathParts = path.split("/");
            // Extract collection names (even indices) and join with underscore
            const collectionNames: string[] = [];
            for (let i = 0; i < pathParts.length; i += 2) {
                if (pathParts[i]) {
                    collectionNames.push(pathParts[i]);
                }
            }
            return collectionNames.join("_");
        };

        /**
         * Extracts parent filter for subcollection queries
         * e.g., "users/123/orders" -> { "_parent_users_id": "123" }
         */
        const getParentFilter = (path: string): string | null => {
            const pathParts = path.split("/");
            if (pathParts.length <= 1) return null;

            // Build filter for parent IDs
            const filters: string[] = [];
            for (let i = 0; i < pathParts.length - 1; i += 2) {
                const collectionName = pathParts[i];
                const docId = pathParts[i + 1];
                if (collectionName && docId) {
                    filters.push(`_parent_${collectionName}_id:=${docId}`);
                }
            }

            return filters.length > 0 ? filters.join(" && ") : null;
        };

        /**
         * Initializes search for a specific collection path
         */
        const init = async (props: {
            path: string;
            collection?: EntityCollection | ResolvedEntityCollection;
            databaseId?: string;
        }): Promise<boolean> => {
            try {
                // Ensure client is initialized (only once)
                if (!initPromise) {
                    initPromise = initializeClient();
                }
                await initPromise;

                if (!searchConfig) return false;

                // Get collection pattern (e.g., "users/orders" from "users/123/orders")
                const pathParts = props.path.split("/");
                const collectionNames: string[] = [];
                for (let i = 0; i < pathParts.length; i += 2) {
                    if (pathParts[i]) collectionNames.push(pathParts[i]);
                }
                const collectionPattern = collectionNames.join("/");
                const rootCollection = collectionNames[0];

                // Check if this collection is indexed
                if (searchConfig.collectionsToIndex.includes("*")) {
                    return true;
                }

                // Check exact pattern or root collection
                return searchConfig.collectionsToIndex.includes(collectionPattern) ||
                    searchConfig.collectionsToIndex.includes(rootCollection);
            } catch (error) {
                console.error("Failed to initialize FireCMS Search:", error);
                return false;
            }
        };

        /**
         * Performs a search and returns document IDs
         * Supports subcollections by filtering on parent IDs
         */
        const search = async (props: {
            searchString: string;
            path: string;
            databaseId?: string;
        }): Promise<readonly string[] | undefined> => {
            if (!typesenseClient) {
                // Ensure client is initialized
                if (!initPromise) {
                    initPromise = initializeClient();
                }
                await initPromise;
            }

            if (!typesenseClient) {
                console.error("Typesense client not initialized");
                return undefined;
            }

            // Convert path to Typesense collection name
            const collectionName = getTypesenseCollectionName(props.path);

            // Get parent filter for subcollections
            const parentFilter = getParentFilter(props.path);

            try {
                const searchParams: any = {
                    q: props.searchString,
                    query_by: "*", // Search all fields
                    per_page: 100,
                    prefix: true, // Enable prefix matching
                    typo_tokens_threshold: 1, // Allow some typos
                };

                // Add filter for subcollection queries
                if (parentFilter) {
                    searchParams.filter_by = parentFilter;
                }

                const result = await typesenseClient
                    .collections(collectionName)
                    .documents()
                    .search(searchParams);

                // Extract document IDs from hits
                const ids = result.hits?.map((hit: any) => hit.document.id) ?? [];

                return ids as readonly string[];
            } catch (error: any) {
                // Handle collection not found - might not be indexed yet
                if (error.httpStatus === 404) {
                    console.warn(`Collection "${collectionName}" not found in Typesense. ` +
                        "It may not be indexed yet. Try running the backfill function.");
                    return [];
                }

                console.error("Search error:", error);
                return undefined;
            }
        };

        return { init, search };
    };
}
