import { EntityCollection } from "@rebasepro/types";
import { AuthResult } from "../auth/middleware";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DataDriver } from "@rebasepro/types";

/**
 * Hono Environment Variables
 * Passed to generic Hono<HonoEnv> to type `c.get()`
 */
export type HonoEnv = {
    Variables: {
        user?: AuthResult | { userId?: string, roles?: string[] };
        driver?: DataDriver;
    }
};

/**
 * Configuration for API generation
 */
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
    /** Whether auth is required for API endpoints (default: true) */
    requireAuth?: boolean;
    /** Optional custom validator for authentication */
    authValidator?: (c: import("hono").Context<import("./types").HonoEnv>) => Promise<AuthResult>;
    pagination?: {
        defaultLimit: number;
        maxLimit: number;
    };
}

/**
 * Context passed to resolvers and handlers
 */
export interface ApiContext {
    user?: AuthResult;
    collections: Map<string, EntityCollection>;
    db: NodePgDatabase; // Drizzle DB instance
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
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
    where?: Record<string, unknown>;
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
