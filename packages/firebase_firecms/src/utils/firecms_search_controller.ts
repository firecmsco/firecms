import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
import { FirebaseApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { EntityCollection } from "@firecms/core";

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

    /**
     * Override the collections to index returned by the extension.
     * Use this if you want to restrict search to specific collections on the client side,
     * regardless of what is configured in the extension.
     */
    collections?: string[];
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
    const extensionInstanceId = options?.extensionInstanceId || "typesense-search";

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
                    if (options?.collections && options.collections.length > 0) {
                        searchConfig.collectionsToIndex = options.collections;
                    }
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
            collection?: EntityCollection;
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

        // Cache for Typesense collection schemas (field names)
        const schemaCache: Map<string, string[]> = new Map();

        /**
         * Fetches the Typesense collection schema and returns searchable string field names.
         * Results are cached to avoid repeated API calls.
         */
        const getSearchableFieldsFromSchema = async (collectionName: string): Promise<string[]> => {
            // Check cache first
            if (schemaCache.has(collectionName)) {
                return schemaCache.get(collectionName)!;
            }

            try {
                const collection = await typesenseClient.collections(collectionName).retrieve();

                // Extract string fields from the schema
                const stringFields = collection.fields
                    .filter((f: any) => {
                        // Include string and string[] types, exclude internal fields
                        const isStringType = f.type === "string" ||
                            f.type === "string[]" ||
                            f.type === "string*" ||
                            f.type === "auto";
                        const isNotInternal = !f.name.startsWith("_") && f.name !== ".*";
                        return isStringType && isNotInternal;
                    })
                    .map((f: any) => f.name);

                schemaCache.set(collectionName, stringFields);
                return stringFields;
            } catch (error: any) {
                if (error.httpStatus === 404) {
                    throw new Error(
                        `Collection "${collectionName}" not found in Typesense. ` +
                        "Make sure the collection has been indexed. Try running the backfill function."
                    );
                }
                throw error;
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
            collection?: EntityCollection;
        }): Promise<readonly string[] | undefined> => {
            if (!typesenseClient) {
                // Ensure client is initialized
                if (!initPromise) {
                    initPromise = initializeClient();
                }
                await initPromise;
            }

            if (!typesenseClient) {
                throw new Error("Typesense client not initialized. Check extension configuration.");
            }

            // Convert path to Typesense collection name
            const collectionName = getTypesenseCollectionName(props.path);

            // Get parent filter for subcollections
            const parentFilter = getParentFilter(props.path);

            // Get searchable fields from the actual Typesense schema
            const searchableFields = await getSearchableFieldsFromSchema(collectionName);

            if (searchableFields.length === 0) {
                throw new Error(
                    `No searchable string fields found in Typesense collection "${collectionName}". ` +
                    "Make sure some documents have been indexed with string fields."
                );
            }

            const queryBy = searchableFields.join(",");

            try {
                const searchParams: any = {
                    q: props.searchString,
                    query_by: queryBy,
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
                // Parse error message for user-friendly display
                const message = error.message || error.toString();
                throw new Error(`Search failed: ${message}`);
            }
        };

        return { init, search };
    };
}
