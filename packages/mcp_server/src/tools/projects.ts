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
            description: "List all Firestore root-level collections in a FireCMS project. Returns collection paths and database IDs.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
            },
        },
        async ({ projectId }) => {
            try {
                const collections = await api.getRootCollections(projectId);
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(collections, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
