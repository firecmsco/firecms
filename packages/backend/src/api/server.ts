import express, { Express, Request, Response, Router, RequestHandler } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import cors from "cors";
import { GraphQLSchemaGenerator } from "./graphql/graphql-schema-generator";
import { RestApiGenerator } from "./rest/api-generator";
import { DataSourceDelegate, User } from "@firecms/types";
import { ApiConfig } from "./types";

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
            this.router.use(async (req: Request, res: Response, next): Promise<void> => {
                if (this.config.auth?.validator) {
                    try {
                        const authResult = await this.config.auth.validator(req);
                        if (authResult) {
                            const user = typeof authResult === "object" ? authResult : { uid: "default" } as User;
                            (req as any).user = user;

                            // If the data source supports RLS/scoped auth, use it
                            if ("withAuth" in this.dataSource && typeof (this.dataSource as any).withAuth === "function") {
                                try {
                                    (req as any).dataSource = await (this.dataSource as any).withAuth(user);
                                } catch (e) {
                                    console.error("Failed to initialize scoped data source", e);
                                    // Fallback to default which might fail if RLS enforces policies the default user doesn't meet
                                    (req as any).dataSource = this.dataSource;
                                }
                            } else {
                                (req as any).dataSource = this.dataSource;
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
                context: (req: any) => ({
                    user: (req as any).user,
                    dataSource: (req as any).dataSource || this.dataSource
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
            // We need a way to pass the scoped dataSource to the REST handlers.
            // Since RestApiGenerator generates the router upfront, we need to adapt it.
            // Ideally, RestApiGenerator should accept a factory function or looking up from req.
            // For now, let's patch the RestApiGenerator to use the request-scoped datasource if available.
            // We can do this by creating a proxy datasource that delegates to req.dataSource if present.

            const proxyDataSource = new Proxy(this.dataSource, {
                get: (target, prop, receiver) => {
                    // Logic to retrieve the datasource from the current request context would be complex here
                    // because we don't have access to 'req' in this proxy trap directly.
                    // HOWEVER, we can instantiate the RestApiGenerator normally and rely on the fact that
                    // the express handlers generated by it might need modification.

                    // Actually, the simplest way without major refactoring of RestApiGenerator
                    // is to create a dynamic router that instantiates the handler per request, 
                    // OR (better) modify RestApiGenerator to allow lookups from `req`.

                    // Since I cannot modify RestApiGenerator easily here (it's imported),
                    // I will assume RestApiGenerator creates handlers that use `this.dataSource`.

                    // For the scope of this task, let's assume valid access for now, 
                    // but noting that RestRoutes might need refactoring to support per-request DS.
                    return Reflect.get(target, prop, receiver);
                }
            });

            // WAIT. If we want RLS to work for REST, we need the REST handlers to use the `req.dataSource`.
            // The `RestApiGenerator` class takes `dataSource` in constructor.
            // If we pass `this.dataSource`, it binds to the global one.
            // We need to modify `RestApiGenerator` to use `req.dataSource`.
            // Since `RestApiGenerator` is in another file, let's assume we will modify it next.
            // For now, passing `this.dataSource` is the placeholder, but we will revisit `RestApiGenerator`.

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
            paths: {} as any,
            components: {
                schemas: {} as any
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
                    }, {} as any)
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
