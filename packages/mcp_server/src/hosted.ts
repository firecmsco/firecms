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
    /**
     * Told why the transport refused or failed a request: the 4xx answers it gives on its
     * own (a body that isn't JSON-RPC, a missing Accept type, an unsupported protocol
     * version) carry their reason nowhere else. Defaults to a structured warning on
     * stderr, which Cloud Logging reads.
     */
    onError?: (error: Error, details: HostedMcpErrorDetails) => void;
}

/** What a refused request looked like. Never its params, nor any credential. */
export interface HostedMcpErrorDetails {
    httpMethod?: string;
    accept?: string;
    contentType?: string;
    contentLength?: string;
    protocolVersion?: string;
    hasSessionId: boolean;
    userAgent?: string;
    /** The JSON-RPC methods in the body, when it parsed. */
    rpcMethods?: string[];
}

function describeRequest(request: IncomingMessage, body: unknown): HostedMcpErrorDetails {
    const header = (name: string) => {
        const value = request.headers[name];
        return Array.isArray(value) ? value.join(", ") : value;
    };
    const messages = Array.isArray(body) ? body : body && typeof body === "object" ? [body] : [];
    const rpcMethods = messages
        .map((message: any) => typeof message?.method === "string" ? message.method : message?.id !== undefined ? "(response)" : "(unknown)");
    return {
        httpMethod: request.method,
        accept: header("accept"),
        contentType: header("content-type"),
        contentLength: header("content-length"),
        protocolVersion: header("mcp-protocol-version"),
        hasSessionId: request.headers["mcp-session-id"] !== undefined,
        userAgent: header("user-agent"),
        rpcMethods: messages.length > 0 ? rpcMethods : undefined,
    };
}

function logTransportError(error: Error, details: HostedMcpErrorDetails) {
    console.warn(JSON.stringify({
        severity: "WARNING",
        message: `Hosted MCP request refused: ${error.message}`,
        ...details,
    }));
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
    { session, apiUrl, appUrl, body, onError = logTransportError }: HostedMcpRequestOptions
): Promise<void> {
    const server = createFireCMSMcpServer({ session, mode: "hosted", apiUrl, appUrl });
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        // One JSON body per request instead of an SSE stream: no tool here streams
        // progress, and a plain response passes through every proxy untouched.
        enableJsonResponse: true,
    });
    // About 18% of Claude.ai's POSTs after an idle spell got a 400 and nobody could
    // say why: the transport only reports its reasons here. Set before connecting, so
    // the server chains its own handler after this one.
    transport.onerror = (error) => {
        try {
            onError(error, describeRequest(request, body));
        } catch {
            // Reporting must never change the answer.
        }
    };
    response.on("close", () => {
        void transport.close();
        void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(request, response, body);
}
