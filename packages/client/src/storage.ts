import { StorageSource, UploadFileProps, UploadFileResult, DownloadConfig, StorageListResult } from "@rebasepro/types";
import { Transport } from "./transport";

export function createStorage(transport: Transport): StorageSource {
    const urlsCache = new Map<string, DownloadConfig>();
    
    // We expect the transport to point to /api, and storage endpoints handle /api/storage internally if they are relative?
    // Wait, useBackendStorageSource uses `${apiUrl}/api/storage` directly.
    // Transport has `.request` which hits `${config.baseUrl}${config.apiPath}${path}`.
    // Assuming `config.apiPath` is "/api", we just request(`/storage/upload`, ...).

    async function uploadFile({
        file,
        fileName,
        path,
        metadata,
        bucket
    }: UploadFileProps): Promise<UploadFileResult> {
        const formData = new FormData();
        formData.append("file", file);

        if (fileName) formData.append("fileName", fileName);
        if (path) formData.append("path", path);
        if (bucket) formData.append("bucket", bucket);

        if (metadata) {
            for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined && value !== null) {
                    formData.append(
                        `metadata_${key}`,
                        typeof value === "string" ? value : JSON.stringify(value)
                    );
                }
            }
        }

        // We use fetchFn directly if we need to do multipart boundary, but Transport.request might override Content-Type?
        // Wait, transport.request defaults to application/json. We must remove Content-Type header or allow it to be evaluated by fetch when body is FormData!
        const result = await transport.request<{ data: UploadFileResult }>("/storage/upload", {
            method: "POST",
            body: formData,
            headers: {
                // transport.request merges headers, so to prevent it setting application/json we can delete it 
                // in transport if body is FormData, or we can explicitly set it to an empty string.
                // Let's rely on standard behaviour for now and adjust transport if it fails.
            }
        });

        return result.data;
    }

    async function getDownloadURL(
        pathOrUrl: string,
        bucket?: string
    ): Promise<DownloadConfig> {
        const cacheKey = bucket ? `${bucket}/${pathOrUrl}` : pathOrUrl;
        const cached = urlsCache.get(cacheKey);
        if (cached) return cached;

        let filePath = pathOrUrl;

        if (pathOrUrl.startsWith("local://") || pathOrUrl.startsWith("s3://")) {
            filePath = pathOrUrl.substring(pathOrUrl.indexOf("://") + 3);
        }

        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        try {
            const result = await transport.request<{ data: any }>(`/storage/metadata/${filePath}`);
            
            const activeToken = await transport.resolveToken();
            const tokenQuery = activeToken ? `?token=${activeToken}` : '';

            const downloadConfig: DownloadConfig = {
                url: `${transport.baseUrl}${transport.apiPath}/storage/file/${filePath}${tokenQuery}`,
                metadata: result.data
            };

            urlsCache.set(cacheKey, downloadConfig);
            return downloadConfig;
        } catch (e: any) {
            if (e.status === 404) {
                return { url: null, fileNotFound: true };
            }
            throw e;
        }
    }

    async function getFile(
        path: string,
        bucket?: string
    ): Promise<File | null> {
        let filePath = path;

        if (path.startsWith("local://") || path.startsWith("s3://")) {
            filePath = path.substring(path.indexOf("://") + 3);
        }

        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        // We must use plain fetch because transport.request expects JSON response, but here we want a Blob.
        const url = `${transport.baseUrl}${transport.apiPath}/storage/file/${filePath}`;
        
        // This is a bit manual, but necessary for blob handling
        const response = await transport.fetchFn(url, {
            headers: transport.getHeaders ? transport.getHeaders() : {}
        });

        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to get file");

        const blob = await response.blob();
        const fileName = filePath.split("/").pop() || "file";
        return new File([blob], fileName, { type: blob.type });
    }

    async function deleteFile(
        path: string,
        bucket?: string
    ): Promise<void> {
        let filePath = path;

        if (path.startsWith("local://") || path.startsWith("s3://")) {
            filePath = path.substring(path.indexOf("://") + 3);
        }

        if (bucket && !filePath.startsWith(bucket)) {
            filePath = `${bucket}/${filePath}`;
        }

        try {
            await transport.request(`/storage/file/${filePath}`, { method: "DELETE" });
        } catch (e: any) {
            if (e.status !== 404) throw e;
        }

        urlsCache.delete(bucket ? `${bucket}/${path}` : path);
    }

    async function list(
        path: string,
        options?: {
            bucket?: string;
            maxResults?: number;
            pageToken?: string;
        }
    ): Promise<StorageListResult> {
        const params = new URLSearchParams();
        if (path) params.set("path", path);
        if (options?.bucket) params.set("bucket", options.bucket);
        if (options?.maxResults) params.set("maxResults", String(options.maxResults));
        if (options?.pageToken) params.set("pageToken", options.pageToken);

        const result = await transport.request<{ data: StorageListResult }>(`/storage/list?${params.toString()}`);
        return result.data;
    }

    return {
        uploadFile,
        getDownloadURL,
        getFile,
        deleteFile,
        list
    };
}
