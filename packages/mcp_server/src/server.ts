import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FireCMSApiClient } from "./api-client.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerUserTools } from "./tools/users.js";
import { registerCollectionTools } from "./tools/collections.js";
import { registerDocumentTools } from "./tools/documents.js";
import { registerExportTools } from "./tools/export.js";
import { registerProjectResources } from "./resources/project.js";

/**
 * Create and configure the FireCMS MCP server with all tools and resources.
 */
export function createFireCMSMcpServer(): McpServer {
    const server = new McpServer({
        name: "FireCMS Cloud",
        version: "0.1.0",
    });

    const api = new FireCMSApiClient();

    // Auth tools (login/logout)
    registerAuthTools(server);

    // Project & user management (via backend API)
    registerProjectTools(server, api);
    registerUserTools(server, api);

    // Collection schema AI tools (via backend API)
    registerCollectionTools(server, api);

    // Firestore document CRUD (via backend API proxy)
    registerDocumentTools(server, api);

    // Data export (via backend API)
    registerExportTools(server, api);

    // Resources
    registerProjectResources(server, api);

    return server;
}
