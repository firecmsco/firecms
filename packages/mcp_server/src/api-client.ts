import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getValidTokens, getCurrentUserEmail } from "./auth.js";
import { getBackendIdToken } from "./backend-auth.js";
import { BackendFirestoreClient } from "./backend-firestore.js";

const API_URL = "https://api.firecms.co";

/**
 * Typed HTTP client for the FireCMS Cloud backend REST API.
 *
 * Authentication (mirrors `packages/firecms_cloud/src/api/projects.ts`):
 * - `Authorization` carries a Firebase ID token issued by the `firecms-backend`
 *   project, obtained by exchanging the Google OAuth ID token — see `backend-auth.ts`.
 *   Most endpoints are gated by `firebaseAuthorization()` and accept nothing else.
 * - `x-admin-authorization` carries the Google OAuth access token, used by the
 *   endpoints gated by `googleCloudAuthentication()` (project listing and the whole
 *   GCP provisioning surface).
 *
 * Architecture notes:
 * - Collection configurations live in the BACKEND Firestore at
 *   `projects/{projectId}/collections/{collectionId}`, which is what FireCMS Cloud
 *   reads. There are no REST endpoints for that store, so it is accessed directly
 *   through `BackendFirestoreClient`, exactly as the web app does.
 * - Project config (name, colors, locale) is stored in the backend Firestore at
 *   `projects/{projectId}`. Dedicated `/config` endpoints handle this.
 * - Document CRUD is proxied by the backend into the CLIENT's Firestore using the
 *   project's delegated service account.
 * - Bulk import uses the admin `batch_write` endpoint.
 */
export class FireCMSApiClient {
    private client: AxiosInstance;
    private adminCache: Map<string, { isAdmin: boolean; checkedAt: number }> = new Map();

