import { Entity } from "./entities";

export interface WebSocketMessage {
    type: string;
    payload?: any;
    subscriptionId?: string;
    requestId?: string;
    entities?: Entity<any>[];
    entity?: Entity<any> | null;
    error?: string;
}

export interface CollectionUpdateMessage extends WebSocketMessage {
    type: "collection_update";
    subscriptionId: string;
    entities: Entity<any>[];
}

export interface EntityUpdateMessage extends WebSocketMessage {
    type: "entity_update";
    subscriptionId: string;
    entity: Entity<any> | null;
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
