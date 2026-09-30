import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";
import { describeError } from "./errors.js";

/**
 * Register data import tools — bulk operations for Firestore documents.
 * Admin-only operations.
 */
export function registerImportTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "import_documents",
        {
            title: "Import documents",
            description:
                "Bulk import documents into a Firestore collection, for seeding data, migrations or restoring a backup. Each document can specify an ID; without one, Firestore generates it. By default a document with an existing ID is overwritten; with merge: true its fields are merged instead. At most 500 documents per call.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Target collection path (e.g., 'products')"),
                documents: z.array(z.object({
                    id: z.string().optional().describe("Optional document ID"),
                    data: z.record(z.any()).describe("Document fields"),
                })).describe("Array of documents to import (max 500)"),
                merge: z.boolean().optional().describe("If true, merge with existing documents instead of overwriting (default: false)"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { title: "Import documents", readOnlyHint: false, destructiveHint: true },
        },
        async ({ projectId, collectionPath, documents, merge, databaseId }) => {
            try {
                await api.assertAdmin(projectId);

                if (documents.length > 500) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Error: Maximum 500 documents per import call. You provided ${documents.length}. Split into batches.`,
                        }],
                        isError: true,
                    };
                }

                const result = await api.importDocuments(projectId, {
                    path: collectionPath,
                    documents,
                    merge: merge ?? false,
                    databaseId,
                });
                return {
                    content: [{
                        type: "text" as const,
                        text: `Successfully imported ${documents.length} document(s) into "${collectionPath}".\n\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error importing: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
