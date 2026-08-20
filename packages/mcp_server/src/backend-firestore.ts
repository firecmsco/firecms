/**
 * Minimal Firestore REST client for the FireCMS backend project.
 *
 * FireCMS Cloud stores collection configurations in the *backend* Firestore, at
 * `projects/{projectId}/collections/{collectionId}` — see
 * `useFirestoreCollectionsConfigController` in `packages/firecms_cloud/src/FireCMSCloudApp.tsx`,
 * which points at `configPath: projects/${projectId}/collections` on the backend
 * Firebase app, and `saveCollections()` in the SaaS backend repository, which writes
 * to the same place.
 *
 * This is NOT the client project's `__FIRECMS/config/collections`, which is the
 * self-hosted layout and is never read by FireCMS Cloud.
 *
 * The backend exposes no REST endpoints for this store — the web app writes to it
 * directly with the Firebase SDK — so we talk to the Firestore REST API with the same
 * Firebase ID token the web app uses. The backend's security rules apply unchanged.
 */
import axios from "axios";
import { getBackendIdToken, getBackendFirebaseConfig } from "./backend-auth.js";

/** A decoded Firestore document. */
export interface FirestoreDoc {
    id: string;
    [key: string]: any;
}

// ─── Value conversion ──────────────────────────────────────

/**
 * Convert a plain JS value into a Firestore REST `Value`.
 */
export function toFirestoreValue(value: any): any {
    if (value === null || value === undefined) {
        return { nullValue: null };
    }
    if (typeof value === "boolean") {
        return { booleanValue: value };
    }
    if (typeof value === "number") {
        return Number.isInteger(value)
            ? { integerValue: String(value) }
            : { doubleValue: value };
    }
    if (typeof value === "string") {
        return { stringValue: value };
    }
    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    }
    if (typeof value === "object") {
        return { mapValue: { fields: toFirestoreFields(value) } };
    }
    // Functions, symbols and anything else are not representable.
    return { nullValue: null };
}

/**
 * Convert a plain JS object into a Firestore REST `fields` map.
 */
export function toFirestoreFields(data: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        fields[key] = toFirestoreValue(value);
    }
    return fields;
}

/**
 * Convert a Firestore REST `Value` back into a plain JS value.
 */
export function fromFirestoreValue(value: any): any {
    if (value === null || value === undefined) return null;
    if ("nullValue" in value) return null;
    if ("booleanValue" in value) return value.booleanValue;
    if ("stringValue" in value) return value.stringValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return Number(value.doubleValue);
    if ("timestampValue" in value) return value.timestampValue;
    if ("bytesValue" in value) return value.bytesValue;
    if ("referenceValue" in value) return value.referenceValue;
    if ("geoPointValue" in value) return value.geoPointValue;
    if ("arrayValue" in value) {
        return (value.arrayValue.values ?? []).map(fromFirestoreValue);
    }
    if ("mapValue" in value) {
        return fromFirestoreFields(value.mapValue.fields ?? {});
    }
    return null;
}

/**
 * Convert a Firestore REST `fields` map back into a plain JS object.
 */
export function fromFirestoreFields(fields: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
        result[key] = fromFirestoreValue(value);
    }
    return result;
}

/**
 * Quote a field path for an `updateMask` if it is not a plain identifier.
 */
function quoteFieldPath(path: string): string {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(path) ? path : `\`${path.replace(/`/g, "\\`")}\``;
}

// ─── Client ────────────────────────────────────────────────

/**
 * Typed accessor for collection configurations in the FireCMS backend Firestore.
 */
export class BackendFirestoreClient {

    private async documentsUrl(): Promise<string> {
        const config = await getBackendFirebaseConfig();
        return `https://firestore.googleapis.com/v1/projects/${config.projectId}` +
            "/databases/(default)/documents";
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const token = await getBackendIdToken();
        return { Authorization: `Bearer ${token}` };
    }

    private collectionPath(projectId: string): string {
        return `projects/${encodeURIComponent(projectId)}/collections`;
    }

    private documentPath(projectId: string, collectionId: string): string {
        return `${this.collectionPath(projectId)}/${encodeURIComponent(collectionId)}`;
    }

