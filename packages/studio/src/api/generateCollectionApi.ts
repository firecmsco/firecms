import { EntityCollection } from "@firecms/core";

export interface GenerateCollectionRequest {
    /** User's natural language description of what they want */
    prompt: string;

    /** Other collections in the project (for context/relationships). Limit to 30. */
    existingCollections: Partial<EntityCollection>[];

    /** Optional for generate, required for modifications. If provided, modifies this collection */
    existingCollection?: Partial<EntityCollection>;
}

/** Operation types for modifying a collection */
export type CollectionOperationType = "add" | "modify" | "delete";

/** A single operation describing what changed */
export interface CollectionOperation {
    op: CollectionOperationType;
    path: string;
    value?: any;
}

/** Result from collection generation, including optional delta operations */
export interface GenerateCollectionResult {
    collection: EntityCollection;
    operations?: CollectionOperation[];
}

/**
 * Callback type for generating or modifying a collection.
 * The plugin is API-agnostic - consumers implement the actual API call.
 */
export type CollectionGenerationCallback = (
    request: GenerateCollectionRequest
) => Promise<GenerateCollectionResult>;

export class CollectionGenerationApiError extends Error {
    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
        this.name = "CollectionGenerationApiError";
    }
}

/**
 * Default endpoint for AI collection generation
 */
export const DEFAULT_COLLECTION_GENERATION_ENDPOINT = "https://api.firecms.co/collections/generate";

/**
 * Props for building a collection generation callback
 */
export interface BuildCollectionGenerationCallbackProps {
    /**
     * Function to get the auth token (e.g., from Firebase Auth)
     * This is typically `authController.getAuthToken` from `@firecms/firebase`
     */
    getAuthToken: () => Promise<string>;

    /**
     * Optional custom API endpoint for collection generation.
     * Defaults to the FireCMS SaaS API endpoint.
     */
    apiEndpoint?: string;
}

/**
 * Build a callback for AI collection generation.
 * This helper allows self-hosted FireCMS users to enable the AI collection
 * generation feature.
 *
 * @example
 * ```typescript
 * import { useCollectionEditorPlugin, buildCollectionGenerationCallback } from "@firecms/collection_editor";
 * import { useFirebaseAuthController } from "@firecms/firebase";
 *
 * const authController = useFirebaseAuthController({ firebaseApp });
 *
 * const collectionEditorPlugin = useCollectionEditorPlugin({
 *     // ... other props
 *     generateCollection: buildCollectionGenerationCallback({
 *         getAuthToken: authController.getAuthToken
 *     })
 * });
 * ```
 */
export function buildCollectionGenerationCallback({
    getAuthToken,
    apiEndpoint = DEFAULT_COLLECTION_GENERATION_ENDPOINT
}: BuildCollectionGenerationCallbackProps): CollectionGenerationCallback {
    return async (request) => {
        const token = await getAuthToken();
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new CollectionGenerationApiError(
                errorData.error || "Failed to generate collection",
                errorData.code
            );
        }

        const data = await response.json();
        return {
            collection: data.data.collection,
            operations: data.data.operations
        };
    };
}
