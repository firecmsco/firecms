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
 * Lightweight patch message sent to collection subscribers when a single
 * entity is created, updated, or deleted. The client can merge this into
 * its cached collection data for near-instant cross-tab updates without
 * waiting for a full collection refetch.
 */
export interface CollectionEntityPatchMessage extends WebSocketMessage {
    type: "collection_entity_patch";
    subscriptionId: string;
    entityId: string;
    /** The updated entity, or null if deleted */
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

export interface TableForeignKeyInfo {
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
}

export interface TableJunctionInfo {
    junction_table_name: string;
    source_column_name: string;
    target_table_name: string;
    target_column_name: string;
}

export interface TablePolicyInfo {
    policy_name: string;
    roles: string[];
    cmd: string;
    qual?: string;
    with_check?: string;
}

export interface TableMetadata {
    columns: TableColumnInfo[];
    foreignKeys: TableForeignKeyInfo[];
    junctions: TableJunctionInfo[];
    policies: TablePolicyInfo[];
}
