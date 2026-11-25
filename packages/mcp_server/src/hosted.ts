/**
 * The hosted FireCMS MCP server: one URL for everyone, `https://api.firecms.co/mcp`.
 *
 * The FireCMS backend mounts this behind its OAuth bearer check and calls
 * {@link handleHostedMcpRequest} with the session of the person the token belongs to.
 * Nothing here signs anyone in or reads anyone's local files: this entry point does not
 * load the CLI's login flow at all, so it can run on a shared server. The only files it
 * reads are the agent skills shipped in `@firecms/agent-skills`, once per process.
 *
 * Each request gets its own server and transport (stateless serving). No state outlives
 * a request, so any instance can answer any request and nothing of one person's session
 * is left behind for the next. Both protocol eras are answered at the same URL:
 * 2026-07-28 requests (which carry their protocol version in every request) through the
 * SDK's per-request handler, and 2025-era requests through the stateless Streamable HTTP
 * transport this server has always used.
 */
import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import {
    createMcpHandler,
    isLegacyRequest,
    WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/server";
import type { SkillCatalog } from "@modelcontextprotocol/server/ext/skills";
import { createFireCMSMcpServer } from "./server.js";
import { FireCMSSession } from "./session.js";
import { loadFireCMSSkills } from "./skills.js";

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
    /**
     * The agent skills to serve. Defaults to the ones in `@firecms/agent-skills`,
     * loaded by the first request and shared by every request after it.
     */
    skills?: SkillCatalog;
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

const MAX_LOGGED_METHODS = 10;

function describeRequest(request: IncomingMessage, body: unknown): HostedMcpErrorDetails {
    const header = (name: string) => {
        const value = request.headers[name];
        return Array.isArray(value) ? value.join(", ") : value;
    };
    const messages = Array.isArray(body) ? body : body && typeof body === "object" ? [body] : [];
    // A batch can be any size; a few methods and the count say enough, in one log line.
    const rpcMethods = messages
        .slice(0, MAX_LOGGED_METHODS)
        .map((message: any) => typeof message?.method === "string" ? message.method.slice(0, 100) : message?.id !== undefined ? "(response)" : "(unknown)");
    if (messages.length > MAX_LOGGED_METHODS) rpcMethods.push(`(+${messages.length - MAX_LOGGED_METHODS} more)`);
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

let sharedSkills: Promise<SkillCatalog | undefined> | undefined;

/** The shipped agent skills, read once per process; `undefined` when they cannot be. */
function defaultSkills(): Promise<SkillCatalog | undefined> {
    sharedSkills ??= loadFireCMSSkills();
    return sharedSkills;
}

/**
 * The Node request as a web `Request`, which is what the SDK's HTTP serving takes.
 * When a body parser has already consumed the stream, the parsed body travels beside
 * the request instead (as `parsedBody`), and the length headers of a body that is no
 * longer there are dropped.
 */
function toWebRequest(request: IncomingMessage, body: unknown, signal: AbortSignal): Request {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
        if (value === undefined)
            continue;
        if (Array.isArray(value))
            value.forEach((item) => headers.append(name, item));
        else
            headers.set(name, value);
    }
    const method = request.method ?? "POST";
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (body !== undefined || method === "GET" || method === "HEAD") {
        headers.delete("content-length");
        headers.delete("transfer-encoding");
        return new Request(url, { method, headers, signal });
    }
    // Still unread: the stream becomes the request's body.
    const stream = Readable.toWeb(request);
    return new Request(url, { method, headers, signal, body: stream, duplex: "half" });
}

/** Write a web `Response` to the Node response, streaming its body if it has one. */
async function sendWebResponse(source: Response, response: ServerResponse): Promise<void> {
    response.statusCode = source.status;
    source.headers.forEach((value, name) => response.setHeader(name, value));
    if (!source.body) {
        response.end();
        return;
    }
    const reader = source.body.getReader();
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done)
                break;
            response.write(value);
        }
    } catch {
        // The client went away mid-stream: nothing left to write to.
    } finally {
        response.end();
    }
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
    { session, apiUrl, appUrl, body, onError = logTransportError, skills }: HostedMcpRequestOptions
): Promise<void> {
    const catalog = skills ?? await defaultSkills();
    const createServer = () => createFireCMSMcpServer({ session, mode: "hosted", apiUrl, appUrl, skills: catalog });
    // About 18% of Claude.ai's POSTs after an idle spell got a 400 and nobody could
    // say why: the SDK only reports its reasons to an error callback.
    const report = (error: Error) => {
        try {
            onError(error, describeRequest(request, body));
        } catch {
            // Reporting must never change the answer.
        }
    };

    const disconnected = new AbortController();
    const cleanups: Array<() => Promise<void>> = [];
    response.on("close", () => {
        disconnected.abort();
        for (const cleanup of cleanups)
            void cleanup();
    });
    const webRequest = toWebRequest(request, body, disconnected.signal);

    let answer: Response;
    if (await isLegacyRequest(webRequest, body)) {
        // A 2025-era client: one server and one stateless transport for this request.
        const server = createServer();
        const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            // One JSON body per request instead of an SSE stream: no tool here streams
            // progress, and a plain response passes through every proxy untouched.
            enableJsonResponse: true,
        });
        // Set before connecting, so the server chains its own handler after this one.
        transport.onerror = report;
        cleanups.push(() => transport.close(), () => server.close());
        await server.connect(transport);
        answer = await transport.handleRequest(webRequest, { parsedBody: body });
    } else {
        // A 2026-07-28 request: the SDK's per-request handler builds the server for it.
        const handler = createMcpHandler(createServer, {
            legacy: "reject",
            // The default response mode answers with a single JSON body, as above,
            // unless a tool sends a message before its result (none here do), and
            // streams only `subscriptions/listen`.
            onerror: report,
        });
        cleanups.push(() => handler.close());
        answer = await handler.fetch(webRequest, { parsedBody: body });
    }
    await sendWebResponse(answer, response);
}