    /** Direct access to the backend Firestore, for collection configurations. */
    readonly collections = new BackendFirestoreClient();

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
            Authorization: `Bearer ${await getBackendIdToken()}`,
            "x-admin-authorization": `Bearer ${tokens.access_token}`,
        };
    }

    /**
     * Headers for endpoints gated only by `googleCloudAuthentication()`.
     *
     * These must not require a backend Firebase token: they are the endpoints used
     * before a project exists in FireCMS Cloud, when the user may have no backend
     * account yet.
     */
    private async googleAuthHeaders(): Promise<Record<string, string>> {
        const tokens = await getValidTokens();
        if (!tokens) {
            throw new Error("Not logged in. Use the firecms_login tool first.");
        }
        return { "x-admin-authorization": `Bearer ${tokens.access_token}` };
    }

    /**
     * Request against an endpoint that only needs the Google access token.
     */
    private async googleRequest<T>(config: AxiosRequestConfig): Promise<T> {
        const headers = await this.googleAuthHeaders();
        const response = await this.client.request<T>({
            ...config,
            headers: { ...config.headers, ...headers },
        });
        return response.data;
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
        const me = users.find((u: any) =>
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

    /**
     * List the FireCMS Cloud projects the user belongs to.
     *
     * The backend returns each project keyed by `id` (not `projectId`), along with
     * the project's encrypted service account. The service account is stripped here:
     * it is a credential, it is never needed by any tool, and it would otherwise be
     * serialised straight into the model's context.
     */
    async listProjects(): Promise<any[]> {
        const response: any = await this.googleRequest({ method: "GET", url: "/projects" });
        const projects = response?.data ?? response ?? [];
        return (Array.isArray(projects) ? projects : []).map((project: any) => {
            const { service_account, firebase_config, ...rest } = project;
            return { projectId: project.id, ...rest };
        });
    }

    /**
     * List the Firestore root collections of the client project.
     *
     * Returns an empty list when the backend answers 204, which it does when the
     * project has no delegated service account set up yet.
     *
     * NOTE: this endpoint caches its answer for 5 minutes per project (see
     * `getRootCollections` in the SaaS backend), so it can report collections that
     * no longer exist, and — more importantly — miss ones just created. Prefer
     * `listRootCollectionsLive` for anything that drives a decision.
     */
    async getRootCollections(projectId: string): Promise<any> {
        const response: any = await this.request({
            method: "GET",
            url: `/projects/${projectId}/firestore_root_collections`,
        });
        return response?.data ?? response ?? [];
    }

    /**
     * List collections straight from the client's Firestore, with no caching.
     *
     * Without `parentDocumentPath` this returns the root collections; with it, the
     * subcollections of that document.
     */
    async listRootCollectionsLive(
        projectId: string,
        options: { parentDocumentPath?: string; databaseId?: string } = {}
    ): Promise<string[]> {
        const response: any = await this.request({
            method: "POST",
            url: `/projects/${projectId}/admin/collections/list`,
            data: {
                ...(options.parentDocumentPath ? { parentDocumentPath: options.parentDocumentPath } : {}),
                ...(options.databaseId ? { databaseId: options.databaseId } : {}),
            },
        });
        return response?.collections ?? response?.data ?? [];
    }

    // ─── Project provisioning (Google-token endpoints) ─────

    /**
     * List the Google Cloud / Firebase projects the signed-in user can access,
     * annotated with what FireCMS needs: whether Firebase, Firestore, Auth and the
     * required APIs are enabled, and whether the project is already a FireCMS project.
     */
    async listAvailableFirebaseProjects(): Promise<any> {
        const response: any = await this.googleRequest({ method: "GET", url: "/gcp_projects" });
        return response?.data ?? response ?? [];
    }

    /**
     * Detailed configuration status for a single Google Cloud project.
     */
    async getProjectSetupStatus(projectId: string): Promise<any> {
        const response: any = await this.request({
            method: "GET",
            url: `/gcp_projects/${projectId}/`,
        });
        return response?.data ?? response;
    }

    /**
     * Locations available for a new Firestore database / Storage bucket.
     */
    async listAvailableLocations(): Promise<any> {
        const response: any = await this.googleRequest({
            method: "GET",
            url: "/gcp_projects/available_locations",
        });
        return response?.data ?? response ?? [];
    }

    /**
     * Enable the Google Cloud APIs FireCMS requires on a project.
     */
    async enableProjectApis(projectId: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/gcp_projects/${projectId}/enable_apis`,
        });
    }

    /**
     * Create the default Firestore database in a project.
     */
    async enableFirestore(projectId: string, locationId: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/gcp_projects/${projectId}/enable_firestore`,
            data: { locationId },
        });
    }

    /**
     * Connect an existing Firebase project to FireCMS Cloud.
     *
     * This is the provisioning step: the backend verifies access to the project,
     * checks that Firebase is active, creates a delegated service account with the
     * permissions FireCMS needs, registers the caller as an admin, and persists the
     * project. It fails if the project is already a FireCMS project.
     */
    async connectProject(projectId: string, creationType: "existing" | "new" = "existing"): Promise<any> {
        const response: any = await this.request({
            method: "POST",
            url: "/projects",
            data: { projectId, creationType },
        });
        return response?.data ?? response;
    }

    /**
     * Create the FireCMS web app in the client's Firebase project.
     */
    async createWebApp(projectId: string): Promise<any> {
        return this.request({
            method: "POST",
            url: `/projects/${projectId}/firebase_webapp`,
        });
    }

    // ─── Collection inference (server-side) ────────────────

    /**
     * Infer collection configurations from the data at the given Firestore paths,
     * then persist them.
     *
     * The backend samples documents at each path, runs schema inference, enhances the
     * result with an LLM (display names, groups, property widgets) and saves the
     * configurations. Paths already mapped to a collection are skipped.
     */
    async setupCollections(
        projectId: string,
        paths: Array<{ path: string; databaseId?: string }>
    ): Promise<any> {
        const response: any = await this.request({
            method: "POST",
            url: `/projects/${projectId}/setup_collections`,
            data: { paths },
        });
        return response?.data ?? response;
    }

    /**
     * Discover every unmapped Firestore root collection and set them all up.
     */
    async initialCollectionsSetup(projectId: string): Promise<any> {
        const response: any = await this.request({
            method: "POST",
            url: `/projects/${projectId}/initial_setup`,
        });
        return response?.data ?? response;
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

    /**
     * List the users of a project. The backend wraps them in `{ users: [...] }`.
     */
    async listUsers(projectId: string): Promise<any[]> {
        const response: any = await this.request({ method: "GET", url: `/projects/${projectId}/users` });
        return response?.users ?? response?.data ?? (Array.isArray(response) ? response : []);
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

    // ─── Collection Schemas (backend Firestore) ────────────
    //
    // These read and write `projects/{projectId}/collections` in the FireCMS backend
    // Firestore, which is the store FireCMS Cloud actually reads. See
    // `backend-firestore.ts` for why this bypasses the REST API.

    /**
     * List all persisted collection schemas of a project.
     */
    async listCollectionSchemas(projectId: string): Promise<any[]> {
        return this.collections.listCollections(projectId);
    }

    /**
     * Get a single collection schema by its ID.
     */
    async getCollectionSchema(projectId: string, collectionId: string): Promise<any> {
        const collection = await this.collections.getCollection(projectId, collectionId);
        if (!collection) {
            throw new Error(
                `Collection "${collectionId}" does not exist in project "${projectId}".`
            );
        }
        return collection;
    }

    /**
     * Create or fully replace a collection schema.
     */
    async saveCollectionSchema(
        projectId: string,
        collectionId: string,
        schema: Record<string, any>
    ): Promise<any> {
        return this.collections.setCollection(projectId, collectionId, schema);
    }

    /**
     * Partially update an existing collection schema, merging top-level keys.
     */
    async updateCollectionSchema(
        projectId: string,
        collectionId: string,
        data: Record<string, any>
    ): Promise<any> {
        return this.collections.mergeCollection(projectId, collectionId, data);
    }

    /**
     * Delete a collection schema. The underlying Firestore data is left untouched.
     */
    async deleteCollectionSchema(projectId: string, collectionId: string): Promise<any> {
        await this.collections.deleteCollection(projectId, collectionId);
        return { deleted: collectionId };
    }

    /**
     * Add or update a single property within a collection schema.
     *
     * Reads the current schema, sets the property, and writes back the whole
     * `properties` map. New properties are appended to `propertiesOrder` so they are
     * actually visible in the CMS.
     */
    async saveProperty(
        projectId: string,
        collectionId: string,
        propertyKey: string,
        property: Record<string, any>,
        namespace?: string
    ): Promise<any> {
        const current = await this.getCollectionSchema(projectId, collectionId);

        const properties = { ...(current.properties ?? {}) };
        const key = namespace ? `${namespace}.${propertyKey}` : propertyKey;
        properties[key] = property;

        const propertiesOrder: string[] = Array.isArray(current.propertiesOrder)
            ? [...current.propertiesOrder]
            : Object.keys(current.properties ?? {});
        if (!propertiesOrder.includes(key)) {
            propertiesOrder.push(key);
        }

        return this.updateCollectionSchema(projectId, collectionId, { properties, propertiesOrder });
    }

    /**
     * Remove a property from a collection schema, and from its display order.
     */
    async deleteProperty(
        projectId: string,
        collectionId: string,
        propertyKey: string,
        namespace?: string
    ): Promise<any> {
        const current = await this.getCollectionSchema(projectId, collectionId);

        const properties = { ...(current.properties ?? {}) };
        const key = namespace ? `${namespace}.${propertyKey}` : propertyKey;
        if (!(key in properties)) {
            throw new Error(
                `Property "${key}" does not exist in collection "${collectionId}".`
            );
        }
        delete properties[key];

        const propertiesOrder: string[] = (Array.isArray(current.propertiesOrder)
            ? current.propertiesOrder
            : Object.keys(current.properties ?? {})).filter((p: string) => p !== key);

        return this.updateCollectionSchema(projectId, collectionId, { properties, propertiesOrder });
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

    /**
     * List the Firestore databases of the client project.
     */
    async listDatabases(projectId: string): Promise<any> {
        const response: any = await this.request({
            method: "POST",
            url: `/projects/${projectId}/documents/databases`,
            data: {},
        });
        return response?.databases ?? response?.data ?? response ?? [];
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
