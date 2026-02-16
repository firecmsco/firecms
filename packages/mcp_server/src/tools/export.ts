import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register data export tool.
 */
export function registerExportTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "export_collection",
        {
            description: `Export documents from a Firestore collection as JSON. Useful for data backups,
analysis, or migration. For large collections, use the limit parameter.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path to export (e.g., 'products')"),
                limit: z.number().optional().describe("Max documents to export (default: 100, max: 500)"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, collectionPath, limit, databaseId }) => {
            try {
                const maxLimit = Math.min(limit ?? 100, 500);
                const result = await api.listDocuments(projectId, {
                    path: collectionPath,
                    limit: maxLimit,
                    databaseId,
                });

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            collection: collectionPath,
                            exportedAt: new Date().toISOString(),
                            count: result.documents?.length ?? 0,
                            documents: result.documents ?? [],
                        }, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error exporting: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
