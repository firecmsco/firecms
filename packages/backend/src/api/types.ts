import { EntityCollection } from "@rebasepro/types";
import { AuthenticatedRequest, AuthResult } from "../auth/middleware";

/**
 * Extended request type for API endpoints.
 * Extends AuthenticatedRequest which provides `user` and `dataSource`.
 */
export interface RebaseRequest extends AuthenticatedRequest {}

/**
 * Configuration for API generation
 */
/**
 * Auth configuration for the optional REST/GraphQL API layer.
 * This controls authentication for externally-exposed API endpoints,
 * separate from the core backend auth (AuthConfig in init.ts).
 */
export interface ApiAuthConfig {
    /** Whether auth is enabled for API endpoints */
    enabled: boolean;
    /** Whether auth is required (vs optional) for API endpoints */
    requireAuth?: boolean;
    /** Custom token validator (overrides default JWT validation) */
    validator?: (req: RebaseRequest) => Promise<AuthResult>;
}

/**
 * Configuration for API generation
 */
export interface ApiConfig {
    collections?: EntityCollection[];
    collectionsDir?: string;
    basePath?: string;
    enableGraphQL?: boolean;
    enableREST?: boolean;
    cors?: {
        origin?: string | string[] | boolean;
        credentials?: boolean;
    };
    auth?: ApiAuthConfig;
    pagination?: {
        defaultLimit: number;
        maxLimit: number;
    };
}

/**
 * Context passed to resolvers and handlers
 */
export interface ApiContext {
    user?: any;
    collections: Map<string, EntityCollection>;
    db: any; // Drizzle DB instance
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
    };
}

/**
 * Query options for API endpoints
 */
export interface QueryOptions {
    limit?: number;
    offset?: number;
    where?: Record<string, any>;
    orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    include?: string[];
}

/**
 * Relation resolution configuration
 */
export interface RelationConfig {
    relationName: string;
    depth?: number;
    include?: string[];
}
