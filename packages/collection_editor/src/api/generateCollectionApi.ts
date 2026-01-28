import { EntityCollection } from "@firecms/core";

export interface GenerateCollectionRequest {
    /** User's natural language description of what they want */
    prompt: string;

    /** Other collections in the project (for context/relationships). Limit to 30. */
    existingCollections: Partial<EntityCollection>[];

    /** Optional for generate, required for modify_delta. If provided, modifies this collection */
    existingCollection?: Partial<EntityCollection>;
}

export interface CollectionResponse {
    data: {
        collection: EntityCollection;
    };
}

/** Operation types for modifying a collection */
export type CollectionOperationType = "add" | "modify" | "delete";

/** A single operation describing what changed */
export interface CollectionOperation {
    op: CollectionOperationType;
    path: string;
    value?: any;
}

/** Response for modify_delta endpoint - includes collection and operations */
export interface ModifyDeltaResponse {
    data: {
        collection: EntityCollection;
        operations?: CollectionOperation[];
    };
}

/** Result from modifyCollectionDelta including the changed paths */
export interface ModifyDeltaResult {
    collection: EntityCollection;
    operations: CollectionOperation[];
}

export interface GenerateCollectionError {
    error: string;
}

export class CollectionGenerationApiError extends Error {
    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
        this.name = "CollectionGenerationApiError";
    }
}

/**
 * Generate a new collection OR modify existing (full regeneration).
 * Use this for creating new collections or when you need full regeneration.
 * 
 * POST /collections/generate
 * 
 * @returns The generated/modified collection configuration
 */
export async function generateCollection({
    prompt,
    existingCollections,
    existingCollection,
    getAuthToken,
    apiEndpoint
}: {
    prompt: string;
    existingCollections: Partial<EntityCollection>[];
    existingCollection?: Partial<EntityCollection>;
    getAuthToken: () => Promise<string>;
    apiEndpoint: string;
}): Promise<EntityCollection> {
    const token = await getAuthToken();

    const body: GenerateCollectionRequest = {
        prompt,
        existingCollections: existingCollections.slice(0, 30),
        ...(existingCollection && { existingCollection })
    };

    const response = await fetch(`${apiEndpoint}/collections/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let errorMessage = "Failed to generate collection";
        try {
            const errorData: GenerateCollectionError = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            // If we can't parse the error, use the default message
        }
        throw new CollectionGenerationApiError(errorMessage, response.status.toString());
    }

    const data: CollectionResponse = await response.json();
    return data.data.collection;
}

/**
 * Modify an existing collection using delta (faster).
 * LLM only computes changes internally, making it more efficient for edits.
 * Returns the full modified collection plus the operations that describe what changed.
 * 
 * POST /collections/modify_delta
 * 
 * @returns The modified collection and operations describing what changed
 */
export async function modifyCollectionDelta({
    prompt,
    existingCollection,
    existingCollections,
    getAuthToken,
    apiEndpoint
}: {
    prompt: string;
    existingCollection: Partial<EntityCollection>;
    existingCollections?: Partial<EntityCollection>[];
    getAuthToken: () => Promise<string>;
    apiEndpoint: string;
}): Promise<ModifyDeltaResult> {
    const token = await getAuthToken();

    const body: GenerateCollectionRequest = {
        prompt,
        existingCollection,
        existingCollections: (existingCollections ?? []).slice(0, 30)
    };

    const response = await fetch(`${apiEndpoint}/collections/modify_delta`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let errorMessage = "Failed to modify collection";
        try {
            const errorData: GenerateCollectionError = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            // If we can't parse the error, use the default message
        }
        throw new CollectionGenerationApiError(errorMessage, response.status.toString());
    }

    const data: ModifyDeltaResponse = await response.json();
    return {
        collection: data.data.collection,
        operations: data.data.operations ?? []
    };
}
