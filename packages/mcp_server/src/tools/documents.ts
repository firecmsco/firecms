import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register Firestore document CRUD tools — the core CMS operations.
 * All operations go through the FireCMS backend (which has service account access to user projects).
 */
export function registerDocumentTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Read documents (list/query) ────────────────────

    server.registerTool(
        "list_documents",
        {
            description: `List documents from a Firestore collection. Supports filtering, ordering, and pagination.
Use this to browse data in your CMS collections.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products', 'users', 'blog/posts')"),
                limit: z.number().optional().describe("Max number of documents to return (default: 20)"),
                orderBy: z.string().optional().describe("Field to order by"),
                orderDirection: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
                filters: z.array(z.object({
                    field: z.string().describe("Field path to filter on"),
                    op: z.enum([
                        "==", "!=", "<", "<=", ">", ">=",
                        "array-contains", "in", "array-contains-any", "not-in",
                    ]).describe("Firestore filter operator"),
                    value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any())]).describe("Value to compare against"),
                })).optional().describe("Optional filters to apply"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, collectionPath, limit, orderBy, orderDirection, filters, databaseId }) => {
            try {
                const result = await api.listDocuments(projectId, {
                    path: collectionPath,
                    limit: limit ?? 20,
                    orderBy,
                    orderDirection,
                    filters: filters as Array<{ field: string; op: string; value: any }>,
                    databaseId,
                });
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(result, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Get single document ────────────────────────────

    server.registerTool(
        "get_document",
        {
            description: "Get a specific document by its collection path and ID. Returns all fields of the document.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products', 'users')"),
                documentId: z.string().describe("Document ID"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, collectionPath, documentId, databaseId }) => {
            try {
                const doc = await api.getDocument(projectId, collectionPath, documentId, databaseId);
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(doc, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Create document ────────────────────────────────

    server.registerTool(
        "create_document",
        {
            description: "Create a new document in a Firestore collection. Provide the field values as a JSON object.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products')"),
                data: z.record(z.any()).describe("Document fields as a JSON object"),
                documentId: z.string().optional().describe("Optional document ID. If not provided, Firestore generates one."),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
        },
        async ({ projectId, collectionPath, data, documentId, databaseId }) => {
            try {
                const doc = await api.createDocument(projectId, collectionPath, data, documentId, databaseId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Document created successfully.\n\n${JSON.stringify(doc, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Update document ────────────────────────────────

    server.registerTool(
        "update_document",
        {
            description: "Update fields of an existing document. Only the specified fields are modified (partial update / merge).",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products')"),
                documentId: z.string().describe("Document ID to update"),
                data: z.record(z.any()).describe("Fields to update as a JSON object"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
        },
        async ({ projectId, collectionPath, documentId, data, databaseId }) => {
            try {
                const doc = await api.updateDocument(projectId, collectionPath, documentId, data, databaseId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Document updated successfully.\n\n${JSON.stringify(doc, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 5. Delete document ────────────────────────────────

    server.registerTool(
        "delete_document",
        {
            description: "Delete a document from Firestore. This action is permanent.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products')"),
                documentId: z.string().describe("Document ID to delete"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { destructiveHint: true },
        },
        async ({ projectId, collectionPath, documentId, databaseId }) => {
            try {
                await api.deleteDocument(projectId, collectionPath, documentId, databaseId);
                return {
                    content: [{ type: "text" as const, text: `Document deleted: ${collectionPath}/${documentId}` }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 6. Count documents ────────────────────────────────

    server.registerTool(
        "count_documents",
        {
            description: "Count the total number of documents in a Firestore collection.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionPath: z.string().describe("Collection path (e.g., 'products')"),
                databaseId: z.string().optional().describe("Firestore database ID (default: '(default)')"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, collectionPath, databaseId }) => {
            try {
                const result = await api.countDocuments(projectId, collectionPath, databaseId);
                return {
                    content: [{ type: "text" as const, text: `Collection "${collectionPath}" contains ${result.count} documents.` }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
