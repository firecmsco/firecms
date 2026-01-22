import { Express, Request, Response, NextFunction } from "express";
import express from "express";
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
 * Serve a Single Page Application from an Express app.
 * 
 * This helper:
 * - Serves static files from the frontend build directory
 * - Returns index.html for all non-API routes (SPA client-side routing)
 * - Automatically skips API routes and configurable exclusion paths
 * 
 * @example
 * ```typescript
 * import { serveSPA } from "@firecms/backend";
 * 
 * // After initializing backend and API...
 * serveSPA(app, {
 *     frontendPath: path.join(__dirname, "../../frontend/dist"),
 *     excludePaths: ["/health", "/ws"]
 * });
 * ```
 * 
 * @param app Express application instance
 * @param config SPA configuration
 */
export function serveSPA(app: Express, config: ServeSPAConfig): void {
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
    app.use(express.static(frontendPath));

    // Build list of paths to exclude from SPA handling
    const allExcludePaths = [apiBasePath, ...excludePaths];

    // SPA fallback - serve index.html for all non-excluded routes
    app.get("*", (req: Request, res: Response, next: NextFunction) => {
        // Skip excluded paths (API, health checks, etc.)
        if (allExcludePaths.some(p => req.path.startsWith(p))) {
            return next();
        }

        const indexPath = path.join(frontendPath, indexFile);

        if (!fs.existsSync(indexPath)) {
            console.warn(`⚠️ Index file not found: ${indexPath}`);
            return next();
        }

        res.sendFile(indexPath);
    });

    console.log(`✅ SPA serving enabled from: ${frontendPath}`);
}
