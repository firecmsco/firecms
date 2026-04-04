import { Hono } from "hono";
import { DataDriver, Entity, EntityCollection, FetchCollectionProps } from "@rebasepro/types";
import { QueryOptions, HonoEnv } from "../types";
import { ApiError } from "../errors";
import { parseQueryOptions } from "./query-parser";
import { EntityFetchService } from "../../db/services/EntityFetchService";
import { PostgresDataDriver } from "../../services/postgresDataDriver";

/**
 * Lightweight REST API generator that leverages existing Rebase DataDriver.
 * Supports `include` query parameter for eager-loading relations via Drizzle.
 */
export class RestApiGenerator {
    private collections: EntityCollection[];
    private router: Hono<HonoEnv>;
    private driver: DataDriver;

    constructor(collections: EntityCollection[], driver: DataDriver) {
        this.collections = collections;
        this.driver = driver;
        this.router = new Hono<HonoEnv>();
    }

    /**
     * Generate REST routes using existing DataDriver
     */
    generateRoutes(): Hono<HonoEnv> {
        this.collections.forEach(collection => {
            this.createCollectionRoutes(collection);
        });
        return this.router;
    }

    /**
     * Get the EntityFetchService from a PostgresDataDriver (for include support)
     */
    private getFetchService(driver: DataDriver): EntityFetchService | null {
        if (driver instanceof PostgresDataDriver) {
            return driver.entityService.getFetchService();
        }
        return null;
    }

    /**
     * Create REST routes for a collection using existing Rebase patterns
     */
    private createCollectionRoutes(collection: EntityCollection): void {
        const basePath = `/${collection.slug}`;
        const resolvedCollection = collection;

        // GET /collection - List entities
        this.router.get(basePath, async (c) => {
            const queryDict = c.req.query();
            const queryOptions = parseQueryOptions(queryDict);

            const driver = c.get("driver") || this.driver;
            const fetchService = this.getFetchService(driver);

            // Use include-aware path when available
            if (fetchService) {
                const collectionPath = collection.dbPath || collection.slug;
                const entities = await fetchService.fetchCollectionForRest(
                    collectionPath,
                    {
                        filter: queryOptions.where as FetchCollectionProps["filter"],
                        limit: queryOptions.limit,
                        orderBy: queryOptions.orderBy?.[0]?.field,
                        order: queryOptions.orderBy?.[0]?.direction === "desc" ? "desc" : "asc",
                        searchString: (queryDict as any).searchString,
                    },
                    queryOptions.include
                );

                const total = await this.countRawEntities(driver, resolvedCollection, queryOptions);

                return c.json({
                    data: entities,
                    meta: {
                        total,
                        limit: queryOptions.limit,
                        offset: queryOptions.offset,
                        hasMore: (queryOptions.offset || 0) + entities.length < total
                    }
                });
            }

            // Fallback for non-Postgres drivers
            const entities = await this.fetchRawCollection(driver, resolvedCollection, queryOptions);
            const total = await this.countRawEntities(driver, resolvedCollection, queryOptions);

            return c.json({
                data: entities,
                meta: {
                    total,
                    limit: queryOptions.limit,
                    offset: queryOptions.offset,
                    hasMore: (queryOptions.offset || 0) + entities.length < total
                }
            });
        });

        // GET /collection/:id - Get single entity
        this.router.get(`${basePath}/:id`, async (c) => {
            const id = c.req.param("id");
            const queryDict = c.req.query();
            const queryOptions = parseQueryOptions(queryDict);
            const driver = c.get("driver") || this.driver;
            const fetchService = this.getFetchService(driver);

            // Use include-aware path when available
            if (fetchService) {
                const collectionPath = collection.dbPath || collection.slug;
                const entity = await fetchService.fetchEntityForRest(
                    collectionPath,
                    String(id),
                    queryOptions.include
                );

                if (!entity) {
                    throw ApiError.notFound("Entity not found");
                }

                return c.json(entity);
            }

            // Fallback
            const entity = await this.fetchRawEntity(driver, resolvedCollection, String(id));

            if (!entity) {
                throw ApiError.notFound("Entity not found");
            }

            return c.json(entity);
        });

        // POST /collection - Create entity
        this.router.post(basePath, async (c) => {
            try {
                const driver = c.get("driver") || this.driver;
                const path = collection.dbPath || collection.slug;
                
                const body = await c.req.json().catch(() => ({}));

                const entity = await driver.saveEntity({
                    path,
                    values: body,
                    collection: resolvedCollection,
                    status: "new"
                });

                return c.json(this.formatResponse(entity), 201);
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                throw err;
            }
        });

        // PUT /collection/:id - Update entity
        this.router.put(`${basePath}/:id`, async (c) => {
            try {
                const id = c.req.param("id");
                const driver = c.get("driver") || this.driver;

                const existingEntity = await driver.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection: resolvedCollection
                });

                if (!existingEntity) {
                    throw ApiError.notFound("Entity not found");
                }

                const body = await c.req.json().catch(() => ({}));

                const entity = await driver.saveEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    values: body,
                    collection: resolvedCollection,
                    status: "existing"
                });

