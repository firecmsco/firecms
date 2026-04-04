/**
 * Storage REST API routes using Hono
 */

import { Hono } from 'hono';
import * as fs from 'fs';
import { StorageController } from './types';
import { LocalStorageController } from './LocalStorageController';
import { requireAuth as jwtRequireAuth, optionalAuth } from '../auth/middleware';
import { ApiError } from '../api/errors';
import { HonoEnv } from '../api/types';

export interface StorageRoutesConfig {
    controller: StorageController;
    /** Base path for storage routes (default: '/api/storage') */
    basePath?: string;
    /** Require authentication for write operations (default: true) */
    requireAuth?: boolean;
    /** Allow unauthenticated read access to stored files (default: false).
     *  When false and requireAuth is true, reads also require authentication. */
    publicRead?: boolean;
}

/**
 * Create storage REST API routes
 */
export function createStorageRoutes(config: StorageRoutesConfig): Hono<HonoEnv> {
    const router = new Hono<HonoEnv>();
    const { controller, requireAuth = true, publicRead = false } = config;

    // Use actual JWT auth middleware from auth module
    const writeAuthMiddleware = requireAuth ? jwtRequireAuth : optionalAuth;

    // For read operations: respect publicRead config.
    const readAuthMiddleware = (publicRead || !requireAuth) ? optionalAuth : jwtRequireAuth;

    /**
     * Parse bucket and path from a combined file path.
     */
    const parseBucketAndPath = (filePath: string): { bucket: string; resolvedPath: string } => {
        const parts = filePath.split('/');

        // Only recognize 'default' as an explicit bucket prefix
        if (parts.length > 1 && parts[0].toLowerCase() === 'default') {
            return {
                bucket: 'default',
                resolvedPath: parts.slice(1).join('/')
            };
        }

        // All other paths use 'default' bucket with the full path
        return {
            bucket: 'default',
            resolvedPath: filePath
        };
    };

    /**
     * POST /upload - Upload a file
     * Body: multipart/form-data with 'file' field
     * Request body can also contain metadata keys 'metadata_*'
     */
    router.post('/upload', writeAuthMiddleware, async (c) => {
        const body = await c.req.parseBody();
        const uploadedFile = body['file'];

        if (!uploadedFile || typeof uploadedFile === 'string') {
            throw ApiError.badRequest('No file provided');
        }

        const storagePath = typeof body['path'] === 'string' ? body['path'] : '';
        const bucket = typeof body['bucket'] === 'string' ? body['bucket'] : undefined;
        let fileName = typeof body['fileName'] === 'string' ? body['fileName'] : undefined;
        
        if (!fileName) {
            fileName = uploadedFile.name;
        }

        // Extract custom metadata from request body
        const metadata: Record<string, any> = {};
        for (const [key, value] of Object.entries(body)) {
            if (key.startsWith('metadata_')) {
                metadata[key.replace('metadata_', '')] = value;
            }
        }

        const result = await controller.uploadFile({
            file: uploadedFile,
            fileName: fileName || 'unnamed',
            path: storagePath,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
            bucket
        });

        return c.json({
            success: true,
            data: result
        }, 201);
    });

    /**
     * GET /file/* - Download/serve a file
     * Path: /file/{bucket}/{path} or /file/{path}
     */
    router.get('/file/*', readAuthMiddleware, async (c) => {
        const rawPath = c.req.path.replace(new RegExp(`^.*/file/`), '');
        if (!rawPath) {
            throw ApiError.badRequest('File path required');
        }

        const filePath = decodeURIComponent(rawPath);

        // For local storage, serve the file directly
        if (controller.getType() === 'local') {
            const localController = controller as LocalStorageController;
            const { bucket, resolvedPath } = parseBucketAndPath(filePath);

            const absolutePath = localController.getAbsolutePath(resolvedPath, bucket);

            // Check if file exists
            if (!fs.existsSync(absolutePath)) {
                throw ApiError.notFound('File not found');
            }

            // Get content type from metadata or infer from extension
            let contentType = 'application/octet-stream';
            const metadataPath = `${absolutePath}.metadata.json`;
            if (fs.existsSync(metadataPath)) {
                try {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
                    contentType = metadata.contentType || contentType;
                } catch {
                    // Ignore metadata errors
                }
            }

            c.header('Content-Type', contentType);
            // In a better scenario, we should pipe the stream instead of reading whole file
            const fileContent = fs.readFileSync(absolutePath);
            return c.body(fileContent as any); 
        }

        // For S3 storage, redirect to signed URL
        const downloadConfig = await controller.getDownloadURL(filePath);
        if (downloadConfig.fileNotFound || !downloadConfig.url) {
            throw ApiError.notFound('File not found');
        }

        return c.redirect(downloadConfig.url);
    });

    /**
     * GET /metadata/* - Get file metadata
     */
    router.get('/metadata/*', readAuthMiddleware, async (c) => {
        const rawPath = c.req.path.replace(new RegExp(`^.*/metadata/`), '');
        if (!rawPath) {
            throw ApiError.badRequest('File path required');
        }

        const filePath = decodeURIComponent(rawPath);
        const { bucket, resolvedPath } = parseBucketAndPath(filePath);

        const downloadConfig = await controller.getDownloadURL(resolvedPath, bucket);

        if (downloadConfig.fileNotFound) {
            throw ApiError.notFound('File not found');
        }

        return c.json({
            success: true,
            data: downloadConfig.metadata
        });
    });

    /**
     * DELETE /file/* - Delete a file
     */
    router.delete('/file/*', writeAuthMiddleware, async (c) => {
        const rawPath = c.req.path.replace(new RegExp(`^.*/file/`), '');
        if (!rawPath) {
            throw ApiError.badRequest('File path required');
        }

        const filePath = decodeURIComponent(rawPath);
        const { bucket, resolvedPath } = parseBucketAndPath(filePath);

        await controller.deleteFile(resolvedPath, bucket);

        return c.json({
            success: true,
            message: 'File deleted'
        });
    });

    /**
     * GET /list - List files in a path
     */
    router.get('/list', writeAuthMiddleware, async (c) => {
        const storagePath = c.req.query('path') || '';
        const bucket = c.req.query('bucket');
        const maxResults = c.req.query('maxResults');
        const pageToken = c.req.query('pageToken');

        const result = await controller.list(
            storagePath,
            {
                bucket,
                maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
                pageToken
            }
        );

        return c.json({
            success: true,
            data: result
        });
    });

    return router;
}
