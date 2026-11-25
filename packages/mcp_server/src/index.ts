import type { McpServer } from "@modelcontextprotocol/server";
import type { SkillCatalog } from "@modelcontextprotocol/server/ext/skills";
import { createFireCMSMcpServer as createServer, FireCMSMcpServerOptions } from "./server.js";
import { localSession } from "./local-session.js";
import { registerAuthTools } from "./tools/auth.js";

/** Options for the local server: signed in on this machine, login tools included. */
export interface LocalFireCMSMcpServerOptions {
    /** Agent skills to serve, usually from `loadFireCMSSkills()`. */
    skills?: SkillCatalog;
}

/**
 * Create the FireCMS MCP server.
 *
 * With no options, or only `skills`, it is the local server it has always been:
 * signed in on this machine with `firecms_login`, tokens in `~/.firecms/tokens.json`,
 * and the login tools included. With a `session`, it acts for that session instead —
 * see `FireCMSMcpServerOptions`, and `@firecms/mcp-server/hosted` for the hosted server.
 */
export function createFireCMSMcpServer(options?: FireCMSMcpServerOptions | LocalFireCMSMcpServerOptions): McpServer {
    if (options && "session" in options)
        return createServer(options);
    const server = createServer({ session: localSession, skills: options?.skills });
    registerAuthTools(server);
    return server;
}

export type { FireCMSMcpServerOptions } from "./server.js";
export { FireCMSApiClient } from "./api-client.js";
export { localSession } from "./local-session.js";
export { registerAuthTools } from "./tools/auth.js";
export { agentSkillsDir, loadFireCMSSkills } from "./skills.js";
export type { SkillCatalog } from "./skills.js";
export type { FireCMSSession, FireCMSServerMode } from "./session.js";
