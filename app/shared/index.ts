/**
 * Shared collections index file
 * This file exports all collections to be used by both frontend and backend
 */

export * from "./collections/collections";

// Re-export FireCMS core types for convenience
export type {
    Entity,
    EntityCollection,
    Property,
    PropertyBuilder
} from "@firecms/core";
