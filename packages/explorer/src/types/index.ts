/**
 * Firestore data types supported by Explorer
 */
export type DataType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'timestamp'
    | 'reference'
    | 'geopoint'
    | 'array'
    | 'map'
    | 'null';

/**
 * View mode for displaying documents
 */
export type ViewMode = 'table' | 'json';

/**
 * Subscription tiers that have access to Explorer
 */
export type SubscriptionTier = 'free' | 'cloud_plus' | 'pro' | 'enterprise';

/**
 * Inferred field information from document analysis
 */
export interface InferredField {
    /** Field name */
    name: string;
    
    /** Full path using dot notation for nested fields */
    path: string;
    
    /** Inferred data type */
    dataType: DataType;
    
    /** Number of documents that have this field */
    occurrenceCount: number;
    
    /** True if field appears in less than 50% of documents */
    isSparse: boolean;
    
    /** True if field has multiple types across documents */
    hasTypeConflict: boolean;
    
    /** List of conflicting types if hasTypeConflict is true */
    conflictingTypes?: DataType[];
    
    /** True if field can be null */
    isNullable: boolean;
}

/**
 * Schema inferred from analyzing collection documents
 */
export interface InferredSchema {
    /** List of discovered fields */
    fields: InferredField[];
    
    /** Total number of documents in the collection */
    totalDocuments: number;
    
    /** Number of documents analyzed */
    analyzedDocuments: number;
}

/**
 * Document data structure
 */
export interface DocumentData {
    /** Document ID */
    id: string;
    
    /** Full document path */
    path: string;
    
    /** Document field data */
    data: Record<string, any>;
}

/**
 * Filter operator types
 */
export type FilterOperator = 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';

/**
 * Column-specific filter
 */
export interface ColumnFilter {
    /** Field to filter on */
    field: string;
    
    /** Filter operator */
    operator: FilterOperator;
    
    /** Filter value */
    value: any;
}

/**
 * Filter state for search and column filters
 */
export interface FilterState {
    /** Global search term */
    searchTerm: string;
    
    /** Column-specific filters */
    columnFilters: Record<string, ColumnFilter>;
}

/**
 * Firestore item type (collection or document)
 */
export type FirestoreItemType = 'collection' | 'document';

/**
 * Firestore item (collection or document)
 */
export interface FirestoreItem {
    /** Item ID */
    id: string;
    
    /** Item type */
    type: FirestoreItemType;
    
    /** Full path */
    path: string;
    
    /** Document data (only for documents) */
    data?: Record<string, any>;
}

/**
 * Navigation state for breadcrumb trail
 */
export interface NavigationState {
    /** Current path segments */
    pathSegments: string[];
    
    /** Current view mode */
    viewMode: ViewMode;
    
    /** Active filters */
    filters: FilterState;
}
