import { Router, Response, NextFunction } from "express";
import { DataSource, EntityCollection } from "@rebasepro/types";
import { ApiResponse, QueryOptions, RebaseRequest } from "../types";
import { ApiError, asyncHandler } from "../errors";
import { buildPropertyCallbacks } from "@rebasepro/common";
import { parseQueryOptions } from "./query-parser";

/**
 * Lightweight REST API generator that leverages existing Rebase DataSource
 */
export class RestApiGenerator {
    private collections: EntityCollection[];
    private router: Router;
    private dataSource: DataSource;

    constructor(collections: EntityCollection[], dataSource: DataSource) {
        this.collections = collections;
        this.dataSource = dataSource;
        this.router = Router();
    }

    /**
     * Generate REST routes using existing DataSource
     */
    generateRoutes(): Router {
        this.collections.forEach(collection => {
            this.createCollectionRoutes(collection);
        });
        return this.router;
    }

    /**
     * Create REST routes for a collection using existing Rebase patterns
     */
    private createCollectionRoutes(collection: EntityCollection): void {
        const basePath = `/${collection.slug}`;

        // The DataSource handles callback execution (beforeSave, afterRead, etc) internally.
        const resolvedCollection = collection;

        // GET /collection - List entities (fetch raw data without Entity wrapper)
        this.router.get(basePath, asyncHandler(async (req: RebaseRequest, res: Response, next: NextFunction): Promise<void> => {
            const queryOptions = parseQueryOptions(req.query);

            // Get data source from request (injected by Auth middleware) or fallback to instance default
            const dataSource = req.dataSource || this.dataSource;

            // Fetch raw data directly from EntityService without Entity wrapper
            const entities = await this.fetchRawCollection(dataSource, resolvedCollection, queryOptions);

            // Get count if needed
            const total = await this.countRawEntities(dataSource, resolvedCollection, queryOptions);

            res.json({
                data: entities,
                meta: {
                    total,
                    limit: queryOptions.limit,
                    offset: queryOptions.offset,
                    hasMore: (queryOptions.offset || 0) + entities.length < total
                }
            });
        }));

        // GET /collection/:id - Get single entity (fetch raw data without Entity wrapper)
        this.router.get(`${basePath}/:id`, asyncHandler(async (req: RebaseRequest, res: Response, next: NextFunction): Promise<void> => {
            const { id } = req.params;

            // Get data source from request (injected by Auth middleware) or fallback to instance default
            const dataSource = req.dataSource || this.dataSource;

            // Fetch raw data directly from EntityService without Entity wrapper
            const entity = await this.fetchRawEntity(dataSource, resolvedCollection, String(id));

            if (!entity) {
                throw ApiError.notFound("Entity not found");
            }

            res.json(entity);
        }));

        // POST /collection - Create entity (uses existing saveEntity)
        this.router.post(basePath, asyncHandler(async (req: RebaseRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                const path = collection.dbPath || collection.slug;
                // Use existing saveEntity from DataSource
                const entity = await dataSource.saveEntity({
                    path,
                    values: req.body,
                    collection: resolvedCollection,
                    status: "new"
                });

                res.status(201).json(this.formatResponse(entity));
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                throw err;
            }
        }));

        // PUT /collection/:id - Update entity (uses existing saveEntity)
        this.router.put(`${basePath}/:id`, asyncHandler(async (req: RebaseRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { id } = req.params;

                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                // Check if entity exists first
                const existingEntity = await dataSource.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection: resolvedCollection
                });

                if (!existingEntity) {
                    throw ApiError.notFound("Entity not found");
                }

                // Use existing saveEntity from DataSource
                const entity = await dataSource.saveEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    values: req.body,
                    collection: resolvedCollection,
                    status: "existing"
                });

                res.json(this.formatResponse(entity));
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                throw err;
            }
        }));

        // DELETE /collection/:id - Delete entity (uses existing deleteEntity)
        this.router.delete(`${basePath}/:id`, asyncHandler(async (req: RebaseRequest, res: Response, next: NextFunction): Promise<void> => {
            const { id } = req.params;

            // Get data source from request (injected by Auth middleware) or fallback to instance default
            const dataSource = req.dataSource || this.dataSource;

            // Check if entity exists first
            const existingEntity = await dataSource.fetchEntity({
                path: collection.dbPath || collection.slug,
                entityId: String(id),
                collection: resolvedCollection
            });

            if (!existingEntity) {
                throw ApiError.notFound("Entity not found");
            }

            // Use existing deleteEntity from DataSource (expects the full entity)
            await dataSource.deleteEntity({
                entity: existingEntity,
                collection: resolvedCollection
            });

            res.status(204).send();
        }));
    }



    /**
     * Format successful API response - flattened for traditional REST API
     */
    private formatResponse<T>(data: T, meta?: any): any {
        // If data is an array of entities, flatten each one
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

        // If data is a single entity, flatten it
        if (data && typeof data === "object" && "values" in data) {
            return this.flattenEntity(data);
        }

        // Return as-is for other data types
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
    private flattenEntity(entity: any): any {
        if (!entity || typeof entity !== "object") {
            return entity;
        }

        // If it's a Rebase entity with values, extract and flatten
        if ("values" in entity && typeof entity.values === "object") {
            return {
                id: entity.id,
                ...entity.values
            };
        }

        return entity;
    }



    /**
     * Fetch raw collection data without Entity wrapper
     */
    private async fetchRawCollection(dataSource: DataSource, collection: EntityCollection, queryOptions: QueryOptions) {
        // Use existing fetchCollection from DataSource
        const entities = await dataSource.fetchCollection({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where,
            limit: queryOptions.limit,
            orderBy: queryOptions.orderBy?.[0]?.field,
            order: queryOptions.orderBy?.[0]?.direction === "desc" ? "desc" : "asc",
            startAfter: queryOptions.offset ? String(queryOptions.offset) : undefined
        });

        // Flatten entities for raw data response
        return entities.map(entity => this.flattenEntity(entity));
    }

    /**
     * Count raw entities for a collection
     */
    private async countRawEntities(dataSource: DataSource, collection: EntityCollection, queryOptions: QueryOptions): Promise<number> {
        return dataSource.countEntities ? await dataSource.countEntities({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where
        }) : 0;
    }

    /**
     * Fetch single entity raw data without Entity wrapper
     */
    private async fetchRawEntity(dataSource: DataSource, collection: EntityCollection, entityId: string) {
        // Use existing fetchEntity from DataSource
        const entity = await dataSource.fetchEntity({
            path: collection.dbPath || collection.slug,
            entityId,
            collection
        });

        // Return flattened entity or null if not found
        return entity ? this.flattenEntity(entity) : null;
    }
}
