import { Entity, EntityCollection, EntityStatus, FilterValues } from "@firecms/types";

// These should match exactly with FireCMS core types
export interface FetchCollectionProps<M extends Record<string, any> = any> {
  path: string;
  collection?: EntityCollection<M>;
  filter?: FilterValues<Extract<keyof M, string>>;
  limit?: number;
  startAfter?: any;
  orderBy?: string;
  searchString?: string;
  order?: "desc" | "asc";
}

export interface FetchEntityProps<M extends Record<string, any> = any> {
  path: string;
  entityId: string;
  databaseId?: string;
  collection?: EntityCollection<M>;
}

export interface SaveEntityProps<M extends Record<string, any> = any> {
  path: string;
  entityId?: string;
  values: Partial<M>;
  previousValues?: Partial<M>;
  collection?: EntityCollection<M>;
  status: EntityStatus;
}

export interface DeleteEntityProps<M extends Record<string, any> = any> {
  entity: Entity<M>;
  collection?: EntityCollection<M>;
}


// Subscription types
export interface ListenCollectionRequest<M extends Record<string, any> = any> extends FetchCollectionProps<M> {
  subscriptionId: string;
  onUpdate: (entities: Entity<M>[]) => void;
  onError?: (error: Error) => void;
}

export interface ListenEntityRequest<M extends Record<string, any> = any> extends FetchEntityProps<M> {
  subscriptionId: string;
  onUpdate: (entity: Entity<M> | null) => void;
  onError?: (error: Error) => void;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload?: any;
  subscriptionId?: string;
}

export interface CollectionUpdateMessage extends WebSocketMessage {
  type: "collection_update";
  subscriptionId: string;
  entities: Entity[];
}

export interface EntityUpdateMessage extends WebSocketMessage {
  type: "entity_update";
  subscriptionId: string;
  entity: Entity | null;
}
