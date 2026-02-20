/**
 * S3-compatible storage controller (works with AWS S3 and MinIO)
 */

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    _Object,
    CommonPrefix
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    StorageController,
    S3StorageConfig,
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

/**
 * S3-compatible storage implementation
 * Works with AWS S3 and MinIO (with forcePathStyle option)
 */
export class S3StorageController implements StorageController {
    private config: S3StorageConfig;
    private client: S3Client;

    constructor(config: S3StorageConfig) {
        this.config = config;
        this.client = new S3Client({
            region: config.region || 'us-east-1',
            endpoint: config.endpoint,
            forcePathStyle: config.forcePathStyle ?? !!config.endpoint, // Auto-enable for custom endpoints (MinIO)
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
    }

    getType(): 's3' {
        return 's3';
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

    /**
     * Get the bucket name - either from parameter or config
     */
    private getBucket(bucket?: string): string {
        return bucket ?? this.config.bucket;
    }

    async uploadFile({
        file,
        fileName,
        path: storagePath,
        metadata,
        bucket
    }: UploadFileProps): Promise<UploadFileResult> {
        this.validateFile(file);

        const usedFileName = fileName ?? file.name;
        const key = storagePath ? `${storagePath}/${usedFileName}` : usedFileName;
        const usedBucket = this.getBucket(bucket);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const command = new PutObjectCommand({
            Bucket: usedBucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            Metadata: metadata ? this.flattenMetadata(metadata) : undefined
        });

        await this.client.send(command);

        return {
            path: key,
            bucket: usedBucket,
            storageUrl: `s3://${usedBucket}/${key}`
        };
    }

    /**
     * Flatten nested metadata to string values (S3 requirement)
     */
    private flattenMetadata(metadata: Record<string, any>): Record<string, string> {
        const flattened: Record<string, string> = {};
        for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'string') {
                flattened[key] = value;
            } else if (value !== undefined && value !== null) {
                flattened[key] = JSON.stringify(value);
            }
        }
        return flattened;
    }

    async getDownloadURL(storagePath: string, bucket?: string): Promise<DownloadConfig> {
        // Handle s3:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = this.getBucket(bucket);

        if (storagePath.startsWith('s3://')) {
            const withoutProtocol = storagePath.substring('s3://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        try {
            // First check if the object exists and get metadata
            const headCommand = new HeadObjectCommand({
                Bucket: resolvedBucket,
                Key: resolvedPath
            });

            const headResult = await this.client.send(headCommand);

            // Generate a signed URL
            const getCommand = new GetObjectCommand({
                Bucket: resolvedBucket,
                Key: resolvedPath
            });

            const expiresIn = this.config.signedUrlExpiration ?? 3600;
            const url = await getSignedUrl(this.client, getCommand, { expiresIn });

            const metadata: DownloadMetadata = {
                bucket: resolvedBucket,
                fullPath: resolvedPath,
                name: resolvedPath.split('/').pop() || resolvedPath,
                size: headResult.ContentLength || 0,
                contentType: headResult.ContentType || 'application/octet-stream',
                customMetadata: headResult.Metadata || {}
            };

            return {
                url,
                metadata
            };
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return {
                    url: null,
                    fileNotFound: true
                };
            }
            throw error;
        }
    }

    async getFile(storagePath: string, bucket?: string): Promise<File | null> {
        // Handle s3:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = this.getBucket(bucket);

        if (storagePath.startsWith('s3://')) {
            const withoutProtocol = storagePath.substring('s3://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        try {
            const command = new GetObjectCommand({
                Bucket: resolvedBucket,
                Key: resolvedPath
            });

            const response = await this.client.send(command);

            if (!response.Body) {
                return null;
            }

            // Convert stream to buffer
            const chunks: Uint8Array[] = [];
            // @ts-ignore - Body is a ReadableStream in Node.js
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            const contentType = response.ContentType || 'application/octet-stream';
            const fileName = resolvedPath.split('/').pop() || resolvedPath;

            const blob = new Blob([buffer], { type: contentType });
            return new File([blob], fileName, { type: contentType });
        } catch (error: any) {
            if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async deleteFile(storagePath: string, bucket?: string): Promise<void> {
        // Handle s3:// URLs
        let resolvedPath = storagePath;
        let resolvedBucket = this.getBucket(bucket);

        if (storagePath.startsWith('s3://')) {
            const withoutProtocol = storagePath.substring('s3://'.length);
            const firstSlash = withoutProtocol.indexOf('/');
            if (firstSlash > 0) {
                resolvedBucket = withoutProtocol.substring(0, firstSlash);
                resolvedPath = withoutProtocol.substring(firstSlash + 1);
            }
        }

        const command = new DeleteObjectCommand({
            Bucket: resolvedBucket,
            Key: resolvedPath
        });

        await this.client.send(command);
    }

    async list(storagePath: string, options?: {
        bucket?: string;
        maxResults?: number;
        pageToken?: string;
    }): Promise<StorageListResult> {
        const resolvedBucket = this.getBucket(options?.bucket);

        const command = new ListObjectsV2Command({
            Bucket: resolvedBucket,
            Prefix: storagePath || undefined,
            MaxKeys: options?.maxResults ?? 1000,
            ContinuationToken: options?.pageToken,
            Delimiter: '/' // This gives us folder-like behavior
        });

        const response = await this.client.send(command);

        const items: StorageReference[] = (response.Contents || []).map(obj => ({
            bucket: resolvedBucket,
            fullPath: obj.Key || '',
            name: (obj.Key || '').split('/').pop() || '',
            parent: null as never,
            root: null as never,
            toString: () => `s3://${resolvedBucket}/${obj.Key}`
        }));

        const prefixes: StorageReference[] = (response.CommonPrefixes || []).map(prefix => ({
            bucket: resolvedBucket,
            fullPath: prefix.Prefix || '',
            name: (prefix.Prefix || '').replace(/\/$/, '').split('/').pop() || '',
            parent: null as never,
            root: null as never,
            toString: () => `s3://${resolvedBucket}/${prefix.Prefix}`
        }));

        return {
            items,
            prefixes,
            nextPageToken: response.NextContinuationToken
        };
    }
}
