import express, { Express, Request, Response, Router, RequestHandler, NextFunction } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import cors from "cors";
import { GraphQLSchemaGenerator } from "./graphql/graphql-schema-generator";
import { RestApiGenerator } from "./rest/api-generator";
import { DataSourceDelegate, User } from "@firecms/types";
import { ApiConfig, FireCMSRequest } from "./types";

/**
 * Simplified API server that leverages existing FireCMS infrastructure
 * Can be used standalone or mounted on existing Express app
 */
export class FireCMSApiServer {
    private app: Express;
    private router: Router;
    private config: ApiConfig;
    private dataSource: DataSourceDelegate;

    constructor(config: ApiConfig & { dataSource: DataSourceDelegate }) {
        this.config = {
            basePath: "/api",
            enableGraphQL: true,
            enableREST: true,
            pagination: {
                defaultLimit: 20,
                maxLimit: 100
            },
            ...config
        };

        this.dataSource = config.dataSource;
        this.app = express();
        this.router = Router();
        this.setupMiddleware();
        this.setupRoutes();
        this.app.use(this.router);
    }

    /**
     * Setup Express middleware
     */
    private setupMiddleware(): void {
        // CORS - only apply to our routes
        if (this.config.cors) {
            this.router.use(cors(this.config.cors));
        }

        // Body parsing - only for our routes
        this.router.use(express.json({ limit: "10mb" }));
        this.router.use(express.urlencoded({ extended: true }));

        // Auth middleware - only for our routes
        if (this.config.auth?.enabled) {
            this.router.use(async (req: FireCMSRequest, res: Response, next): Promise<void> => {
                if (this.config.auth?.validator) {
                    try {
                        const authResult = await this.config.auth.validator(req);
                        if (authResult) {
                            const user = typeof authResult === "object" ? authResult : { uid: "default" } as User;
                            req.user = user as unknown as User;

                            // If the data source supports RLS/scoped auth, use it
                            if ("withAuth" in this.dataSource && typeof (this.dataSource as { withAuth?: Function }).withAuth === "function") {
                                try {
                                    req.dataSource = await (this.dataSource as { withAuth: Function }).withAuth(user);
                                } catch (e) {
                                    console.error("Failed to initialize scoped data source", e);
                                    // Fallback to default which might fail if RLS enforces policies the default user doesn't meet
                                    req.dataSource = this.dataSource;
                                }
                            } else {
                                req.dataSource = this.dataSource;
                            }
                        }
                    } catch (error) {
                        res.status(401).json({ error: { message: "Unauthorized" } });
                        return; // ensure exit without calling next
                    }
                }
                next();
            });
        }
    }