    /**
     * Turn an axios error into something an agent can act on.
     */
    private wrapError(error: any, action: string): Error {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message ?? error.message;
        if (status === 403) {
            return new Error(
                `Permission denied while ${action}. You must be an admin of this project in FireCMS Cloud.`
            );
        }
        if (status === 404) {
            return new Error(`Not found while ${action}.`);
        }
        return new Error(`Error while ${action}: ${message}`);
    }

    /**
     * List every collection configuration of a project.
     */
    async listCollections(projectId: string): Promise<FirestoreDoc[]> {
        const base = await this.documentsUrl();
        const headers = await this.authHeaders();
        const results: FirestoreDoc[] = [];
        let pageToken: string | undefined;

        try {
            do {
                const response: any = await axios.get(
                    `${base}/${this.collectionPath(projectId)}`,
                    {
                        headers,
                        params: { pageSize: 300, ...(pageToken ? { pageToken } : {}) },
                        timeout: 60_000,
                    }
                );
                for (const doc of response.data?.documents ?? []) {
                    results.push({
                        id: doc.name.split("/").pop(),
                        ...fromFirestoreFields(doc.fields ?? {}),
                    });
                }
                pageToken = response.data?.nextPageToken;
            } while (pageToken);
        } catch (error: any) {
            // An empty collection returns 200 with no documents; a genuine 404 means
            // the project has no config subcollection yet, which is not an error.
            if (error.response?.status === 404) return [];
            throw this.wrapError(error, `listing collections of "${projectId}"`);
        }

        return results;
    }

    /**
     * Get a single collection configuration.
     */
    async getCollection(projectId: string, collectionId: string): Promise<FirestoreDoc | null> {
        const base = await this.documentsUrl();
        const headers = await this.authHeaders();
        try {
            const response: any = await axios.get(
                `${base}/${this.documentPath(projectId, collectionId)}`,
                { headers, timeout: 60_000 }
            );
            return {
                id: response.data.name.split("/").pop(),
                ...fromFirestoreFields(response.data.fields ?? {}),
            };
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw this.wrapError(error, `reading collection "${collectionId}"`);
        }
    }

    /**
     * Create or fully replace a collection configuration.
     *
     * A `patch` with no `updateMask` replaces the whole document, and creates it if
     * it does not exist yet.
     */
    async setCollection(
        projectId: string,
        collectionId: string,
        data: Record<string, any>
    ): Promise<FirestoreDoc> {
        const base = await this.documentsUrl();
        const headers = await this.authHeaders();
        try {
            const response: any = await axios.patch(
                `${base}/${this.documentPath(projectId, collectionId)}`,
                { fields: toFirestoreFields({ ...data, id: collectionId }) },
                { headers, timeout: 60_000 }
            );
            return {
                id: response.data.name.split("/").pop(),
                ...fromFirestoreFields(response.data.fields ?? {}),
            };
        } catch (error: any) {
            throw this.wrapError(error, `saving collection "${collectionId}"`);
        }
    }

    /**
     * Merge a partial update into a collection configuration.
     *
     * Only the top-level keys present in `data` are touched; everything else in the
     * document is left alone.
     */
    async mergeCollection(
        projectId: string,
        collectionId: string,
        data: Record<string, any>
    ): Promise<FirestoreDoc> {
        const base = await this.documentsUrl();
        const headers = await this.authHeaders();
        const fieldPaths = Object.keys(data).map(quoteFieldPath);
        try {
            const response: any = await axios.patch(
                `${base}/${this.documentPath(projectId, collectionId)}`,
                { fields: toFirestoreFields(data) },
                {
                    headers,
                    timeout: 60_000,
                    params: { "updateMask.fieldPaths": fieldPaths },
                    paramsSerializer: {
                        // Firestore expects the mask repeated, not comma-joined.
                        indexes: null,
                    },
                }
            );
            return {
                id: response.data.name.split("/").pop(),
                ...fromFirestoreFields(response.data.fields ?? {}),
            };
        } catch (error: any) {
            throw this.wrapError(error, `updating collection "${collectionId}"`);
        }
    }

    /**
     * Delete a collection configuration. The underlying Firestore data is untouched.
     */
    async deleteCollection(projectId: string, collectionId: string): Promise<void> {
        const base = await this.documentsUrl();
        const headers = await this.authHeaders();
        try {
            await axios.delete(
                `${base}/${this.documentPath(projectId, collectionId)}`,
                { headers, timeout: 60_000 }
            );
        } catch (error: any) {
            throw this.wrapError(error, `deleting collection "${collectionId}"`);
        }
    }
}
