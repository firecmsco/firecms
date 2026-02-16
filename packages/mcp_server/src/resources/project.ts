import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register MCP resources — read-only contextual data about FireCMS projects.
 */
export function registerProjectResources(server: McpServer, api: FireCMSApiClient) {

    server.registerResource(
        "project-collections",
        new ResourceTemplate("firecms://projects/{projectId}/collections", { list: undefined }),
        {
            description: "Firestore root-level collections for a FireCMS project",
            mimeType: "application/json",
        },
        async (uri, variables) => {
            const projectId = variables.projectId as string;
            try {
                const collections = await api.getRootCollections(projectId);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(collections, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify({ error: error.message }),
                    }],
                };
            }
        }
    );

    server.registerResource(
        "project-users",
        new ResourceTemplate("firecms://projects/{projectId}/users", { list: undefined }),
        {
            description: "Users with access to a FireCMS project",
            mimeType: "application/json",
        },
        async (uri, variables) => {
            const projectId = variables.projectId as string;
            try {
                const users = await api.listUsers(projectId);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(users, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify({ error: error.message }),
                    }],
                };
            }
        }
    );
}
