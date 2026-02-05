/**
 * Search Config Function
 * 
 * Migrated from Firebase Extension - returns Typesense configuration for client SDK
 */

import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const projectId = process.env.GCLOUD_PROJECT!;
const collectionsToIndex = (process.env.COLLECTIONS_TO_INDEX || "*").split(",").map(s => s.trim());

export interface SearchConfig {
    host: string;
    port: number;
    protocol: "https" | "http";
    apiKey: string;
    collectionsToIndex: string[];
    path?: string;
}

/**
 * Callable function that returns Typesense configuration for client SDK
 */
export const getSearchConfig = functions.onCall(
    { cors: true },
    async (request) => {
        if (!request.auth) {
            throw new functions.HttpsError(
                "unauthenticated",
                "Must be authenticated to get search configuration"
            );
        }

        try {
            const db = admin.firestore();

            // Check if user has a marketplace account
            const userDoc = await db.collection("users").doc(request.auth.uid).get();
            const marketplaceAccountId = userDoc.data()?.marketplaceAccountId;

            let host: string;
            let port: number;
            let protocol: "https" | "http";
            let path: string | undefined;
            let apiKey: string;

            if (marketplaceAccountId) {
                // Get customer-specific Typesense config
                const provision = await db.collection("marketplace_provisions").doc(marketplaceAccountId).get();

                if (provision.exists && provision.data()?.status === "ACTIVE") {
                    const provisionData = provision.data()!;

                    // Get API key from Secret Manager
                    const secretClient = new SecretManagerServiceClient();
                    const [version] = await secretClient.accessSecretVersion({
                        name: `projects/${projectId}/secrets/${provisionData.secretId}/versions/latest`,
                    });
                    apiKey = version.payload?.data?.toString() || "";

                    // Use direct access to customer's Typesense VM
                    host = provisionData.externalIp;
                    port = 8108;
                    protocol = "http";
                } else {
                    throw new functions.HttpsError(
                        "not-found",
                        "Search service not provisioned. Please complete setup."
                    );
                }
            } else {
                // Use the Cloud Function proxy URL for shared/demo access
                const location = process.env.FUNCTIONS_LOCATION || "us-central1";
                const functionName = "api"; // The proxy function

                host = `${location}-${projectId}.cloudfunctions.net`;
                path = `/${functionName}`;
                port = 443;
                protocol = "https";

                // Get shared API key
                const secretClient = new SecretManagerServiceClient();
                const [version] = await secretClient.accessSecretVersion({
                    name: `projects/${projectId}/secrets/firecms-search-api-key/versions/latest`,
                });
                apiKey = version.payload?.data?.toString() || "";
            }

            if (!apiKey) {
                throw new functions.HttpsError(
                    "not-found",
                    "Search extension not properly configured. API key not found."
                );
            }

            const config: SearchConfig = {
                host,
                port,
                protocol,
                apiKey,
                collectionsToIndex,
            };

            if (path) {
                config.path = path;
            }

            return config;

        } catch (error) {
            console.error("Error getting search config:", error);

            if (error instanceof functions.HttpsError) {
                throw error;
            }

            throw new functions.HttpsError(
                "internal",
                "Failed to get search configuration"
            );
        }
    }
);
