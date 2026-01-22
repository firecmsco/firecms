import { Router, Request, Response } from "express";
import { DataSourceDelegate, EntityCollection } from "@firecms/types";
import { ApiResponse, QueryOptions } from "../types";

/**
 * Lightweight REST API generator that leverages existing FireCMS DataSourceDelegate
 * No duplication - uses your existing DataSourceDelegate implementation
 */
export class RestApiGenerator {
    private collections: EntityCollection[];
    private router: Router;
    private dataSource: DataSourceDelegate;

    constructor(collections: EntityCollection[], dataSource: DataSourceDelegate) {
        this.collections = collections;
        this.dataSource = dataSource;
        this.router = Router();
    }

    /**
     * Generate REST routes using existing DataSourceDelegate
     */
    generateRoutes(): Router {
        this.collections.forEach(collection => {
            this.createCollectionRoutes(collection);
        });
        return this.router;
    }

    /**
     * Create REST routes for a collection using existing FireCMS patterns
     */
    private createCollectionRoutes(collection: EntityCollection): void {
        const basePath = `/${collection.slug}`;

        // GET /collection - List entities (fetch raw data without Entity wrapper)
        this.router.get(basePath, async (req: Request, res: Response): Promise<void> => {
            try {
                const queryOptions = this.parseQueryOptions(req.query);

                // Fetch raw data directly from EntityService without Entity wrapper
                const entities = await this.fetchRawCollection(collection, queryOptions);

                // Get count if needed
                const total = await this.countRawEntities(collection, queryOptions);

                res.json({
                    data: entities,
                    meta: {
                        total,
                        limit: queryOptions.limit,
                        offset: queryOptions.offset,
                        hasMore: (queryOptions.offset || 0) + entities.length < total
                    }
                });
                return;
            } catch (error) {
                res.status(500).json(this.formatError(error));
            }
        });

        // GET /collection/:id - Get single entity (fetch raw data without Entity wrapper)
        this.router.get(`${basePath}/:id`, async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Fetch raw data directly from EntityService without Entity wrapper
                const entity = await this.fetchRawEntity(collection, String(id));

                if (!entity) {
                    res.status(404).json(this.formatError(new Error("Entity not found")));
                    return;
                }

                res.json(entity);
                return;
            } catch (error) {
                res.status(500).json(this.formatError(error));
            }
        });

        // POST /collection - Create entity (uses existing saveEntity)
        this.router.post(basePath, async (req: Request, res: Response): Promise<void> => {
            try {
                const path = collection.dbPath || collection.slug;
                const entityId = this.dataSource.generateEntityId?.(path, collection) ?? crypto.randomUUID();
                // Use existing saveEntity from DataSourceDelegate
                const entity = await this.dataSource.saveEntity({
                    path,
                    entityId,
                    values: req.body,
                    collection,
                    status: "new"
                });

                res.status(201).json(this.formatResponse(entity));
                return;
            } catch (error) {
                res.status(400).json(this.formatError(error));
            }
        });

        // PUT /collection/:id - Update entity (uses existing saveEntity)
        this.router.put(`${basePath}/:id`, async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Check if entity exists first
                const existingEntity = await this.dataSource.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection
                });

                if (!existingEntity) {
                    res.status(404).json(this.formatError(new Error("Entity not found")));
                    return;
                }

                // Use existing saveEntity from DataSourceDelegate
                const entity = await this.dataSource.saveEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    values: req.body,
                    collection,
                    status: "existing"
                });

                res.json(this.formatResponse(entity));
                return;
            } catch (error) {
                res.status(400).json(this.formatError(error));
            }
        });

        // DELETE /collection/:id - Delete entity (uses existing deleteEntity)
        this.router.delete(`${basePath}/:id`, async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Check if entity exists first
                const existingEntity = await this.dataSource.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection
                });

                if (!existingEntity) {
                    res.status(404).json(this.formatError(new Error("Entity not found")));
                    return;
                }

                // Use existing deleteEntity from DataSourceDelegate (expects the full entity)
                await this.dataSource.deleteEntity({
                    entity: existingEntity,
                    collection
                });

                res.status(204).send();
                return;
            } catch (error) {
                res.status(500).json(this.formatError(error));
            }
        });
    }

    /**
     * Parse query parameters into QueryOptions
     */
    private parseQueryOptions(query: any): QueryOptions {
        const options: QueryOptions = {};

        // Pagination
        if (query.limit) options.limit = parseInt(query.limit);
        if (query.offset) options.offset = parseInt(query.offset);
        if (query.page) {
            const page = parseInt(query.page);
            const limit = options.limit || 20;
            options.offset = (page - 1) * limit;
        }

        // Filtering
        if (query.where) {
            try {
                options.where = typeof query.where === "string"
                    ? JSON.parse(query.where)
                    : query.where;
            } catch {
                // Invalid JSON, ignore
            }
        }

        // Sorting
        if (query.orderBy) {
            try {
                options.orderBy = typeof query.orderBy === "string"
                    ? JSON.parse(query.orderBy)
                    : query.orderBy;
            } catch {
                // Try simple format: "field:direction"
                if (typeof query.orderBy === "string") {
                    const [field, direction] = query.orderBy.split(":");
                    const dir = (direction === "desc" ? "desc" : "asc") as "asc" | "desc";
                    options.orderBy = [
                        {
                            field,
                            direction: dir
                        }
                    ];
                }
            }
        }

        return options;
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
     * Flatten FireCMS entity structure to traditional REST format
     */
    private flattenEntity(entity: any): any {
        if (!entity || typeof entity !== "object") {
            return entity;
        }

        // If it's a FireCMS entity with values, extract and flatten
        if ("values" in entity && typeof entity.values === "object") {
            return {
                ...entity.values
            };
        }

        return entity;
    }

    /**
     * Format error response
     */
    private formatError(error: any): ApiResponse {
        return {
            error: {
                message: error.message || "An error occurred",
                code: error.code,
                details: error.details
            }
        };
    }

    /**
     * Fetch raw collection data without Entity wrapper
     */
    private async fetchRawCollection(collection: EntityCollection, queryOptions: QueryOptions) {
        // Use existing fetchCollection from DataSourceDelegate
        const entities = await this.dataSource.fetchCollection({
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
    private async countRawEntities(collection: EntityCollection, queryOptions: QueryOptions): Promise<number> {
        return this.dataSource.countEntities ? await this.dataSource.countEntities({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where
        }) : 0;
    }

    /**
     * Fetch single entity raw data without Entity wrapper
     */
    private async fetchRawEntity(collection: EntityCollection, entityId: string) {
        // Use existing fetchEntity from DataSourceDelegate
        const entity = await this.dataSource.fetchEntity({
            path: collection.dbPath || collection.slug,
            entityId,
            collection
        });

        // Return flattened entity or null if not found
        return entity ? this.flattenEntity(entity) : null;
    }
}
