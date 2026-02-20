/**
 * Local filesystem storage controller
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import {
    StorageController,
    LocalStorageConfig,
    DEFAULT_MAX_FILE_SIZE
} from './types';
import {
    UploadFileProps,
    UploadFileResult,
    DownloadConfig,
    DownloadMetadata,
    StorageListResult,
    StorageReference
} from '@firecms/types';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const access = promisify(fs.access);

/**
 * Remove initial and trailing slashes from a path.
 * Handles paths like "/images/", "images/", "/images" → "images"
 */
function normalizeStoragePath(s: string): string {
    let result = s;
    while (result.startsWith('/')) {
        result = result.slice(1);
    }
    while (result.endsWith('/')) {
        result = result.slice(0, -1);
    }
    return result;
}

/**
 * Local filesystem storage implementation
 * Stores files in a directory structure: {basePath}/{bucket}/{path}
 */
export class LocalStorageController implements StorageController {
    private config: LocalStorageConfig;
    private basePath: string;

    constructor(config: LocalStorageConfig) {
        this.config = config;
        this.basePath = path.resolve(config.basePath);
    }

    getType(): 'local' {
        return 'local';
    }

    /**
     * Ensure directory exists, creating it if necessary
     */
    private async ensureDir(dirPath: string): Promise<void> {
        try {
            await mkdir(dirPath, { recursive: true });
        } catch (error: any) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    /**
     * Get the full filesystem path for a storage path
     */
    private getFullPath(storagePath: string, bucket?: string): string {
        const parts = bucket ? [this.basePath, bucket, storagePath] : [this.basePath, storagePath];
        return path.join(...parts);
    }

    /**
     * Validate file before upload
     */
    private validateFile(file: File): void {
        const maxSize = this.config.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
        if (file.size > maxSize) {
            throw new Error(`File size ${file.size} exceeds maximum allowed size ${maxSize}`);
        }

        if (this.config.allowedMimeTypes && this.config.allowedMimeTypes.length > 0) {
            if (!this.config.allowedMimeTypes.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
            }
        }
    }

    async uploadFile({
        file,
        fileName,
        path: storagePath,
        metadata,
        bucket
    }: UploadFileProps): Promise<UploadFileResult> {
        this.validateFile(file);

        // Always use a bucket (default to 'default')
        const usedBucket = bucket ?? 'default';
        const usedFileName = fileName ?? file.name;
        // Normalize storage path to remove leading/trailing slashes
        const normalizedPath = storagePath ? normalizeStoragePath(storagePath) : '';
        const fullStoragePath = normalizedPath ? `${normalizedPath}/${usedFileName}` : usedFileName;
        const fullPath = this.getFullPath(fullStoragePath, usedBucket);

        // Ensure parent directory exists
        await this.ensureDir(path.dirname(fullPath));

        // Convert File to Buffer and write
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(fullPath, buffer);

        // Always save metadata file with at least contentType (required for preview)
        const metadataPath = `${fullPath}.metadata.json`;
        await writeFile(metadataPath, JSON.stringify({
            ...(metadata || {}),
            contentType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString()
        }, null, 2));

        return {
            path: fullStoragePath,
            bucket: usedBucket,
            storageUrl: `local://${usedBucket}/${fullStoragePath}`
        };
    }

    async getDownloadURL(storagePath: string, bucket?: string): Promise<DownloadConfig> {
        // Handle local:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = bucket;

        if (storagePath.startsWith('local://')) {
            const withoutProtocol = storagePath.substring('local://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        // Normalize path to handle leading/trailing slashes
        resolvedPath = normalizeStoragePath(resolvedPath);
        const fullPath = this.getFullPath(resolvedPath, resolvedBucket);

        try {
            await access(fullPath, fs.constants.R_OK);
        } catch {
            return {
                url: null,
                fileNotFound: true
            };
        }

        // Read metadata if available
        let metadata: DownloadMetadata | undefined;
        const metadataPath = `${fullPath}.metadata.json`;
        try {
            const metadataContent = await readFile(metadataPath, 'utf-8');
            const savedMetadata = JSON.parse(metadataContent);
            const fileStat = await stat(fullPath);

            metadata = {
                bucket: resolvedBucket ?? 'default',
                fullPath: resolvedPath,
                name: path.basename(resolvedPath),
                size: fileStat.size,
                contentType: savedMetadata.contentType || 'application/octet-stream',
                customMetadata: savedMetadata
            };
        } catch {
            // No metadata file, create basic metadata from stat
            try {
                const fileStat = await stat(fullPath);
                metadata = {
                    bucket: resolvedBucket ?? 'default',
                    fullPath: resolvedPath,
                    name: path.basename(resolvedPath),
                    size: fileStat.size,
                    contentType: 'application/octet-stream',
                    customMetadata: {}
                };
            } catch {
                // Stat failed
            }
        }

        // Return a relative URL that will be served by the storage routes
        const bucketPath = resolvedBucket ? `${resolvedBucket}/` : '';
        const url = `/api/storage/file/${bucketPath}${resolvedPath}`;

        return {
            url,
            metadata
        };
    }

    async getFile(storagePath: string, bucket?: string): Promise<File | null> {
        // Handle local:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = bucket;

        if (storagePath.startsWith('local://')) {
            const withoutProtocol = storagePath.substring('local://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        // Normalize path to handle leading/trailing slashes
        resolvedPath = normalizeStoragePath(resolvedPath);
        const fullPath = this.getFullPath(resolvedPath, resolvedBucket);

        try {
            await access(fullPath, fs.constants.R_OK);
            const buffer = await readFile(fullPath);

            // Try to get content type from metadata
            let contentType = 'application/octet-stream';
            try {
                const metadataPath = `${fullPath}.metadata.json`;
                const metadataContent = await readFile(metadataPath, 'utf-8');
                const metadata = JSON.parse(metadataContent);
                contentType = metadata.contentType || contentType;
            } catch {
                // No metadata, use default content type
            }

            const blob = new Blob([buffer], { type: contentType });
            return new File([blob], path.basename(resolvedPath), { type: contentType });
        } catch {
            return null;
        }
    }

    async deleteFile(storagePath: string, bucket?: string): Promise<void> {
        // Handle local:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = bucket;

        if (storagePath.startsWith('local://')) {
            const withoutProtocol = storagePath.substring('local://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        // Normalize path to handle leading/trailing slashes
        resolvedPath = normalizeStoragePath(resolvedPath);
        const fullPath = this.getFullPath(resolvedPath, resolvedBucket);

        try {
            await unlink(fullPath);
            // Also delete metadata file if exists
            try {
                await unlink(`${fullPath}.metadata.json`);
            } catch {
                // Metadata file might not exist
            }
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // File doesn't exist, nothing to delete
        }
    }

    async list(storagePath: string, options?: {
        bucket?: string;
        maxResults?: number;
        pageToken?: string;
    }): Promise<StorageListResult> {
        // Normalize path to handle leading/trailing slashes
        const normalizedPath = normalizeStoragePath(storagePath);
        const fullPath = this.getFullPath(normalizedPath, options?.bucket);
        const items: StorageReference[] = [];
        const prefixes: StorageReference[] = [];

        try {
            await access(fullPath, fs.constants.R_OK);
            const entries = await readdir(fullPath, { withFileTypes: true });

            let count = 0;
            const maxResults = options?.maxResults ?? 1000;
            const startIndex = options?.pageToken ? parseInt(options.pageToken, 10) : 0;

            for (let i = startIndex; i < entries.length && count < maxResults; i++) {
                const entry = entries[i];

                // Skip metadata files
                if (entry.name.endsWith('.metadata.json')) {
                    continue;
                }

                const entryPath = storagePath ? `${storagePath}/${entry.name}` : entry.name;
                const bucket = options?.bucket ?? 'default';

                const ref: StorageReference = {
                    bucket,
                    fullPath: entryPath,
                    name: entry.name,
                    parent: null as never, // Simplified - not fully implementing parent chain
                    root: null as never,
                    toString: () => `local://${bucket}/${entryPath}`
                };

                if (entry.isDirectory()) {
                    prefixes.push(ref);
                } else {
                    items.push(ref);
                }
                count++;
            }

            const nextPageToken = startIndex + count < entries.length
                ? String(startIndex + count)
                : undefined;

            return {
                items,
                prefixes,
                nextPageToken
            };
        } catch (error: any) {
            if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
                return { items: [], prefixes: [] };
            }
            throw error;
        }
    }

    /**
     * Get the absolute filesystem path for serving files
     * Used by the storage routes to serve files directly
     */
    getAbsolutePath(storagePath: string, bucket?: string): string {
        return this.getFullPath(storagePath, bucket);
    }

    /**
     * Get the base path for the storage
     */
    getBasePath(): string {
        return this.basePath;
    }
}
