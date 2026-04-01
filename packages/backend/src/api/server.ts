import express, { Express, Request, Response, Router, RequestHandler, NextFunction } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import cors from "cors";
import { GraphQLSchemaGenerator } from "./graphql/graphql-schema-generator";
import { RestApiGenerator } from "./rest/api-generator";
import { DataDriver, EntityCollection } from "@rebasepro/types";
import { ApiConfig, RebaseRequest } from "./types";
import * as fs from "fs";
import * as path from "path";
import { loadCollectionsFromDirectory } from "../collections/loader";
import { createSchemaEditorRoutes } from "./schema-editor-routes";
import { PostgresDataDriver } from "../services/postgresDataDriver";
import { createAuthMiddleware, requireAuth, requireAdmin } from "../auth/middleware";
import { errorHandler } from "./errors";
import { generateOpenApiSpec } from "./openapi-generator";
/**
 * Simplified API server that leverages existing Rebase infrastructure
 * Can be used standalone or mounted on existing Express app
 */
export class RebaseApiServer {
    private app: Express;
    private router: Router;
    private config: ApiConfig;
    private driver: DataDriver;

    private constructor(config: ApiConfig & { driver: DataDriver }) {
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

        this.driver = config.driver;

        this.app = express();
        this.router = Router();
        this.setupMiddleware();
        // Setup routes is now called in the factory
    }

    /**
     * Factory method to create an asynchronously initialized ApiServer instance
     */
    public static async create(config: ApiConfig & { driver: DataDriver }): Promise<RebaseApiServer> {
        // Auto-discover collections if a directory is provided and collections aren't explicitly passed
        if (config.collectionsDir && (!config.collections || config.collections.length === 0)) {
            config.collections = await loadCollectionsFromDirectory(config.collectionsDir);
        } else if (!config.collections) {
            config.collections = [];
        }

        const server = new RebaseApiServer(config);
        server.setupRoutes();
        server.app.use(server.router);
        return server;
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

        // Auth middleware - delegates to canonical createAuthMiddleware()
        this.router.use(createAuthMiddleware({
            driver: this.driver,
            requireAuth: this.config.requireAuth ?? true
        }));
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
                collections: this.config.collections?.map(c => c.slug) || [],
                driver: this.driver.key
            });
        });

        // Collections metadata endpoint
        this.router.get(`${basePath}/collections`, (req: Request, res: Response) => {
            const collectionsMetadata = (this.config.collections || []).map(collection => ({
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

        // GraphQL endpoint - uses existing DataDriver
        if (this.config.enableGraphQL) {
            const schemaGenerator = new GraphQLSchemaGenerator(this.config.collections || [], this.driver);
            const schema = schemaGenerator.generateSchema();

            const graphQLHandler = createHandler({
                schema,
                context: (req: unknown) => ({
                    user: (req as RebaseRequest).user,
                    driver: (req as RebaseRequest).driver || this.driver
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
  <title>Rebase GraphiQL</title>
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
            const restGenerator = new RestApiGenerator(this.config.collections || [], this.driver);
            const restRoutes = restGenerator.generateRoutes();
            this.router.use(basePath, restRoutes);
        }

        // Schema Editor (AST Generation) endpoints
        if (this.config.collectionsDir) {
            if (process.env.NODE_ENV === "production") {
                console.warn("[RebaseApiServer] Schema Editor is disabled in production environments for security.");
            } else {
                const schemaEditorRoutes = createSchemaEditorRoutes(this.config.collectionsDir);
                this.router.use(`${basePath}/schema-editor`, requireAuth, requireAdmin, schemaEditorRoutes);
            }
        }

        // OpenAPI/Swagger documentation endpoint
        this.router.get(`${basePath}/docs`, (req: Request, res: Response) => {
            const openApiSpec = generateOpenApiSpec(this.config.collections || [], this.config.basePath);
            res.json(openApiSpec);
        });

        // Simple Swagger UI
        this.router.get(`${basePath}/swagger`, (req: Request, res: Response) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rebase API Documentation</title>
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
        this.router.use(errorHandler);
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
