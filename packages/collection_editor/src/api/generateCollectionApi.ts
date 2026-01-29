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
