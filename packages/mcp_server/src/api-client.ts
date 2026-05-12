import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getValidTokens, getCurrentUserEmail } from "./auth.js";

const API_URL = "https://api.firecms.co";

/**
 * The Firestore path where collection schemas are persisted in the CLIENT's
 * Firestore (not the SaaS backend). The backend's document CRUD endpoints
 * proxy operations into the client's project Firestore.
 */
const COLLECTIONS_CONFIG_PATH = "__FIRECMS/config/collections";

/**
 * Typed HTTP client for the FireCMS Cloud backend REST API.
 * Uses the same tokens as the FireCMS CLI (from ~/.firecms/tokens.json).
 *
 * Architecture notes:
 * - Collection schemas are stored in the CLIENT's Firestore at
 *   `__FIRECMS/config/collections/{collectionId}`. We use the existing
 *   document CRUD proxy endpoints to read/write them.
 * - Project config (name, colors, locale) is stored in the SaaS backend's
 *   Firestore at `projects/{projectId}`. Dedicated `/config` endpoints
 *   handle this.
 * - Bulk import uses the admin `batch_write` endpoint.
 */
export class FireCMSApiClient {
    private client: AxiosInstance;
    private adminCache: Map<string, { isAdmin: boolean; checkedAt: number }> = new Map();

