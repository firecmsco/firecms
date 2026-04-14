import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import * as path from "path";
import * as fs from "fs";

/**
 * Configuration for serving a Single Page Application
 */
export interface ServeSPAConfig {
    /**
     * Absolute path to the frontend build directory
     * @example path.join(__dirname, "../../frontend/dist")
     */
    frontendPath: string;

    /**
     * Base path for API routes (default: "/api")
     * Requests to this path will be passed through to API handlers
     */
    apiBasePath?: string;

    /**
     * Additional paths to exclude from SPA handling
     * These paths will be passed through to other handlers
     * @example ["/health", "/ws", "/metrics"]
     */
    excludePaths?: string[];

    /**
     * Index file to serve for SPA routes (default: "index.html")
     */
    indexFile?: string;
}

/**
 * Serve a Single Page Application from an Hono app.
 */
export function serveSPA(app: Hono<any>, config: ServeSPAConfig): void {
    const {
        frontendPath,
        apiBasePath = "/api",
        excludePaths = [],
        indexFile = "index.html"
    } = config;

    // Validate frontend path exists
    if (!fs.existsSync(frontendPath)) {
        console.warn(`⚠️ Frontend build path does not exist: ${frontendPath}`);
        console.warn("   SPA serving is disabled. Build your frontend first.");
        return;
    }

    // Serve static files from frontend build
    app.use("/*", serveStatic({
        root: path.relative(process.cwd(), frontendPath)
    }));

    // Build list of paths to exclude from SPA handling
    const allExcludePaths = [apiBasePath, ...excludePaths];

    // SPA fallback - serve index.html for all non-excluded routes
    app.get("*", async (c, next) => {
        // Skip excluded paths (API, health checks, etc.)
        if (allExcludePaths.some(p => c.req.path.startsWith(p))) {
            return next();
        }

        const indexPath = path.join(frontendPath, indexFile);

        if (!fs.existsSync(indexPath)) {
            console.warn(`⚠️ Index file not found: ${indexPath}`);
            return next();
        }

        const html = fs.readFileSync(indexPath, "utf-8");
        return c.html(html);
    });

    console.log(`✅ SPA serving enabled from: ${frontendPath}`);
}

