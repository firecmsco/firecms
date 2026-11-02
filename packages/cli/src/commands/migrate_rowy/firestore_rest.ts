import { execFile } from "child_process";
import { promisify } from "util";
import { RowyConfig, RowyProjectSettings, RowySchema } from "./types";

const FIRESTORE_API = "https://firestore.googleapis.com/v1";

/**
 * Get an access token for the account signed in to the gcloud CLI.
 * Using the person's own sign-in means no service account key has to be created or stored.
 */
export async function getGcloudAccessToken(): Promise<string> {
    try {
        const { stdout } = await promisify(execFile)("gcloud", ["auth", "print-access-token"], {
            // gcloud is a .cmd script on Windows, which only runs through a shell
            shell: process.platform === "win32"
        });
        const token = stdout.trim();
        if (!token) throw new Error("gcloud returned an empty token");
        return token;
    } catch (e: any) {
        throw new Error(
            "Could not get credentials from the gcloud CLI. Install it (https://cloud.google.com/sdk/docs/install), " +
            "run `gcloud auth login` with an account that can read Firestore in this project, and try again. " +
            "To work without gcloud, pass --input with your Rowy configuration as JSON.\n" +
            `gcloud said: ${e?.stderr?.toString().trim() || e?.message}`
        );
    }
}

/**
 * Read Rowy's configuration from Firestore. Read only: nothing is written.
 */
export async function loadRowyConfigFromFirestore(projectId: string, accessToken: string): Promise<RowyConfig> {
    const client = new FirestoreRestClient(projectId, accessToken);

    const settingsDoc = await client.getDocument("_rowy_/settings");
    if (!settingsDoc) {
        throw new Error(`No Rowy configuration found in project ${projectId}: the document _rowy_/settings does not exist.`);
    }
    const settings = decodeFields(settingsDoc.fields ?? {}) as RowyProjectSettings;

    const schemas = await loadSchemas(client, "_rowy_/settings/schema");
    const groupSchemas = await loadSchemas(client, "_rowy_/settings/groupSchema");

    return { settings, schemas, groupSchemas };
}

async function loadSchemas(client: FirestoreRestClient, collectionPath: string): Promise<Record<string, RowySchema>> {
    const result: Record<string, RowySchema> = {};
    const documents = await client.listDocuments(collectionPath);
    for (const document of documents) {
        const id = decodeURIComponent(document.name.split("/").pop()!);
        const schema = decodeFields(document.fields ?? {}) as RowySchema;
        const subTables = await loadSchemas(client, `${collectionPath}/${id}/subTables`);
        if (Object.keys(subTables).length > 0) {
            schema.subTables = subTables;
        }
        result[id] = schema;
    }
    return result;
}

type FirestoreDocument = {
    name: string;
    fields?: Record<string, FirestoreValue>;
};

type FirestoreValue = Record<string, any>;

class FirestoreRestClient {
    private readonly baseUrl: string;

    constructor(private readonly projectId: string, private readonly accessToken: string) {
        this.baseUrl = `${FIRESTORE_API}/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
    }

    async getDocument(path: string): Promise<FirestoreDocument | undefined> {
        const response = await this.request(`${this.baseUrl}/${encodePath(path)}`);
        if (response.status === 404) return undefined;
        await this.throwIfFailed(response, path);
        return await response.json() as FirestoreDocument;
    }

    async listDocuments(collectionPath: string): Promise<FirestoreDocument[]> {
        const documents: FirestoreDocument[] = [];
        let pageToken: string | undefined;
        do {
            const url = new URL(`${this.baseUrl}/${encodePath(collectionPath)}`);
            url.searchParams.set("pageSize", "300");
            if (pageToken) url.searchParams.set("pageToken", pageToken);
            const response = await this.request(url.toString());
            if (response.status === 404) return documents;
            await this.throwIfFailed(response, collectionPath);
            const body = await response.json() as { documents?: FirestoreDocument[], nextPageToken?: string };
            documents.push(...(body.documents ?? []));
            pageToken = body.nextPageToken;
        } while (pageToken);
        return documents;
    }

    private request(url: string) {
        return fetch(url, { headers: { Authorization: `Bearer ${this.accessToken}` } });
    }

    private async throwIfFailed(response: Response, path: string) {
        if (response.ok) return;
        let detail = "";
        try {
            detail = (await response.json())?.error?.message ?? "";
        } catch {
            // the body is not JSON, the status says enough
        }
        if (response.status === 401) {
            throw new Error("Your gcloud credentials have expired or were rejected. Run `gcloud auth login` and try again.");
        }
        if (response.status === 403) {
            throw new Error(
                `The gcloud account cannot read ${path} in project ${this.projectId}. ` +
                "It needs read access to Firestore, for example the Cloud Datastore Viewer role." +
                (detail ? `\nFirestore said: ${detail}` : "")
            );
        }
        throw new Error(`Reading ${path} failed with HTTP ${response.status}.${detail ? ` ${detail}` : ""}`);
    }
}

function encodePath(path: string) {
    return path.split("/").map(encodeURIComponent).join("/");
}

export function decodeFields(fields: Record<string, FirestoreValue>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
        result[key] = decodeValue(value);
    }
    return result;
}

/**
 * Turn a Firestore REST value into plain JS.
 * References become `{ referencePath }`, since only their path matters here.
 */
export function decodeValue(value: FirestoreValue): any {
    if ("nullValue" in value) return null;
    if ("booleanValue" in value) return value.booleanValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return Number(value.doubleValue);
    if ("stringValue" in value) return value.stringValue;
    if ("timestampValue" in value) return new Date(value.timestampValue);
    if ("referenceValue" in value) {
        return { referencePath: String(value.referenceValue).replace(/^projects\/[^/]+\/databases\/[^/]+\/documents\//, "") };
    }
    if ("geoPointValue" in value) {
        return { latitude: value.geoPointValue.latitude ?? 0, longitude: value.geoPointValue.longitude ?? 0 };
    }
    if ("bytesValue" in value) return value.bytesValue;
    if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeValue);
    if ("mapValue" in value) return decodeFields(value.mapValue.fields ?? {});
    return undefined;
}
