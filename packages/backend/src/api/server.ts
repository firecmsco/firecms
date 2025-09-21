import express, { Express, Request, Response, Router } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import cors from "cors";
import { GraphQLSchemaGenerator } from "./graphql/graphql-schema-generator";
import { RestApiGenerator } from "./rest/api-generator";
import { PostgresDataSourceDelegate } from "../services/dataSourceDelegate";
import { ApiConfig } from "./types";

/**
 * Simplified API server that leverages existing FireCMS infrastructure
 * Can be used standalone or mounted on existing Express app
 */
export class FireCMSApiServer {
    private app: Express;
    private router: Router;
    private config: ApiConfig;
    private dataSource: PostgresDataSourceDelegate;

    constructor(config: ApiConfig & { dataSource: PostgresDataSourceDelegate }) {
        this.config = {
            basePath: '/api',
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
        this.router.use(express.json({ limit: '10mb' }));
        this.router.use(express.urlencoded({ extended: true }));

        // Auth middleware - only for our routes
        if (this.config.auth?.enabled) {
            this.router.use(async (req: Request, res: Response, next) => {
                if (this.config.auth?.validator) {
                    try {
                        const authResult = await this.config.auth.validator(req);
                        if (authResult) {
                            (req as any).user = typeof authResult === 'object' ? authResult : true;
                        }
                    } catch (error) {
                        return res.status(401).json({ error: { message: 'Unauthorized' } });
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
                status: 'healthy',
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

            this.router.use(`${basePath}/graphql`, createHandler({
                schema,
                graphiql: process.env.NODE_ENV !== 'production',
                context: (req: Request) => ({
                    user: (req as any).user,
                    dataSource: this.dataSource
                })
            }));
        }

        // REST API endpoints - uses existing DataSourceDelegate
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

        // Mount all routes on the main app
        this.app.use(this.router);
    }

    /**
     * Generate OpenAPI specification for the REST API
     */
    private generateOpenApiSpec(): any {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'FireCMS Auto-Generated API',
                version: '1.0.0',
                description: 'Automatically generated REST API from FireCMS collections'
            },
            servers: [
                {
                    url: this.config.basePath,
                    description: 'API Server'
                }
            ],
            paths: {} as any,
            components: {
                schemas: {} as any
            }
        };

        this.config.collections.forEach(collection => {
            spec.components.schemas[collection.singularName || collection.name] = {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    ...Object.entries(collection.properties).reduce((props, [key, property]) => {
                        if (property.type !== 'relation') {
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
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                        { name: 'where', in: 'query', schema: { type: 'string' } },
                        { name: 'orderBy', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: {
                        200: {
                            description: 'Success',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
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
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${collection.singularName}` }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Created',
                            content: {
                                'application/json': {
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
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: {
                            description: 'Success',
                            content: {
                                'application/json': {
                                    schema: { $ref: `#/components/schemas/${collection.singularName}` }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: `Update ${collection.singularName}`,
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${collection.singularName}` }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Updated',
                            content: {
                                'application/json': {
                                    schema: { $ref: `#/components/schemas/${collection.singularName}` }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: `Delete ${collection.singularName}`,
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        204: { description: 'Deleted' }
                    }
                }
            };
        });

        return spec;
    }

    private convertPropertyToOpenApiType(property: any): any {
        switch (property.type) {
            case 'string':
                return { type: 'string' };
            case 'number':
                return { type: 'number' };
            case 'boolean':
                return { type: 'boolean' };
            case 'date':
                return { type: 'string', format: 'date-time' };
            case 'array':
                return { type: 'array', items: { type: 'string' } };
            default:
                return { type: 'string' };
        }
    }

    /**
     * Get Express app instance (for standalone use or mounting)
     */
    getApp(): Express {
        return this.app;
    }

    /**
     * Get Router instance (for mounting on existing app)
     */
    getRouter(): Router {
        return this.router;
    }

    /**
     * Start the server (standalone mode)
     */
    listen(port: number = 3000, callback?: () => void): void {
        this.app.listen(port, callback);
    }
}
