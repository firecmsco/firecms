import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFireCMSMcpServer as createServer, FireCMSMcpServerOptions } from "./server.js";
import { localSession } from "./local-session.js";
import { registerAuthTools } from "./tools/auth.js";

/**
 * Create the FireCMS MCP server.
 *
 * With no options it is the local server it has always been: signed in on this
 * machine with `firecms_login`, tokens in `~/.firecms/tokens.json`, and the login
 * tools included. With options, it acts for the given session instead — see
 * `FireCMSMcpServerOptions`, and `@firecms/mcp-server/hosted` for the hosted server.
 */
export function createFireCMSMcpServer(options?: FireCMSMcpServerOptions): McpServer {
    if (options)
        return createServer(options);
    const server = createServer({ session: localSession });
    registerAuthTools(server);
    return server;
}

export type { FireCMSMcpServerOptions } from "./server.js";
export { FireCMSApiClient } from "./api-client.js";
export { localSession } from "./local-session.js";
export { registerAuthTools } from "./tools/auth.js";
export type { FireCMSSession, FireCMSServerMode } from "./session.js";