    /** Cache admin checks for 5 minutes */
    private static ADMIN_CACHE_TTL_MS = 5 * 60 * 1000;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            timeout: 60_000,
            headers: { "Content-Type": "application/json" },
        });
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const tokens = await getValidTokens();
        if (!tokens) {
            throw new Error("Not logged in. Use the firecms_login tool first.");
        }
        return {
            Authorization: `Bearer ${tokens.id_token}`,
            "x-admin-authorization": `Bearer ${tokens.access_token}`,
        };
    }

    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        const headers = await this.authHeaders();
        const response = await this.client.request<T>({
            ...config,
            headers: { ...config.headers, ...headers },
        });
        return response.data;
    }

    // ─── Admin guard ──────────────────────────────────────────

    /**
     * Verify that the current user is an admin of the given project.
     * Results are cached for 5 minutes per project.
     * @throws Error if the user is not an admin.
     */
    async assertAdmin(projectId: string): Promise<void> {
        const cached = this.adminCache.get(projectId);
        if (cached && (Date.now() - cached.checkedAt) < FireCMSApiClient.ADMIN_CACHE_TTL_MS) {
            if (!cached.isAdmin) {
                throw this.notAdminError(projectId);
            }
            return;
        }

        const users = await this.listUsers(projectId);
        const currentEmail = getCurrentUserEmail();
        const me = (users as any[]).find((u: any) =>
            u.email?.toLowerCase() === currentEmail?.toLowerCase()
        );
        const isAdmin = me?.roles?.includes("admin") ?? false;

        this.adminCache.set(projectId, { isAdmin, checkedAt: Date.now() });

        if (!isAdmin) {
            throw this.notAdminError(projectId);
        }
    }

    private notAdminError(projectId: string): Error {
        const email = getCurrentUserEmail() ?? "unknown";
        return new Error(
            `Access denied: ${email} is not an admin of project "${projectId}". ` +
            `The FireCMS MCP server requires admin access for this operation.`
        );
    }

    // ─── Projects ──────────────────────────────────────────

    async listProjects(): Promise<any> {
        return this.request({ method: "GET", url: "/projects" });
    }

    async getRootCollections(projectId: string): Promise<any> {
        return this.request({
            method: "GET",
            url: `/projects/${projectId}/firestore_root_collections`,
        });
    }

    // ─── Project Config (SaaS backend Firestore) ──────────

    async getProjectConfig(projectId: string): Promise<any> {
        return this.request({
            method: "GET",
            url: `/projects/${projectId}/config`,
        });
    }

    async updateProjectConfig(projectId: string, data: Record<string, any>): Promise<any> {
        return this.request({
            method: "PATCH",
            url: `/projects/${projectId}/config`,
            data,
        });
    }

    // ─── Users ─────────────────────────────────────────────

    async listUsers(projectId: string): Promise<any> {
        return this.request({ method: "GET", url: `/projects/${projectId}/users` });
    }

    async createUser(projectId: string, email: string, roles: string[]): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/users`,
            data: { email, roles },
        });
    }

    async updateUser(projectId: string, userId: string, roles: string[]): Promise<any> {
        return this.request({
            method: "PATCH",
            url: `/projects/${projectId}/users/${userId}`,
            data: { roles },
        });
    }

    async deleteUser(projectId: string, userId: string): Promise<any> {
        return this.request({ method: "DELETE", url: `/projects/${projectId}/users/${userId}` });
    }

    // ─── Collection Schemas (client Firestore via document proxy) ───────

    /**
     * List all persisted collection schemas.
     * Uses the document list endpoint to read from `__FIRECMS/config/collections`.
     */
    async listCollectionSchemas(projectId: string): Promise<any[]> {
        const response: any = await this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/list`,
            data: { path: COLLECTIONS_CONFIG_PATH, limit: 500 },
        });
        // The document list endpoint returns { data: Document[] } or { documents: Document[] }
        return response?.data ?? response?.documents ?? [];
    }

    /**
     * Get a single collection schema by its document ID.
     */
    async getCollectionSchema(projectId: string, collectionId: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/get`,
            data: { path: COLLECTIONS_CONFIG_PATH, documentId: collectionId },
        });
    }

    /**
     * Create or fully replace a collection schema.
     * Uses the document create/update endpoints to write to `__FIRECMS/config/collections/{id}`.
     */
    async saveCollectionSchema(projectId: string, collectionId: string, schema: Record<string, any>): Promise<any> {
        // Try update first (if doc exists), fall back to create
        try {
            return await this.request({
                method: "POST",
                url: `/projects/${projectId}/documents/update`,
                data: {
                    path: COLLECTIONS_CONFIG_PATH,
                    documentId: collectionId,
                    data: { ...schema, id: collectionId },
                },
            });
        } catch (error: any) {
            // If the document doesn't exist, create it
            if (error.response?.status === 404) {
                return this.request({
                    method: "POST",
                    url: `/projects/${projectId}/documents/create`,
                    data: {
                        path: COLLECTIONS_CONFIG_PATH,
                        documentId: collectionId,
                        data: { ...schema, id: collectionId },
                    },
                });
            }
            throw error;
        }
    }

    /**
     * Partially update an existing collection schema (merge).
     */
    async updateCollectionSchema(projectId: string, collectionId: string, data: Record<string, any>): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/update`,
            data: {
                path: COLLECTIONS_CONFIG_PATH,
                documentId: collectionId,
                data,
            },
        });
    }

    /**
     * Delete a collection schema.
     */
    async deleteCollectionSchema(projectId: string, collectionId: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/delete`,
            data: {
                path: COLLECTIONS_CONFIG_PATH,
                documentId: collectionId,
            },
        });
    }

    /**
     * Add or update a single property within a collection schema.
     * Reads the current schema, modifies the property, and writes back.
     */
    async saveProperty(projectId: string, collectionId: string, propertyKey: string, property: Record<string, any>, namespace?: string): Promise<any> {
        // Get current schema
        const current: any = await this.getCollectionSchema(projectId, collectionId);
        const schemaData = current?.data ?? current ?? {};

        // Build the properties map
        const properties = schemaData.properties ?? {};
        const key = namespace ? `${namespace}:${propertyKey}` : propertyKey;
        properties[key] = property;

        // Write back
        return this.updateCollectionSchema(projectId, collectionId, { properties });
    }

    /**
     * Delete a property from a collection schema.
     * Reads the current schema, removes the property, and writes back.
     */
    async deleteProperty(projectId: string, collectionId: string, propertyKey: string, namespace?: string): Promise<any> {
        const current: any = await this.getCollectionSchema(projectId, collectionId);
        const schemaData = current?.data ?? current ?? {};

        const properties = schemaData.properties ?? {};
        const key = namespace ? `${namespace}:${propertyKey}` : propertyKey;
        delete properties[key];

        return this.updateCollectionSchema(projectId, collectionId, { properties });
    }

    // ─── AI Collection Generation ──────────────────────────

    async generateCollection(prompt: string, existingCollections: any[] = [], existingCollection?: any): Promise<any> {
        return this.request({
            method: "POST",
            url: "/collections/generate",
            data: { prompt, existingCollections, existingCollection },
        });
    }

    // ─── Documents (Firestore CRUD via backend proxy) ──────

    async listDocuments(projectId: string, body: {
        path: string;
        limit?: number;
        orderBy?: string;
        orderDirection?: string;
        filters?: Array<{ field: string; op: string; value: any }>;
        databaseId?: string;
    }): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/list`,
            data: body,
        });
    }

    async getDocument(projectId: string, path: string, documentId: string, databaseId?: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/get`,
            data: { path, documentId, databaseId },
        });
    }

    async createDocument(projectId: string, path: string, data: Record<string, any>, documentId?: string, databaseId?: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/create`,
            data: { path, data, documentId, databaseId },
        });
    }

    async updateDocument(projectId: string, path: string, documentId: string, data: Record<string, any>, databaseId?: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/update`,
            data: { path, documentId, data, databaseId },
        });
    }

    async deleteDocument(projectId: string, path: string, documentId: string, databaseId?: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/delete`,
            data: { path, documentId, databaseId },
        });
    }

    async countDocuments(projectId: string, path: string, databaseId?: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/count`,
            data: { path, databaseId },
        });
    }

    // ─── Data Import (admin batch_write) ────────────────────

    /**
     * Bulk import documents into a collection using the admin batch_write endpoint.
     * This writes directly to the client's Firestore via the delegated service account.
     */
    async importDocuments(projectId: string, body: {
        path: string;
        documents: Array<{ id?: string; data: Record<string, any> }>;
        merge?: boolean;
        databaseId?: string;
    }): Promise<any> {
        // Transform documents into BatchOperation format expected by the backend
        const operations = body.documents.map(doc => ({
            type: (body.merge ? "update" : "set") as "set" | "update",
            path: body.path,
            documentId: doc.id ?? this.generateId(),
            data: doc.data,
        }));

        return this.request({
            method: "POST",
            url: `/projects/${projectId}/admin/documents/batch_write`,
            data: {
                operations,
                databaseId: body.databaseId,
            },
        });
    }

    /**
     * Generate a random Firestore-style document ID.
     */
    private generateId(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < 20; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }
}
