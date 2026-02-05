/**
 * Firestore Sync Trigger
 * 
 * Migrated from Firebase Extension - syncs Firestore documents to Typesense in real-time
 */

import { onDocumentWritten, FirestoreEvent, Change } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import Typesense from "typesense";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { google } from "googleapis";

const projectId = process.env.GCLOUD_PROJECT!;
const functionsLocation = process.env.FUNCTIONS_LOCATION || "us-central1";
const vmZone = process.env.VM_ZONE || "us-central1-a";
const collectionsToIndex = (process.env.COLLECTIONS_TO_INDEX || "*").split(",").map(s => s.trim());

const INSTANCE_NAME = "firecms-typesense";
const SECRET_ID = "firecms-search-api-key";
const TYPESENSE_PORT = 8108;

setGlobalOptions({ region: functionsLocation });

let typesenseClient: InstanceType<typeof Typesense.Client> | null = null;
let vmExternalIp: string | null = null;
let serviceNotReadyWarned = false;

async function getTypesenseClient(): Promise<InstanceType<typeof Typesense.Client> | null> {
    if (typesenseClient) return typesenseClient;

    let apiKey: string;
    try {
        const secretClient = new SecretManagerServiceClient();
        const [version] = await secretClient.accessSecretVersion({
            name: `projects/${projectId}/secrets/${SECRET_ID}/versions/latest`,
        });
        apiKey = version.payload?.data?.toString() || "";
        if (!apiKey) return null;
    } catch (e: any) {
        if (!serviceNotReadyWarned) {
            console.warn(`Could not retrieve API key. Extension may not be installed yet. Error: ${e.message}`);
            serviceNotReadyWarned = true;
        }
        return null;
    }

    if (!vmExternalIp) {
        vmExternalIp = await getVMExternalIp();
        if (!vmExternalIp) return null;
    }

    typesenseClient = new Typesense.Client({
        nodes: [{ host: vmExternalIp, port: TYPESENSE_PORT, protocol: "http" }],
        apiKey,
        connectionTimeoutSeconds: 5,
    });

    return typesenseClient;
}

async function getVMExternalIp(): Promise<string> {
    const compute = google.compute("v1");
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await auth.getClient();
    google.options({ auth: authClient as any });

    try {
        const instance = await compute.instances.get({
            project: projectId,
            zone: vmZone,
            instance: INSTANCE_NAME,
        });
        const externalIp = instance.data.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
        if (!externalIp) {
            if (!serviceNotReadyWarned) {
                console.warn(`VM '${INSTANCE_NAME}' exists but has no external IP`);
                serviceNotReadyWarned = true;
            }
            return "";
        }
        return externalIp;
    } catch (e: any) {
        if (e.response?.status === 404 || e.code === 404) {
            if (!serviceNotReadyWarned) {
                console.warn(`VM '${INSTANCE_NAME}' not found. Extension may still be installing.`);
                serviceNotReadyWarned = true;
            }
            return "";
        }
        console.error(`Error getting VM external IP: ${e.message}`);
        return "";
    }
}

function shouldIndexCollection(path: string): boolean {
    if (collectionsToIndex.includes("*")) return true;

    const pathParts = path.split("/");
    const collectionPattern = getCollectionPattern(pathParts);

    if (collectionsToIndex.includes(collectionPattern)) return true;

    const rootCollection = pathParts[0];
    return collectionsToIndex.includes(rootCollection);
}

function getCollectionPattern(pathParts: string[]): string {
    const collectionNames: string[] = [];
    for (let i = 0; i < pathParts.length; i += 2) {
        collectionNames.push(pathParts[i]);
    }
    return collectionNames.join("/");
}

