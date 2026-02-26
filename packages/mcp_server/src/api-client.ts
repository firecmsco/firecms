import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getValidTokens } from "./auth.js";

const API_URL = "https://api.firecms.co";

/**
 * Typed HTTP client for the FireCMS Cloud backend REST API.
 * Uses the same tokens as the FireCMS CLI (from ~/.firecms/tokens.json).
 */
export class FireCMSApiClient {
    private client: AxiosInstance;

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

    // ─── Collections ───────────────────────────────────────

    async generateCollection(prompt: string, existingCollections: any[] = [], existingCollection?: any): Promise<any> {
        return this.request({
            method: "POST",
            url: "/collections/generate",
            data: { prompt, existingCollections, existingCollection },
        });
    }

    // ─── Documents (Firestore CRUD via backend) ─────────────

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
}
