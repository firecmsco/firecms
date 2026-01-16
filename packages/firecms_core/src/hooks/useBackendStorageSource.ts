/**
 * React hook for using backend storage API as a StorageSource
 */

import { useMemo, useCallback } from 'react';
import {
    StorageSource,
    UploadFileProps,
    UploadFileResult,
    DownloadConfig,
    StorageListResult
} from '@firecms/types';

export interface BackendStorageSourceProps {
    /**
     * Backend API URL (e.g., 'http://localhost:3001')
     */
    apiUrl: string;
    /**
     * Function to get the current auth token
     */
    getAuthToken: () => Promise<string>;
}

/**
 * Hook to create a StorageSource that uses the backend storage REST API.
 * Use this for self-hosted FireCMS with local or S3 storage.
 *
 * @example
 * ```tsx
 * const storageSource = useBackendStorageSource({
 *     apiUrl: 'http://localhost:3001',
 *     getAuthToken: authController.getAuthToken
 * });
 *
 * // Then pass to FireCMS:
 * <FireCMS storageSource={storageSource} ... />
 * ```
 */
export function useBackendStorageSource({
    apiUrl,
    getAuthToken
}: BackendStorageSourceProps): StorageSource {

    const storageBasePath = `${apiUrl}/api/storage`;

    // Cache for download URLs to avoid redundant API calls
    const urlsCache = useMemo(() => new Map<string, DownloadConfig>(), []);

    /**
     * Make an authenticated request to the storage API
     */
    const fetchWithAuth = useCallback(async (
        url: string,
        options: RequestInit = {}
    ): Promise<Response> => {
        const token = await getAuthToken();
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });
    }, [getAuthToken]);

    /**
     * Upload a file to storage
     */
    const uploadFile = useCallback(async ({
        file,
        fileName,
        path,
        metadata,
        bucket
    }: UploadFileProps): Promise<UploadFileResult> => {
        const formData = new FormData();
        formData.append('file', file);

        if (fileName) {
            formData.append('fileName', fileName);
        }
        if (path) {
            formData.append('path', path);
        }
        if (bucket) {
            formData.append('bucket', bucket);
        }

        // Add metadata fields with prefix
        if (metadata) {
            for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined && value !== null) {
                    formData.append(
                        `metadata_${key}`,
                        typeof value === 'string' ? value : JSON.stringify(value)
                    );
                }
            }
        }

        const response = await fetchWithAuth(`${storageBasePath}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();
        return result.data;
    }, [fetchWithAuth, storageBasePath]);

    /**
     * Get download URL for a file
     */
    const getDownloadURL = useCallback(async (
        pathOrUrl: string,
        bucket?: string
    ): Promise<DownloadConfig> => {
        // Check cache first
        const cacheKey = bucket ? `${bucket}/${pathOrUrl}` : pathOrUrl;
        const cached = urlsCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Build the file path for the API
        let filePath = pathOrUrl;

        // Handle local:// and s3:// URLs
        if (pathOrUrl.startsWith('local://') || pathOrUrl.startsWith('s3://')) {
            const withoutProtocol = pathOrUrl.substring(pathOrUrl.indexOf('://') + 3);
            filePath = withoutProtocol;
        }

        // If bucket is provided separately, prepend it
        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        const response = await fetchWithAuth(`${storageBasePath}/metadata/${filePath}`);

        if (response.status === 404) {
            return {
                url: null,
                fileNotFound: true
            };
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to get download URL' }));
            throw new Error(error.error || 'Failed to get download URL');
        }

        const result = await response.json();

        // The URL should point to the storage file endpoint
        const downloadConfig: DownloadConfig = {
            url: `${storageBasePath}/file/${filePath}`,
            metadata: result.data
        };

        // Cache the result
        urlsCache.set(cacheKey, downloadConfig);

        return downloadConfig;
    }, [fetchWithAuth, storageBasePath, urlsCache]);

    /**
     * Get file as a File object
     */
    const getFile = useCallback(async (
        path: string,
        bucket?: string
    ): Promise<File | null> => {
        let filePath = path;

        // Handle protocol URLs
        if (path.startsWith('local://') || path.startsWith('s3://')) {
            const withoutProtocol = path.substring(path.indexOf('://') + 3);
            filePath = withoutProtocol;
        }

        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        const response = await fetchWithAuth(`${storageBasePath}/file/${filePath}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Failed to get file');
        }

        const blob = await response.blob();
        const fileName = filePath.split('/').pop() || 'file';
        return new File([blob], fileName, { type: blob.type });
    }, [fetchWithAuth, storageBasePath]);

    /**
     * Delete a file
     */
    const deleteFile = useCallback(async (
        path: string,
        bucket?: string
    ): Promise<void> => {
        let filePath = path;

        // Handle protocol URLs
        if (path.startsWith('local://') || path.startsWith('s3://')) {
            const withoutProtocol = path.substring(path.indexOf('://') + 3);
            filePath = withoutProtocol;
        }

        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        const response = await fetchWithAuth(`${storageBasePath}/file/${filePath}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 404) {
            const error = await response.json().catch(() => ({ error: 'Failed to delete file' }));
            throw new Error(error.error || 'Failed to delete file');
        }

        // Clear from cache
        urlsCache.delete(bucket ? `${bucket}/${path}` : path);
    }, [fetchWithAuth, storageBasePath, urlsCache]);

    /**
     * List files in a path
     */
    const list = useCallback(async (
        path: string,
        options?: {
            bucket?: string;
            maxResults?: number;
            pageToken?: string;
        }
    ): Promise<StorageListResult> => {
        const params = new URLSearchParams();
        if (path) params.set('path', path);
        if (options?.bucket) params.set('bucket', options.bucket);
        if (options?.maxResults) params.set('maxResults', String(options.maxResults));
        if (options?.pageToken) params.set('pageToken', options.pageToken);

        const response = await fetchWithAuth(
            `${storageBasePath}/list?${params.toString()}`
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to list files' }));
            throw new Error(error.error || 'Failed to list files');
        }

        const result = await response.json();
        return result.data;
    }, [fetchWithAuth, storageBasePath]);

    // Return memoized StorageSource
    return useMemo<StorageSource>(() => ({
        uploadFile,
        getDownloadURL,
        getFile,
        deleteFile,
        list
    }), [uploadFile, getDownloadURL, getFile, deleteFile, list]);
}