function getTypesenseCollectionName(path: string): string {
    const pathParts = path.split("/");
    const collectionNames: string[] = [];
    for (let i = 0; i < pathParts.length; i += 2) {
        collectionNames.push(pathParts[i]);
    }
    return collectionNames.join("_").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extractParentInfo(pathParts: string[]): { parentPath: string | null; parentIds: Record<string, string> } {
    if (pathParts.length <= 2) {
        return { parentPath: null, parentIds: {} };
    }

    const parentPath = pathParts.slice(0, -2).join("/");
    const parentIds: Record<string, string> = {};
    for (let i = 0; i < pathParts.length - 2; i += 2) {
        const collectionName = pathParts[i];
        const docId = pathParts[i + 1];
        parentIds[`_parent_${collectionName}_id`] = docId;
    }

    return { parentPath, parentIds };
}

async function ensureCollectionExists(client: InstanceType<typeof Typesense.Client>, collectionName: string): Promise<void> {
    try {
        await client.collections(collectionName).retrieve();
    } catch (e: any) {
        if (e.httpStatus === 404) {
            await client.collections().create({
                name: collectionName,
                fields: [{ name: ".*", type: "auto" }],
                enable_nested_fields: true,
            });
            console.log(`Created Typesense collection: ${collectionName}`);
        } else {
            throw e;
        }
    }
}

/**
 * Flatten object for Typesense indexing
 */
export function flattenObject(obj: any, prefix = ""): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}_${key}` : key;

        if (value === null || value === undefined) {
            continue;
        } else if (value instanceof Date) {
            result[newKey] = Math.floor(value.getTime() / 1000);
        } else if (value instanceof admin.firestore.Timestamp) {
            result[newKey] = value.seconds;
        } else if (value instanceof admin.firestore.DocumentReference) {
            result[newKey] = value.path;
        } else if (value instanceof admin.firestore.GeoPoint) {
            result[`${newKey}_lat`] = value.latitude;
            result[`${newKey}_lng`] = value.longitude;
            result[`${newKey}_location`] = [value.latitude, value.longitude];
        } else if (Array.isArray(value)) {
            if (value.length === 0) continue;
            const firstItem = value[0];
            if (typeof firstItem === "string") {
                result[newKey] = value;
            } else if (typeof firstItem === "number" || typeof firstItem === "boolean") {
                result[newKey] = value.map(v => String(v));
            } else {
                result[newKey] = JSON.stringify(value);
            }
        } else if (typeof value === "object") {
            if (value.constructor?.name === "FieldValue") continue;
            if ("__type__" in value && (value as any).__type__ === "__vector__") continue;
            Object.assign(result, flattenObject(value, newKey));
        } else if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
            result[newKey] = value;
        } else {
            result[newKey] = String(value);
        }
    }

    return result;
}

/**
 * Firestore trigger that syncs documents to Typesense
 */
export const onFirestoreWrite = onDocumentWritten(
    {
        document: "{document=**}",
        memory: "256MiB",
        timeoutSeconds: 60,
    },
    async (event: FirestoreEvent<Change<admin.firestore.DocumentSnapshot> | undefined>) => {
        if (!event.data) return;

        const fullPath = event.params.document as string;
        const pathParts = fullPath.split("/");

        if (pathParts.length % 2 !== 0) return;
        if (!shouldIndexCollection(fullPath)) return;

        const client = await getTypesenseClient();
        if (!client) {
            console.log(`Skipping indexing for ${fullPath} - Typesense service not ready yet`);
            return;
        }

        const collectionName = getTypesenseCollectionName(fullPath);
        const docId = pathParts[pathParts.length - 1];

        await ensureCollectionExists(client, collectionName);

        const afterData = event.data.after;

        if (!afterData.exists) {
            try {
                await client.collections(collectionName).documents(docId).delete();
                console.log(`Deleted ${docId} from ${collectionName}`);
            } catch (e: any) {
                if (e.httpStatus !== 404) {
                    console.error(`Error deleting ${docId}:`, e);
                }
            }
            return;
        }

        const data = afterData.data();
        if (!data) return;

        const flattenedData = flattenObject(data);
        const { parentPath, parentIds } = extractParentInfo(pathParts);

        const docToIndex: Record<string, any> = {
            id: docId,
            _path: fullPath,
            ...flattenedData,
            ...parentIds,
        };

        if (parentPath) {
            docToIndex._parentPath = parentPath;
        }

        try {
            await client.collections(collectionName).documents().upsert(docToIndex);
            console.log(`Indexed ${docId} in ${collectionName}`);
        } catch (e) {
            console.error(`Error indexing ${docId}:`, e);
            throw e;
        }
    }
);
