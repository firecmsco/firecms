/**
 * Backfill Function
 * 
 * Migrated from Firebase Extension - indexes existing Firestore documents
 */

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Typesense from "typesense";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { google } from "googleapis";
import { flattenObject } from "./sync";

const projectId = process.env.GCLOUD_PROJECT!;
const vmZone = process.env.VM_ZONE || "us-central1-a";
const defaultCollectionsToIndex = (process.env.COLLECTIONS_TO_INDEX || "*").split(",").map(s => s.trim());

const INSTANCE_NAME = "firecms-typesense";
const SECRET_ID = "firecms-search-api-key";
const TYPESENSE_PORT = 8108;
const BATCH_SIZE = 500;

/**
 * HTTP function to backfill existing documents
 */
export const backfill = functions.onRequest(
    {
        timeoutSeconds: 540,
        memory: "1GiB",
        cors: true,
    },
    async (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        console.log("Starting backfill via HTTP trigger...");

        try {
            const accountId = req.query.accountId as string;
            const collections = req.body?.collections?.split(",").map((s: string) => s.trim());

            const results = await performBackfill({
                accountId,
                collectionsToIndex: collections || defaultCollectionsToIndex
            });

            console.log("Backfill completed:", results);
            res.json({ success: true, results });
        } catch (error) {
            console.error("Backfill failed:", error);
            res.status(500).json({
                error: "Backfill failed",
                message: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
);

interface BackfillConfig {
    accountId?: string;
    collectionsToIndex?: string[];
}

/**
 * Core backfill logic
 */
export async function performBackfill(config: BackfillConfig = {}): Promise<Record<string, { indexed: number; errors: number }>> {
    const { accountId, collectionsToIndex = defaultCollectionsToIndex } = config;

    const client = await getTypesenseClient(accountId);
    const firestore = admin.firestore();

    let collections: string[];
    if (collectionsToIndex.includes("*")) {
        const collectionRefs = await firestore.listCollections();
        collections = collectionRefs.map(c => c.id);
    } else {
        collections = collectionsToIndex;
    }

    console.log(`Backfilling collections: ${collections.join(", ")}`);

    const results: Record<string, { indexed: number; errors: number }> = {};

    for (const collectionName of collections) {
        console.log(`Backfilling collection: ${collectionName}`);

        await ensureCollectionExists(client, collectionName);

        let count = 0;
        let errors = 0;
        let lastDoc: admin.firestore.DocumentSnapshot | undefined;

        while (true) {
            let query: admin.firestore.Query = firestore.collection(collectionName).limit(BATCH_SIZE);

            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            if (snapshot.empty) break;

            const batch: any[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const flattenedData = flattenObject(data);

                const docToIndex: Record<string, any> = {
                    id: doc.id,
                    _path: `${collectionName}/${doc.id}`,
                    ...flattenedData,
                };

                batch.push(docToIndex);
                count++;
            }

            try {
                const importResult = await client
                    .collections(collectionName)
                    .documents()
                    .import(batch, { action: "upsert" });

                const batchErrors = importResult.filter((r: any) => !r.success).length;
                errors += batchErrors;

                if (batchErrors > 0) {
                    console.warn(`${batchErrors} errors in batch for ${collectionName}`);
                }
            } catch (e) {
                console.error(`Error importing batch for ${collectionName}:`, e);
                errors += batch.length;
            }

            lastDoc = snapshot.docs[snapshot.docs.length - 1];
            console.log(`Indexed ${count} documents from ${collectionName}`);
        }

        results[collectionName] = { indexed: count, errors };
        console.log(`Completed ${collectionName}: ${count} indexed, ${errors} errors`);
    }

    return results;
}

async function getTypesenseClient(accountId?: string): Promise<InstanceType<typeof Typesense.Client>> {
    const db = admin.firestore();
    let host: string;
    let apiKey: string;

    if (accountId) {
        const provision = await db.collection("marketplace_provisions").doc(accountId).get();
        if (provision.exists) {
            const data = provision.data()!;
            host = data.externalIp;
            const secretClient = new SecretManagerServiceClient();
            const [version] = await secretClient.accessSecretVersion({
                name: `projects/${projectId}/secrets/${data.secretId}/versions/latest`,
            });
            apiKey = version.payload?.data?.toString() || "";
            return new Typesense.Client({
                nodes: [{ host, port: TYPESENSE_PORT, protocol: "http" }],
                apiKey,
                connectionTimeoutSeconds: 10,
            });
        }
    }

    // Fallback to default
    const secretClient = new SecretManagerServiceClient();
    const [version] = await secretClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/${SECRET_ID}/versions/latest`,
    });
    apiKey = version.payload?.data?.toString() || "";

    host = await getVMExternalIp();
    if (!host) {
        throw new Error(`Typesense VM '${INSTANCE_NAME}' not found.`);
    }

    return new Typesense.Client({
        nodes: [{ host, port: TYPESENSE_PORT, protocol: "http" }],
        apiKey,
        connectionTimeoutSeconds: 10,
    });
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
        return instance.data.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP || "";
    } catch (e: any) {
        if (e.response?.status === 404 || e.code === 404) {
            throw new Error(`Typesense VM '${INSTANCE_NAME}' not found.`);
        }
        throw e;
    }
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
