/**
 * Storage REST API routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { StorageController } from './types';
import { LocalStorageController } from './LocalStorageController';
import { requireAuth as jwtRequireAuth, optionalAuth } from '../auth/middleware';

export interface StorageRoutesConfig {
    controller: StorageController;
    /** Base path for storage routes (default: '/api/storage') */
    basePath?: string;
    /** Require authentication for all storage operations (default: true) */
    requireAuth?: boolean;
}

/**
 * Create storage REST API routes
 */
export function createStorageRoutes(config: StorageRoutesConfig): Router {
    const router = Router();
    const { controller, requireAuth = true } = config;

    // Configure multer for file uploads (memory storage for flexibility)
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB default, controller will also validate
        }
    });

    // Use actual JWT auth middleware from auth module
    // If requireAuth is true, use requireAuth middleware (returns 401 if not authenticated)
    // If requireAuth is false, use optionalAuth (allows anonymous access but still extracts user if present)
    const writeAuthMiddleware = requireAuth ? jwtRequireAuth : optionalAuth;

    // For read operations (GET file), allow public access by default (like Firebase Storage)
    // This allows images to be displayed without needing auth headers
    // If you need private files, set publicRead: false in config
    const readAuthMiddleware = optionalAuth;

    /**
     * Parse bucket and path from a combined file path.
     * Only 'default' is recognized as an explicit bucket prefix.
     * All other paths are treated as file paths within the 'default' bucket.
     * 
     * Examples:
     *   'default/images/photo.jpg' → bucket='default', path='images/photo.jpg'
     *   'author_pictures/photo.jpg' → bucket='default', path='author_pictures/photo.jpg'
     *   'images/photo.jpg' → bucket='default', path='images/photo.jpg'
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
     * Query params: path (optional), bucket (optional)
     */
    router.post('/upload', writeAuthMiddleware, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }

            const { path: storagePath, bucket, fileName } = req.body;

            // Convert multer file to browser File-like object
            // Use Uint8Array for browser compatibility
            const file = new File(
                [new Uint8Array(req.file.buffer)],
                fileName || req.file.originalname,
                { type: req.file.mimetype }
            );

            // Extract custom metadata from request body
            const metadata: Record<string, any> = {};
            for (const [key, value] of Object.entries(req.body)) {
                if (key.startsWith('metadata_')) {
                    metadata[key.replace('metadata_', '')] = value;
                }
            }

            const result = await controller.uploadFile({
                file,
                fileName: fileName || req.file.originalname,
                path: storagePath || '',
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                bucket
            });

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(400).json({
                error: error.message || 'Upload failed'
            });
        }
    });

    /**
     * GET /file/:filePath - Download/serve a file
     * Path: /file/{bucket}/{path} or /file/{path}
     * Note: Uses :filePath(*) for Express 5 compatibility
     */
    router.get('/file/*filePath', readAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
        try {
            // Ensure filePath is a string (Express 5 may return string[])
            const rawPath = req.params.filePath;
            const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
            if (!filePath) {
                res.status(400).json({ error: 'File path required' });
                return;
            }

            // For local storage, serve the file directly
            if (controller.getType() === 'local') {
                const localController = controller as LocalStorageController;
                const { bucket, resolvedPath } = parseBucketAndPath(filePath);

                const absolutePath = localController.getAbsolutePath(resolvedPath, bucket);

                // Check if file exists
                if (!fs.existsSync(absolutePath)) {
                    res.status(404).json({ error: 'File not found' });
                    return;
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

                res.setHeader('Content-Type', contentType);
                res.sendFile(absolutePath);
                return;
            }

            // For S3 storage, redirect to signed URL
            const downloadConfig = await controller.getDownloadURL(filePath);
            if (downloadConfig.fileNotFound || !downloadConfig.url) {
                res.status(404).json({ error: 'File not found' });
                return;
            }

            res.redirect(downloadConfig.url);
        } catch (error: any) {
            console.error('File retrieval error:', error);
            res.status(500).json({
                error: error.message || 'Failed to retrieve file'
            });
        }
    });

    /**
     * GET /metadata/:filePath - Get file metadata
     * Path: /metadata/{bucket}/{path} or /metadata/{path}
     */
    router.get('/metadata/*filePath', readAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
        try {
            // Ensure filePath is a string (Express 5 may return string[])
            const rawPath = req.params.filePath;
            const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
            if (!filePath) {
                res.status(400).json({ error: 'File path required' });
                return;
            }

            const { bucket, resolvedPath } = parseBucketAndPath(filePath);

            const downloadConfig = await controller.getDownloadURL(resolvedPath, bucket);

            if (downloadConfig.fileNotFound) {
                res.status(404).json({ error: 'File not found' });
                return;
            }

            res.json({
                success: true,
                data: downloadConfig.metadata
            });
        } catch (error: any) {
            console.error('Metadata error:', error);
            res.status(500).json({
                error: error.message || 'Failed to get metadata'
            });
        }
    });

    /**
     * DELETE /file/:filePath - Delete a file
     * Path: /file/{bucket}/{path} or /file/{path}
     */
    router.delete('/file/*filePath', writeAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
        try {
            // Ensure filePath is a string (Express 5 may return string[])
            const rawPath = req.params.filePath;
            const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
            if (!filePath) {
                res.status(400).json({ error: 'File path required' });
                return;
            }

            const { bucket, resolvedPath } = parseBucketAndPath(filePath);

            await controller.deleteFile(resolvedPath, bucket);

            res.json({
                success: true,
                message: 'File deleted'
            });
        } catch (error: any) {
            console.error('Delete error:', error);
            res.status(500).json({
                error: error.message || 'Failed to delete file'
            });
        }
    });

    /**
     * GET /list - List files in a path
     * Query params: path, bucket, maxResults, pageToken
     */
    router.get('/list', writeAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
        try {
            const { path: storagePath, bucket, maxResults, pageToken } = req.query;

            const result = await controller.list(
                (storagePath as string) || '',
                {
                    bucket: bucket as string | undefined,
                    maxResults: maxResults ? parseInt(maxResults as string, 10) : undefined,
                    pageToken: pageToken as string | undefined
                }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('List error:', error);
            res.status(500).json({
                error: error.message || 'Failed to list files'
            });
        }
    });

    return router;
}
