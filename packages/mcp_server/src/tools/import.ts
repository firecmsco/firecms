import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register data import tools — bulk operations for Firestore documents.
 * Admin-only operations.
 */
export function registerImportTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "import_documents",
        {
            description: `Bulk import documents into a Firestore collection. Useful for seeding data, 
migrations, or restoring from a backup. Each document can optionally specify an ID; 
if omitted, Firestore generates one. Use "merge: true" to update existing documents 
instead of overwriting.

Maximum 500 documents per call. For larger imports, call multiple times.`,
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
                    content: [{ type: "text" as const, text: `Error importing: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