                return c.json(this.formatResponse(entity));
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                throw err;
            }
        });

        // DELETE /collection/:id - Delete entity
        this.router.delete(`${basePath}/:id`, async (c) => {
            const id = c.req.param("id");
            const driver = c.get("driver") || this.driver;

            const existingEntity = await driver.fetchEntity({
                path: collection.dbPath || collection.slug,
                entityId: String(id),
                collection: resolvedCollection
            });

            if (!existingEntity) {
                throw ApiError.notFound("Entity not found");
            }

            await driver.deleteEntity({
                entity: existingEntity,
                collection: resolvedCollection
            });

            return new Response(null, { status: 204 });
        });
    }

    /**
     * Format successful API response - flattened for traditional REST API
     */
    private formatResponse<T>(data: T, meta?: Record<string, unknown>): unknown {
        if (Array.isArray(data)) {
            const flattenedData = data.map(entity => this.flattenEntity(entity));
            if (meta) {
                return {
                    data: flattenedData,
                    meta
                };
            }
            return flattenedData;
        }

        if (data && typeof data === "object" && "values" in data) {
            return this.flattenEntity(data as unknown as Entity<Record<string, unknown>>);
        }

        if (meta) {
            return {
                data,
                meta
            };
        }
        return data;
    }

    /**
     * Flatten Rebase entity structure to traditional REST format
     */
    private flattenEntity(entity: Entity<Record<string, unknown>>): Record<string, unknown> {
        if (!entity || typeof entity !== "object") {
            return entity;
        }

        if ("values" in entity && typeof entity.values === "object") {
            return {
                id: entity.id,
                ...entity.values
            };
        }

        return entity as unknown as Record<string, unknown>;
    }

    /**
     * Fetch raw collection data without Entity wrapper (fallback for non-Postgres)
     */
    private async fetchRawCollection(driver: DataDriver, collection: EntityCollection, queryOptions: QueryOptions) {
        const entities = await driver.fetchCollection({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where as FetchCollectionProps["filter"],
            limit: queryOptions.limit,
            orderBy: queryOptions.orderBy?.[0]?.field,
            order: queryOptions.orderBy?.[0]?.direction === "desc" ? "desc" : "asc",
            startAfter: queryOptions.offset ? String(queryOptions.offset) : undefined
        });

        return entities.map(entity => this.flattenEntity(entity));
    }

    /**
     * Count raw entities for a collection
     */
    private async countRawEntities(driver: DataDriver, collection: EntityCollection, queryOptions: QueryOptions): Promise<number> {
        return driver.countEntities ? await driver.countEntities({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where as FetchCollectionProps["filter"]
        }) : 0;
    }

    /**
     * Fetch single entity raw data without Entity wrapper (fallback)
     */
    private async fetchRawEntity(driver: DataDriver, collection: EntityCollection, entityId: string) {
        const entity = await driver.fetchEntity({
            path: collection.dbPath || collection.slug,
            entityId,
            collection
        });

        return entity ? this.flattenEntity(entity) : null;
    }
}
