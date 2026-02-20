import { Router, Response, NextFunction } from "express";
import { DataSourceDelegate, EntityCollection } from "@firecms/types";
import { ApiResponse, QueryOptions, FireCMSRequest } from "../types";

/**
 * Lightweight REST API generator that leverages existing FireCMS DataSourceDelegate
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
        this.router.get(basePath, async (req: FireCMSRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                const queryOptions = this.parseQueryOptions(req.query);

                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                // Fetch raw data directly from EntityService without Entity wrapper
                const entities = await this.fetchRawCollection(dataSource, collection, queryOptions);

                // Get count if needed
                const total = await this.countRawEntities(dataSource, collection, queryOptions);

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
                next(error);
            }
        });

        // GET /collection/:id - Get single entity (fetch raw data without Entity wrapper)
        this.router.get(`${basePath}/:id`, async (req: FireCMSRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { id } = req.params;

                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                // Fetch raw data directly from EntityService without Entity wrapper
                const entity = await this.fetchRawEntity(dataSource, collection, String(id));

                if (!entity) {
                    throw Object.assign(new Error("Entity not found"), { code: "NOT_FOUND" });
                }

                res.json(entity);
                return;
            } catch (error) {
                next(error);
            }
        });

        // POST /collection - Create entity (uses existing saveEntity)
        this.router.post(basePath, async (req: FireCMSRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                const path = collection.dbPath || collection.slug;
                const entityId = dataSource.generateEntityId?.(path, collection) ?? crypto.randomUUID();
                // Use existing saveEntity from DataSourceDelegate
                const entity = await dataSource.saveEntity({
                    path,
                    entityId,
                    values: req.body,
                    collection,
                    status: "new"
                });

                res.status(201).json(this.formatResponse(entity));
                return;
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                next(err);
            }
        });

        // PUT /collection/:id - Update entity (uses existing saveEntity)
        this.router.put(`${basePath}/:id`, async (req: FireCMSRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { id } = req.params;

                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                // Check if entity exists first
                const existingEntity = await dataSource.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection
                });

                if (!existingEntity) {
                    throw Object.assign(new Error("Entity not found"), { code: "NOT_FOUND" });
                }

                // Use existing saveEntity from DataSourceDelegate
                const entity = await dataSource.saveEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    values: req.body,
                    collection,
                    status: "existing"
                });

                res.json(this.formatResponse(entity));
                return;
            } catch (error) {
                const err = error as Error & { code?: string };
                err.code = err.code || "BAD_REQUEST";
                next(err);
            }
        });

        // DELETE /collection/:id - Delete entity (uses existing deleteEntity)
        this.router.delete(`${basePath}/:id`, async (req: FireCMSRequest, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { id } = req.params;

                // Get data source from request (injected by Auth middleware) or fallback to instance default
                const dataSource = req.dataSource || this.dataSource;

                // Check if entity exists first
                const existingEntity = await dataSource.fetchEntity({
                    path: collection.dbPath || collection.slug,
                    entityId: String(id),
                    collection
                });

                if (!existingEntity) {
                    throw Object.assign(new Error("Entity not found"), { code: "NOT_FOUND" });
                }

                // Use existing deleteEntity from DataSourceDelegate (expects the full entity)
                await dataSource.deleteEntity({
                    entity: existingEntity,
                    collection
                });

                res.status(204).send();
                return;
            } catch (error) {
                next(error);
            }
        });
    }

    /**
     * Map PostgREST-style operators to FireCMS WhereFilterOp
     */
    private mapOperator(op: string): string | null {
        switch (op) {
            case "eq": return "==";
            case "neq": return "!=";
            case "gt": return ">";
            case "gte": return ">=";
            case "lt": return "<";
            case "lte": return "<=";
            case "in": return "in";
            case "nin": return "not-in";
            case "cs": return "array-contains";
            case "csa": return "array-contains-any";
            default: return null;
        }
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
        options.where = {};

        // Legacy JSON where clause
        if (query.where) {
            try {
                const parsedWhere = typeof query.where === "string"
                    ? JSON.parse(query.where)
                    : query.where;
                Object.assign(options.where, parsedWhere);
            } catch {
                // Invalid JSON, ignore
            }
        }

        // PostgREST style filtering
        const reservedQueryKeys = ["limit", "offset", "page", "orderBy", "where", "include"];
        for (const [key, rawValue] of Object.entries(query)) {
            if (reservedQueryKeys.includes(key)) continue;

            const value = Array.isArray(rawValue) ? rawValue[rawValue.length - 1] : rawValue;

            if (typeof value === "string") {
                const parts = value.split(".");
                if (parts.length >= 2) {
                    const op = parts[0];
                    const val = parts.slice(1).join(".");
                    const firecmsOp = this.mapOperator(op);

                    if (firecmsOp) {
                        let parsedVal: any = val;
                        // Attempt to parse primitive types or arrays
                        if (val === "true") parsedVal = true;
                        else if (val === "false") parsedVal = false;
                        else if (val === "null") parsedVal = null;
                        else if (!isNaN(Number(val)) && val.trim() !== "") parsedVal = Number(val);
                        else if (val.startsWith("(")) {
                            // Array for 'in' or 'not-in' ops (e.g. (1,2,3) or (a,b,c))
                            const arrayContent = val.endsWith(")") ? val.slice(1, -1) : val.slice(1);
                            parsedVal = arrayContent.split(",").map(v => {
                                const trimmed = v.trim();
                                if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
                                if (trimmed === "true") return true;
                                if (trimmed === "false") return false;
                                if (trimmed === "null") return null;
                                return trimmed;
                            });
                        }

                        options.where[key] = [firecmsOp, parsedVal];
                    } else {
                        // Fallback: assume implicit eq if the dot wasn't an operator (e.g. email or float)
                        let parsedVal: any = value;
                        if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);
                        options.where[key] = ["==", parsedVal];
                    }
                } else {
                    // Implicit eq
                    let parsedVal: any = value;
                    if (value === "true") parsedVal = true;
                    else if (value === "false") parsedVal = false;
                    else if (value === "null") parsedVal = null;
                    else if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);

                    options.where[key] = ["==", parsedVal];
                }
            }
        }

        if (Object.keys(options.where).length === 0) {
            delete options.where;
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
                id: entity.id,
                ...entity.values
            };
        }

        return entity;
    }



    /**
     * Fetch raw collection data without Entity wrapper
     */
    private async fetchRawCollection(dataSource: DataSourceDelegate, collection: EntityCollection, queryOptions: QueryOptions) {
        // Use existing fetchCollection from DataSourceDelegate
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
    private async countRawEntities(dataSource: DataSourceDelegate, collection: EntityCollection, queryOptions: QueryOptions): Promise<number> {
        return dataSource.countEntities ? await dataSource.countEntities({
            path: collection.dbPath || collection.slug,
            collection,
            filter: queryOptions.where
        }) : 0;
    }

    /**
     * Fetch single entity raw data without Entity wrapper
     */
    private async fetchRawEntity(dataSource: DataSourceDelegate, collection: EntityCollection, entityId: string) {
        // Use existing fetchEntity from DataSourceDelegate
        const entity = await dataSource.fetchEntity({
            path: collection.dbPath || collection.slug,
            entityId,
            collection
        });

        // Return flattened entity or null if not found
        return entity ? this.flattenEntity(entity) : null;
    }
}
