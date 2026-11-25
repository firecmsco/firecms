import type { McpServer } from "@modelcontextprotocol/server";
import { registerTool } from "../tool-schema.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";
import { describeError } from "./errors.js";

/**
 * Register Firebase Storage tools (upload and list files in the project's bucket).
 */
export function registerStorageTools(server: McpServer, api: FireCMSApiClient) {

    registerTool(server,
        "upload_storage_file",
        {
            title: "Upload a file to Firebase Storage",
            description: `Upload a file (such as an image for a newsletter or CMS entry) to the project's Firebase Storage bucket and get back a public download URL.
Provide either base64Data (raw base64 or a data: URI) or a public sourceUrl to fetch and store.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                path: z.string().describe("Destination path inside the bucket, e.g. 'mail/noviembre-2026/hero.jpg'"),
                base64Data: z.string().optional().describe("Base64-encoded file contents (or data: URI). Required if sourceUrl is omitted."),
                sourceUrl: z.string().url().optional().describe("Public HTTP(S) URL to fetch and upload. Required if base64Data is omitted."),
                contentType: z.string().optional().describe("MIME type, e.g. 'image/jpeg'. Inferred from path or response header if omitted."),
                bucketName: z.string().optional().describe("Optional explicit bucket name; defaults to the project's default Firebase Storage bucket."),
            },
            annotations: { title: "Upload a file to Firebase Storage", readOnlyHint: false, destructiveHint: false },
        },
        async ({ projectId, path, base64Data, sourceUrl, contentType, bucketName }) => {
            if (!base64Data && !sourceUrl) {
                return {
                    content: [{ type: "text" as const, text: "Error: either base64Data or sourceUrl must be provided." }],
                    isError: true,
                };
            }
            try {
                const result = await api.uploadStorageFile(projectId, {
                    path,
                    base64Data,
                    sourceUrl,
                    contentType,
                    bucketName,
                });
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(result, null, 2),
                    }],
                };
            } catch (error: unknown) {
                return {
                    content: [{ type: "text" as const, text: `Error uploading storage file: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    registerTool(server,
        "list_storage_files",
        {
            title: "List files in Firebase Storage",
            description: `List files stored in the project's Firebase Storage bucket under an optional prefix (e.g. 'mail/noviembre-2026/'), including their download URLs when available.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                prefix: z.string().optional().describe("Optional folder prefix, e.g. 'mail/noviembre-2026/'"),
                limit: z.number().optional().describe("Max files to return (default: 50, max: 200)"),
                bucketName: z.string().optional().describe("Optional explicit bucket name"),
            },
            annotations: { title: "List files in Firebase Storage", readOnlyHint: true },
        },
        async ({ projectId, prefix, limit, bucketName }) => {
            try {
                const result = await api.listStorageFiles(projectId, { prefix, limit, bucketName });
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(result, null, 2),
                    }],
                };
            } catch (error: unknown) {
                return {
                    content: [{ type: "text" as const, text: `Error listing storage files: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
