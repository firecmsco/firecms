import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { graphqlServer } from "@hono/graphql-server";
import { serve } from "@hono/node-server";
import { GraphQLSchemaGenerator } from "./graphql/graphql-schema-generator";
import { RestApiGenerator } from "./rest/api-generator";
import { DataDriver, EntityCollection } from "@rebasepro/types";
import { ApiConfig, HonoEnv } from "./types";
import { loadCollectionsFromDirectory } from "../collections/loader";
import { createSchemaEditorRoutes } from "./schema-editor-routes";
import { createAuthMiddleware, requireAuth, requireAdmin } from "../auth/middleware";
import { errorHandler } from "./errors";
import { generateOpenApiSpec } from "./openapi-generator";

/**
 * Simplified API server that leverages existing Rebase infrastructure
 * Can be used standalone or mounted on existing Hono app
 */
export class RebaseApiServer {
    private app: Hono<HonoEnv>;
    private router: Hono<HonoEnv>;
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

        this.app = new Hono<HonoEnv>();
        this.router = new Hono<HonoEnv>();
        
        this.setupMiddleware();
    }

    /**
     * Factory method to create an asynchronously initialized ApiServer instance
     */
    public static async create(config: ApiConfig & { driver: DataDriver }): Promise<RebaseApiServer> {
        if (config.collectionsDir && (!config.collections || config.collections.length === 0)) {
            config.collections = await loadCollectionsFromDirectory(config.collectionsDir);
        } else if (!config.collections) {
            config.collections = [];
        }

        const server = new RebaseApiServer(config);
        server.setupRoutes();
        // Since we mount routes directly to router, we can let consumer attach it
        server.app.route("/", server.router);
        
        // Hono global error handler on the root app
        server.app.onError(errorHandler);
        server.router.onError(errorHandler);

        return server;
    }

    /**
     * Setup Hono middleware
     */
    private setupMiddleware(): void {
        // Security headers
        this.router.use("/*", secureHeaders());

        // CORS
        const rawCors = this.config.cors as any;
        if (rawCors !== false && rawCors?.origin !== false) {
            const corsConfig: any = typeof rawCors === 'object' ? { ...rawCors } : {};
            
            // Translate Express `origin: true` to Hono origin reflection function
            if (corsConfig.origin === true) {
                // Return the requested origin directly
                corsConfig.origin = (origin: string) => origin;
            }
            
            this.router.use("/*", cors(Object.keys(corsConfig).length > 0 ? corsConfig : undefined));
        }

        // Auth middleware
        this.router.use("/*", createAuthMiddleware({
            driver: this.driver,
            requireAuth: this.config.requireAuth ?? true,
            validator: this.config.authValidator
        }));
    }

    /**
     * Setup API routes using existing services
     */
    private setupRoutes(): void {
        const basePath = this.config.basePath!;

        // Health check
        this.router.get(`${basePath}/health`, (c) => {
            return c.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                collections: this.config.collections?.map((col: any) => col.slug) || [],
                driver: this.driver.key
            });
        });

        // Collections metadata endpoint
        this.router.get(`${basePath}/collections`, (c) => {
            const collectionsMetadata = (this.config.collections || []).map((col: any) => ({
                slug: col.slug,
                name: col.name,
                singularName: col.singularName,
                description: col.description,
                dbPath: col.dbPath,
                properties: Object.keys(col.properties),
                relations: col.relations?.map((r: any) => ({
                    relationName: r.relationName,
                    target: r.target().slug,
                    cardinality: r.cardinality,
                    direction: r.direction
                })) || []
            }));

            return c.json({ data: collectionsMetadata });
        });

        // GraphQL endpoint
        if (this.config.enableGraphQL) {
            const schemaGenerator = new GraphQLSchemaGenerator(this.config.collections || [], this.driver);
            const schema = schemaGenerator.generateSchema();

            // Context is automatically passed to resolvers via contextValue containing Hono's 'c'
            this.router.use(`${basePath}/graphql`, graphqlServer({
                schema
            }));

            // Lightweight GraphiQL IDE
            if (process.env.NODE_ENV !== "production") {
                this.router.get(`${basePath}/graphiql`, (c) => {
                    return c.html(`<!DOCTYPE html>
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
            this.router.route(basePath, restRoutes);
        }

        // Schema Editor endpoints
        if (this.config.collectionsDir) {
            if (process.env.NODE_ENV === "production") {
                console.warn("[RebaseApiServer] Schema Editor is disabled in production environments for security.");
            } else {
                const schemaEditorRoutes = createSchemaEditorRoutes(this.config.collectionsDir);
                this.router.route(`${basePath}/schema-editor`, schemaEditorRoutes);
                // Auth middlewares applied to schema-editor via the router prefix
                this.router.use(`${basePath}/schema-editor/*`, requireAuth, requireAdmin);
            }
        }

        // OpenAPI endpoint
        this.router.get(`${basePath}/docs`, (c) => {
            const openApiSpec = generateOpenApiSpec(this.config.collections || [], this.config.basePath);
            return c.json(openApiSpec);
        });

        // Simple Swagger UI
        if (process.env.NODE_ENV !== "production") {
            this.router.get(`${basePath}/swagger`, (c) => {
                return c.html(`
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
        }
    }

    /**
     * Get the Hono router with all API routes
     */
    getRouter(): Hono<HonoEnv> {
        return this.router;
    }

    /**
     * Get the standalone Hono app
     */
    getApp(): Hono<HonoEnv> {
        return this.app;
    }

    /**
     * Start the server (standalone mode) via @hono/node-server
     */
    listen(port: number = 3000, callback?: () => void): void {
        serve({
            fetch: this.app.fetch,
            port
        }, () => {
            if (callback) callback();
        });
    }
}
