/**
 * Database Abstraction Interfaces
 * 
 * These interfaces define the contracts that any database backend must implement
 * to be used with Rebase. This allows for pluggable database backends like
 * PostgreSQL, MongoDB, MySQL, etc.
 */

import { 
    Entity,
    EntityCollection,
    FilterValues,
    WhereFilterOp,
    DatabaseConnection,
    QueryFilter,
    FetchCollectionOptions,
    SearchOptions,
    CountOptions,
    ConditionBuilder,
    ConditionBuilderStatic,
    EntityRepository,
    CollectionSubscriptionConfig,
    EntitySubscriptionConfig,
    RealtimeProvider,
    CollectionRegistryInterface,
    DataTransformer,
    BackendConfig,
    BackendInstance,
    BackendFactory
} from "@rebasepro/types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

/**
 * Type representing either a direct database connection or a transaction.
 * Used to allow services to operate within a transaction context.
 */
export type DrizzleClient = NodePgDatabase<any> | PgTransaction<any, any, any>;

export type {
    DatabaseConnection,
    QueryFilter,
    FetchCollectionOptions,
    SearchOptions,
    CountOptions,
    ConditionBuilder,
    ConditionBuilderStatic,
    EntityRepository,
    CollectionSubscriptionConfig,
    EntitySubscriptionConfig,
    RealtimeProvider,
    CollectionRegistryInterface,
    DataTransformer,
    BackendConfig,
    BackendInstance,
    BackendFactory
};
