import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register MCP resources — read-only contextual data about FireCMS projects.
 * Resources provide ambient context to the LLM without requiring explicit tool calls.
 */
export function registerProjectResources(server: McpServer, api: FireCMSApiClient) {

    // ─── Root collections ──────────────────────────────────

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

    // ─── Project users ─────────────────────────────────────

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

    // ─── Collection schemas (full schema tree) ─────────────

    server.registerResource(
        "project-schemas",
        new ResourceTemplate("firecms://projects/{projectId}/schemas", { list: undefined }),
        {
            description: "All persisted collection schemas for a FireCMS project — the full configuration tree including properties, validation rules, and display settings",
            mimeType: "application/json",
        },
        async (uri, variables) => {
            const projectId = variables.projectId as string;
            try {
                const schemas = await api.listCollectionSchemas(projectId);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(schemas, null, 2),
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

    // ─── Project configuration ─────────────────────────────

    server.registerResource(
        "project-config",
        new ResourceTemplate("firecms://projects/{projectId}/config", { list: undefined }),
        {
            description: "Project configuration — name, colors, subscription plan, feature toggles, and locale settings",
            mimeType: "application/json",
        },
        async (uri, variables) => {
            const projectId = variables.projectId as string;
            try {
                const config = await api.getProjectConfig(projectId);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(config, null, 2),
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
