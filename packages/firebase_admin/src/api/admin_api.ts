export type AdminDocument = {
    id: string;
    path: string;
    values: Record<string, any>;
    createTime?: string;
    updateTime?: string;
};

export type BatchOperation = {
    type: "set" | "update" | "delete";
    path: string;
    documentId: string;
    data?: Record<string, any>;
};

export type BatchWriteResult = {
    totalOperations: number;
    batchesCompleted: number;
    totalBatches: number;
    failures: Array<{ index: number; error: string }>;
};

export type QueryParams = {
    path: string;
    collectionGroup?: boolean;
    filters?: Array<{ field: string; op: string; value: any }>;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    limit?: number;
    startAfter?: any[];
    databaseId?: string;
};

export type AuthUser = {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    disabled: boolean;
    emailVerified: boolean;
    providerData: Array<{
        providerId: string;
        uid: string;
        email?: string;
        displayName?: string;
        photoURL?: string;
    }>;
    customClaims: Record<string, any>;
    creationTime?: string;
    lastSignInTime?: string;
    lastRefreshTime?: string;
};

export type AdminApi = ReturnType<typeof buildAdminApi>;

function buildHeaders(firebaseAccessToken: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseAccessToken}`,
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const data = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

export function buildAdminApi(host: string, getBackendAuthToken: () => Promise<string>) {

    // ─── Firestore: Existing document endpoints ─────────────────

    async function listDocuments(
        projectId: string,
        path: string,
        options?: {
            limit?: number;
            orderBy?: string;
            orderDirection?: "asc" | "desc";
            filters?: Array<{ field: string; op: string; value: any }>;
            databaseId?: string;
            startAfter?: string;
        }
    ): Promise<{ documents: AdminDocument[]; hasMore?: boolean }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/list`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, ...options }),
        }).then(res => handleResponse(res));
    }

    async function getDocument(
        projectId: string,
        path: string,
        documentId: string,
        databaseId?: string
    ): Promise<AdminDocument> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/get`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, documentId, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function createDocument(
        projectId: string,
        path: string,
        data: Record<string, any>,
        documentId?: string,
        databaseId?: string
    ): Promise<AdminDocument> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/create`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, data, documentId, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function updateDocument(
        projectId: string,
        path: string,
        documentId: string,
        data: Record<string, any>,
        databaseId?: string
    ): Promise<AdminDocument> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/update`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, documentId, data, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function deleteDocument(
        projectId: string,
        path: string,
        documentId: string,
        databaseId?: string
    ): Promise<{ success: boolean }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/delete`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, documentId, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function countDocuments(
        projectId: string,
        path: string,
        databaseId?: string
    ): Promise<{ count: number }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/count`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, databaseId }),
        }).then(res => handleResponse(res));
    }

    // ─── Admin-only endpoints ───────────────────────────────────

    async function listCollections(
        projectId: string,
        parentDocumentPath?: string,
        databaseId?: string
    ): Promise<{ collections: string[] }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/collections/list`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ parentDocumentPath, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function queryDocuments(
        projectId: string,
        params: QueryParams
    ): Promise<{ documents: AdminDocument[]; hasMore: boolean }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/documents/query`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify(params),
        }).then(res => handleResponse(res));
    }

    async function batchWrite(
        projectId: string,
        operations: BatchOperation[],
        databaseId?: string
    ): Promise<BatchWriteResult> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/documents/batch_write`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ operations, databaseId }),
        }).then(res => handleResponse(res));
    }

    async function readDocumentAtTime(
        projectId: string,
        path: string,
        documentId: string,
        readTime: string,
        databaseId?: string
    ): Promise<AdminDocument | null> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/documents/read_at_time`, {
            method: "POST",
            headers: buildHeaders(token),
            body: JSON.stringify({ path, documentId, readTime, databaseId }),
        }).then(res => {
            if (res.status === 404) return null;
            return handleResponse(res);
        });
    }

    // ─── Auth management ────────────────────────────────────────

    async function listAuthUsers(
        projectId: string,
        maxResults?: number,
        pageToken?: string
    ): Promise<{ users: AuthUser[]; pageToken?: string }> {
        const token = await getBackendAuthToken();
        const params = new URLSearchParams();
        if (maxResults) params.set("maxResults", String(maxResults));
        if (pageToken) params.set("pageToken", pageToken);
        return fetch(`${host}/projects/${projectId}/admin/auth/users?${params}`, {
            method: "GET",
            headers: buildHeaders(token),
        }).then(res => handleResponse(res));
    }

    async function getAuthUser(
        projectId: string,
        uid: string
    ): Promise<AuthUser> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/auth/users/${uid}`, {
            method: "GET",
            headers: buildHeaders(token),
        }).then(res => handleResponse(res));
    }

    async function updateAuthUser(
        projectId: string,
        uid: string,
        data: Partial<{
            displayName: string;
            email: string;
            phoneNumber: string;
            photoURL: string;
            disabled: boolean;
            emailVerified: boolean;
            password: string;
        }>
    ): Promise<AuthUser> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/auth/users/${uid}`, {
            method: "PATCH",
            headers: buildHeaders(token),
            body: JSON.stringify(data),
        }).then(res => handleResponse(res));
    }

    async function setCustomClaims(
        projectId: string,
        uid: string,
        claims: Record<string, any>
    ): Promise<AuthUser> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/auth/users/${uid}/claims`, {
            method: "PATCH",
            headers: buildHeaders(token),
            body: JSON.stringify({ claims }),
        }).then(res => handleResponse(res));
    }

    async function deleteAuthUser(
        projectId: string,
        uid: string
    ): Promise<{ success: boolean }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/admin/auth/users/${uid}`, {
            method: "DELETE",
            headers: buildHeaders(token),
        }).then(res => handleResponse(res));
    }

    // ─── Firestore: List databases ──────────────────────────────

    async function listDatabases(
        projectId: string,
    ): Promise<{ databases: string[] }> {
        const token = await getBackendAuthToken();
        return fetch(`${host}/projects/${projectId}/documents/databases`, {
            method: "POST",
            headers: buildHeaders(token),
        }).then(res => handleResponse(res));
    }

    return {
        // Firestore
        listDocuments,
        getDocument,
        createDocument,
        updateDocument,
        deleteDocument,
        countDocuments,
        listCollections,
        listDatabases,
        queryDocuments,
        batchWrite,
        readDocumentAtTime,
        // Auth
        listAuthUsers,
        getAuthUser,
        updateAuthUser,
        setCustomClaims,
        deleteAuthUser,
    };
}
