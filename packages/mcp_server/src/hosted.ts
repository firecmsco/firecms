/**
 * The hosted FireCMS MCP server: one URL for everyone, `https://api.firecms.co/mcp`.
 *
 * The FireCMS backend mounts this behind its OAuth bearer check and calls
 * {@link handleHostedMcpRequest} with the session of the person the token belongs to.
 * Nothing here signs anyone in or reads local files: this entry point does not load
 * the CLI's login flow at all, so it can run on a shared server.
 *
 * Each request gets its own server and transport (the stateless mode of Streamable
 * HTTP). No state outlives a request, so any instance can answer any request and
 * nothing of one person's session is left behind for the next.
 */
import { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createFireCMSMcpServer } from "./server.js";
import { FireCMSSession } from "./session.js";

export type { FireCMSSession } from "./session.js";

export interface HostedMcpRequestOptions {
    /** The person this request is for, resolved from its bearer token. */
    session: FireCMSSession;
    /** The FireCMS backend the tools call. */
    apiUrl: string;
    /** The FireCMS Cloud web app, where new projects are connected. */
    appUrl: string;
    /** The request body, when a body parser has already consumed the stream. */
    body?: unknown;
}

/**
 * Answer one MCP request (a POST of JSON-RPC messages) for one person.
 *
 * Stateless servers have no stream to resume and no session to end, so the caller
 * should answer GET and DELETE on the endpoint with 405 rather than route them here.
 */
export async function handleHostedMcpRequest(
    request: IncomingMessage,
    response: ServerResponse,
    { session, apiUrl, appUrl, body }: HostedMcpRequestOptions
): Promise<void> {
    const server = createFireCMSMcpServer({ session, mode: "hosted", apiUrl, appUrl });
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        // One JSON body per request instead of an SSE stream: no tool here streams
        // progress, and a plain response passes through every proxy untouched.
        enableJsonResponse: true,
    });
    response.on("close", () => {
        void transport.close();
        void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(request, response, body);
}
