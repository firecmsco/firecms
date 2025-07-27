// Types that match FireCMS core interfaces exactly
export interface Entity<M extends Record<string, any> = any> {
  id: string | number;
  path: string;
  values: M;
  databaseId?: string;
}

export interface EntityCollection<M extends Record<string, any> = any> {
  id?: string;
  path?: string;
  schema?: any;
  databaseId?: string;
  collectionGroup?: boolean;
}

export type EntityStatus = "new" | "existing" | "modified" | "copy";

export type WhereFilterOp =
  | "==" | "!=" | ">" | ">=" | "<" | "<="
  | "in" | "not-in" | "array-contains" | "array-contains-any";

export type FilterValues<T extends string> = Partial<Record<T, [WhereFilterOp, any]>>;

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

// Request/Response types for the data source delegate
export interface FetchCollectionRequest<M extends Record<string, any> = any> extends FetchCollectionProps<M> {}
export interface FetchEntityRequest<M extends Record<string, any> = any> extends FetchEntityProps<M> {}
export interface SaveEntityRequest<M extends Record<string, any> = any> extends SaveEntityProps<M> {}
export interface DeleteEntityRequest<M extends Record<string, any> = any> extends DeleteEntityProps<M> {}

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
