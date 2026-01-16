/**
 * Storage configuration and types for FireCMS backend
 */

import { StorageSource, UploadFileProps, UploadFileResult, DownloadConfig, StorageListResult, StorageReference } from "@firecms/types";

/**
 * Local filesystem storage configuration
 */
export interface LocalStorageConfig {
    type: 'local';
    /** Base directory for file storage (e.g., './uploads') */
    basePath: string;
    /** Maximum file size in bytes (default: 50MB) */
    maxFileSize?: number;
    /** Allowed MIME types (if not set, all types allowed) */
    allowedMimeTypes?: string[];
    /** Base URL for generating download URLs (default: auto-detected from request) */
    baseUrl?: string;
}

/**
 * S3-compatible storage configuration (works with AWS S3 and MinIO)
 */
export interface S3StorageConfig {
    type: 's3';
    /** S3 bucket name */
    bucket: string;
    /** AWS region (e.g., 'us-east-1') */
    region?: string;
    /** Custom endpoint URL (required for MinIO) */
    endpoint?: string;
    /** AWS access key ID */
    accessKeyId: string;
    /** AWS secret access key */
    secretAccessKey: string;
    /** Use path-style URLs (required for MinIO) */
    forcePathStyle?: boolean;
    /** Maximum file size in bytes (default: 50MB) */
    maxFileSize?: number;
    /** Allowed MIME types (if not set, all types allowed) */
    allowedMimeTypes?: string[];
    /** URL expiration time in seconds for signed URLs (default: 3600) */
    signedUrlExpiration?: number;
}

/**
 * Storage configuration - either local filesystem or S3-compatible
 */
export type StorageConfig = LocalStorageConfig | S3StorageConfig;

/**
 * Storage controller interface for backend implementations
 */
export interface StorageController {
    /**
     * Upload a file
     */
    uploadFile(props: UploadFileProps): Promise<UploadFileResult>;

    /**
     * Get a download URL for a file
     */
    getDownloadURL(path: string, bucket?: string): Promise<DownloadConfig>;

    /**
     * Get file as a File object
     */
    getFile(path: string, bucket?: string): Promise<File | null>;

    /**
     * Delete a file
     */
    deleteFile(path: string, bucket?: string): Promise<void>;

    /**
     * List files in a path
     */
    list(path: string, options?: {
        bucket?: string;
        maxResults?: number;
        pageToken?: string;
    }): Promise<StorageListResult>;

    /**
     * Get the storage configuration type
     */
    getType(): 'local' | 's3';
}

/**
 * Default maximum file size (50MB)
 */
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Common image MIME types
 */
export const IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
];

/**
 * Common document MIME types
 */
export const DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
];
