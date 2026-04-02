import { Entity } from "./entities";

export interface WebSocketErrorPayload {
    error?: string | { message: string; code?: string };
    message?: string;
    code?: string;
}

export interface WebSocketMessage {
    type: string;
    payload?: unknown;
    subscriptionId?: string;
    requestId?: string;
    entities?: Entity<Record<string, unknown>>[];
    entity?: Entity<Record<string, unknown>> | null;
    error?: string;
}

export interface CollectionUpdateMessage extends WebSocketMessage {
    type: "collection_update";
    subscriptionId: string;
    entities: Entity<Record<string, unknown>>[];
}

export interface EntityUpdateMessage extends WebSocketMessage {
    type: "entity_update";
    subscriptionId: string;
    entity: Entity<Record<string, unknown>> | null;
}

/**
 * Column metadata returned by table introspection.
 */
export interface TableColumnInfo {
    column_name: string;
    data_type: string;
    udt_name: string;
    is_nullable: string;
    column_default: string | null;
    character_maximum_length: number | null;
    /** Enum values, populated for USER-DEFINED (enum) columns */
    enum_values?: string[];
}
