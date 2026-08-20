import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register project management tools.
 */
export function registerProjectTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "list_projects",
        {
            description: "List all FireCMS Cloud projects accessible by the authenticated user",
        },
        async () => {
            try {
                const projects = await api.listProjects();
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(projects, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error listing projects: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "get_root_collections",
        {
            description: "List all Firestore root-level collections in a FireCMS project — the " +
                "paths that can be turned into CMS collections. Read live from Firestore, so " +
                "collections created moments ago are included.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
                databaseId: z.string().optional().describe("Firestore database ID, if not '(default)'"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, databaseId }) => {
            try {
                // The `firestore_root_collections` endpoint caches for 5 minutes and so
                // misses collections added since; this one reads through.
                const collections = await api.listRootCollectionsLive(projectId, { databaseId });
                return {
                    content: [{
                        type: "text" as const,
                        text: collections.length
                            ? JSON.stringify({ collections }, null, 2)
                            : `No root collections found — this project's Firestore is empty.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.message ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "list_subcollections",
        {
            description: "List the subcollections of a specific document. Use this to explore " +
                "nested data — the subcollection paths it returns can be passed to " +
                "preview_inferred_schema or infer_collections_from_data.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
                parentDocumentPath: z.string().describe("Full path of the parent document, e.g. 'users/abc123'"),
                databaseId: z.string().optional().describe("Firestore database ID, if not '(default)'"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, parentDocumentPath, databaseId }) => {
            try {
                const collections = await api.listRootCollectionsLive(projectId, { parentDocumentPath, databaseId });
                return {
                    content: [{
                        type: "text" as const,
                        text: collections.length
                            ? JSON.stringify({
                                parentDocumentPath,
                                subcollections: collections,
                                paths: collections.map((c) => `${parentDocumentPath}/${c}`),
                            }, null, 2)
                            : `No subcollections under "${parentDocumentPath}".`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.message ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