    /**
     * Setup API routes using existing services
     */
    private setupRoutes(): void {
        const basePath = this.config.basePath!;

        // Health check
        this.router.get(`${basePath}/health`, (req: Request, res: Response) => {
            res.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                collections: this.config.collections.map(c => c.slug),
                dataSource: this.dataSource.key
            });
        });

        // Collections metadata endpoint
        this.router.get(`${basePath}/collections`, (req: Request, res: Response) => {
            const collectionsMetadata = this.config.collections.map(collection => ({
                slug: collection.slug,
                name: collection.name,
                singularName: collection.singularName,
                description: collection.description,
                dbPath: collection.dbPath,
                properties: Object.keys(collection.properties),
                relations: collection.relations?.map(r => ({
                    relationName: r.relationName,
                    target: r.target().slug,
                    cardinality: r.cardinality,
                    direction: r.direction
                })) || []
            }));

            res.json({ data: collectionsMetadata });
        });

        // GraphQL endpoint - uses existing DataSourceDelegate
        if (this.config.enableGraphQL) {
            const schemaGenerator = new GraphQLSchemaGenerator(this.config.collections, this.dataSource);
            const schema = schemaGenerator.generateSchema();

            const graphQLHandler = createHandler({
                schema,
                context: (req: unknown) => ({
                    user: (req as FireCMSRequest).user,
                    dataSource: (req as FireCMSRequest).dataSource || this.dataSource
                })
            }) as unknown as RequestHandler;

            this.router.use(`${basePath}/graphql`, graphQLHandler);

            // Lightweight GraphiQL IDE (only in non-production envs)
            if (process.env.NODE_ENV !== "production") {
                this.router.get(`${basePath}/graphiql`, (_req: Request, res: Response) => {
                    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8/>
  <title>FireCMS GraphiQL</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
  <style>body,html,#graphiql{height:100%;margin:0;width:100%;}</style>
</head>
<body>
<div id="graphiql">Loading...</div>
<script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
<script>
  const fetcher = GraphiQL.createFetcher({ url: '${basePath}/graphql' });
  ReactDOM.render(
    React.createElement(GraphiQL, { fetcher }),
    document.getElementById('graphiql'),
  );
</script>
</body>
</html>`);
                });
            }
        }

        if (this.config.enableREST) {
            const restGenerator = new RestApiGenerator(this.config.collections, this.dataSource);
            const restRoutes = restGenerator.generateRoutes();
            this.router.use(basePath, restRoutes);
        }

        // OpenAPI/Swagger documentation endpoint
        this.router.get(`${basePath}/docs`, (req: Request, res: Response) => {
            const openApiSpec = this.generateOpenApiSpec();
            res.json(openApiSpec);
        });

        // Simple Swagger UI
        this.router.get(`${basePath}/swagger`, (req: Request, res: Response) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>FireCMS API Documentation</title>
                    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
                </head>
                <body>
                    <div id="swagger-ui"></div>
                    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
                    <script>
                        SwaggerUIBundle({
                            url: '${basePath}/docs',
                            dom_id: '#swagger-ui'
                        });
                    </script>
                </body>
                </html>
            `);
        });

        // Don't mount routes automatically - let the consumer mount the router

        // Global Error Handling Middleware for API Routes
        this.router.use((err: Error & { statusCode?: number, code?: string, details?: unknown }, req: Request, res: Response, next: NextFunction) => {
            console.error("FireCMS API Error:", err);

            const statusCode = err.statusCode ||
                (err.message && err.message.includes("not found") ? 404 : 500);

            res.status(statusCode).json({
                error: {
                    message: err.message || "An unexpected error occurred",
                    code: err.code || "INTERNAL_ERROR",
                    details: err.details
                }
            });
        });
    }

    /**
     * Generate OpenAPI specification for the REST API
     */
    private generateOpenApiSpec(): any {
        const spec = {
            openapi: "3.0.0",
            info: {
                title: "FireCMS Auto-Generated API",
                version: "1.0.0",
                description: "Automatically generated REST API from FireCMS collections"
            },
            servers: [
                {
                    url: this.config.basePath,
                    description: "API Server"
                }
            ],
            paths: {} as Record<string, unknown>,
            components: {
                schemas: {} as Record<string, unknown>
            }
        };

        this.config.collections.forEach(collection => {
            spec.components.schemas[collection.singularName || collection.name] = {
                type: "object",
                properties: {
                    id: { type: "string" },
                    ...Object.entries(collection.properties).reduce((props, [key, property]) => {
                        if (property.type !== "relation") {
                            props[key] = this.convertPropertyToOpenApiType(property);
                        }
                        return props;
                    }, {} as Record<string, unknown>)
                }
            };

            const basePath = `/${collection.slug}`;

            spec.paths[basePath] = {
                get: {
                    summary: `List ${collection.name}`,
                    parameters: [
                        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
                        { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                        { name: "where", in: "query", schema: { type: "string" } },
                        { name: "orderBy", in: "query", schema: { type: "string" } }
                    ],
                    responses: {
                        200: {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "array",
                                                items: { $ref: `#/components/schemas/${collection.singularName}` }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: `Create ${collection.singularName}`,
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${collection.singularName}` }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: { $ref: `#/components/schemas/${collection.singularName}` }
                                }
                            }
                        }
                    }
                }
            };

            spec.paths[`${basePath}/{id}`] = {
                get: {
                    summary: `Get ${collection.singularName} by ID`,
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } }
                    ],
                    responses: {
                        200: {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: { $ref: `#/components/schemas/${collection.singularName}` }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: `Update ${collection.singularName}`,
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } }
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${collection.singularName}` }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Updated",
                            content: {
                                "application/json": {
                                    schema: { $ref: `#/components/schemas/${collection.singularName}` }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: `Delete ${collection.singularName}`,
                    parameters: [
                        { name: "id", in: "path", required: true, schema: { type: "string" } }
                    ],
                    responses: {
                        204: { description: "Deleted" }
                    }
                }
            };
        });

        return spec;
    }

    private convertPropertyToOpenApiType(property: any): any {
        switch (property.type) {
            case "string":
                return { type: "string" };
            case "number":
                return { type: "number" };
            case "boolean":
                return { type: "boolean" };
            case "date":
                return { type: "string", format: "date-time" };
            case "array":
                return { type: "array", items: { type: "string" } };
            default:
                return { type: "string" };
        }
    }

    /**
     * Get the Express router with all API routes
     * Use this to mount the API on an existing Express app
     */
    getRouter(): Router {
        return this.router;
    }

    /**
     * Get the standalone Express app
     * Use this if you want to run the API as a standalone server
     */
    getApp(): Express {
        return this.app;
    }

    /**
     * Start the server (standalone mode)
     */
    listen(port: number = 3000, callback?: () => void): void {
        this.app.listen(port, callback);
    }
}
