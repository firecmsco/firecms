import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn, type ChildProcess } from "node:child_process";
import { config as loadDotenv } from "dotenv";
import { resolve, join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// We dynamically load @rebasepro/client to avoid transitive type issues.
// The client SDK ships compiled .d.ts that reference @rebasepro/types (which
// drags in React peer-deps).  By importing at runtime only we keep the MCP
// server build clean.
const CLIENT_PKG = "@rebasepro/client";
async function loadClientSdk(): Promise<(opts: Record<string, unknown>) => unknown> {
    const mod = await import(/* webpackIgnore: true */ CLIENT_PKG);
    return mod.createRebaseClient;
}

// ── Environment ─────────────────────────────────────────────────────────────

const PROJECT_DIR = process.env.REBASE_PROJECT_DIR || process.cwd();

// Try to load .env from the project directory
for (const envPath of [
    resolve(PROJECT_DIR, ".env"),
    resolve(PROJECT_DIR, "app", ".env"),
]) {
    if (existsSync(envPath)) {
        loadDotenv({ path: envPath });
        break;
    }
}

const BASE_URL = process.env.REBASE_BASE_URL || "http://localhost:3001";
const API_TOKEN = process.env.REBASE_API_TOKEN || process.env.REBASE_TOKEN || "";

// ── Rebase Client (lazy) ────────────────────────────────────────────────────

type RebaseClient = {
    data: {
        collection: (slug: string) => {
            find: (opts: Record<string, unknown>) => Promise<unknown>;
            findById: (id: string) => Promise<unknown>;
            create: (data: unknown) => Promise<unknown>;
            update: (id: string, data: unknown) => Promise<unknown>;
            delete: (id: string) => Promise<void>;
        }
    };
    admin: {
        listUsers: () => Promise<unknown>;
        createUser: (opts: Record<string, unknown>) => Promise<unknown>;
        updateUser: (id: string, opts: Record<string, unknown>) => Promise<unknown>;
        deleteUser: (id: string) => Promise<unknown>;
        listRoles: () => Promise<unknown>;
    };
};

let _client: RebaseClient | null = null;

async function getClient(): Promise<RebaseClient> {
    if (!_client) {
        const createRebaseClient = await loadClientSdk();
        _client = createRebaseClient({
            baseUrl: BASE_URL,
            token: API_TOKEN || undefined,
        }) as RebaseClient;
    }
    return _client;
}

// ── MCP Server ──────────────────────────────────────────────────────────────

const server = new Server(
    { name: "rebase-mcp-server", version: "0.0.1" },
    { capabilities: { tools: {}, resources: {} } },
);

// ── Tool Definitions ────────────────────────────────────────────────────────

interface ToolDef {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
}

const CLI_TOOLS: (ToolDef & { cmd: string[] })[] = [
    {
        name: "rebase_schema_generate",
        description: "Generate Drizzle schema from Rebase TypeScript collection definitions. Run this after adding or modifying collection files.",
        inputSchema: { type: "object", properties: {} },
        cmd: ["schema", "generate"],
    },
    {
        name: "rebase_db_push",
        description: "Apply the current Drizzle schema directly to the database (development shortcut, skips migration files).",
        inputSchema: { type: "object", properties: {} },
        cmd: ["db", "push"],
    },
    {
        name: "rebase_db_pull",
        description: "Introspect the live database and write back a Drizzle schema (reverse-engineer existing tables).",
        inputSchema: { type: "object", properties: {} },
        cmd: ["db", "pull"],
    },
    {
        name: "rebase_db_generate",
        description: "Generate SQL migration files from schema changes (compares current Drizzle schema against the last snapshot).",
        inputSchema: { type: "object", properties: {} },
        cmd: ["db", "generate"],
    },
    {
        name: "rebase_db_migrate",
        description: "Run all pending SQL migrations against the database.",
        inputSchema: { type: "object", properties: {} },
        cmd: ["db", "migrate"],
    },
    {
        name: "rebase_generate_sdk",
        description: "Generate a fully-typed JavaScript/TypeScript SDK from collection definitions.",
        inputSchema: { type: "object", properties: {} },
        cmd: ["generate-sdk"],
    },
];

const DATA_TOOLS: ToolDef[] = [
    {
        name: "list_documents",
        description: "List documents from a Rebase collection with optional filtering, sorting, and pagination.",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection slug" },
                limit: { type: "number", description: "Max results (default 25)" },
                offset: { type: "number", description: "Skip N results" },
                orderBy: { type: "string", description: "Sort field, optionally with :asc or :desc suffix" },
                where: {
                    type: "object",
                    description: "Filter object, e.g. { \"status\": \"eq.active\", \"price\": \"gte.100\" }",
                    additionalProperties: { type: "string" },
                },
            },
            required: ["collection"],
        },
    },
    {
        name: "get_document",
        description: "Get a single document by ID from a Rebase collection.",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection slug" },
                id: { type: "string", description: "Document ID" },
            },
            required: ["collection", "id"],
        },
    },
    {
        name: "create_document",
        description: "Create a new document in a Rebase collection.",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection slug" },
                data: { type: "object", description: "Document fields", additionalProperties: true },
            },
            required: ["collection", "data"],
        },
    },
    {
        name: "update_document",
        description: "Update an existing document in a Rebase collection.",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection slug" },
                id: { type: "string", description: "Document ID" },
                data: { type: "object", description: "Fields to update", additionalProperties: true },
            },
            required: ["collection", "id", "data"],
        },
    },
    {
        name: "delete_document",
        description: "Delete a document from a Rebase collection.",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection slug" },
                id: { type: "string", description: "Document ID" },
            },
            required: ["collection", "id"],
        },
    },
];

const ADMIN_TOOLS: ToolDef[] = [
    {
        name: "list_users",
        description: "List all users registered in the Rebase backend, including their roles.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "create_user",
        description: "Create a new user in the Rebase backend.",
        inputSchema: {
            type: "object",
            properties: {
                email: { type: "string", description: "User email" },
                displayName: { type: "string", description: "Display name" },
                password: { type: "string", description: "Initial password" },
                roles: { type: "array", items: { type: "string" }, description: "Role IDs to assign" },
            },
            required: ["email"],
        },
    },
    {
        name: "update_user",
        description: "Update an existing user (email, display name, roles).",
        inputSchema: {
            type: "object",
            properties: {
                userId: { type: "string", description: "User UID" },
                email: { type: "string" },
                displayName: { type: "string" },
                roles: { type: "array", items: { type: "string" } },
            },
            required: ["userId"],
        },
    },
    {
        name: "delete_user",
        description: "Delete a user from the Rebase backend.",
        inputSchema: {
            type: "object",
            properties: {
                userId: { type: "string", description: "User UID" },
            },
            required: ["userId"],
        },
    },
    {
        name: "list_roles",
        description: "List all roles defined in the Rebase backend.",
        inputSchema: { type: "object", properties: {} },
    },
];

const DEV_TOOLS: ToolDef[] = [
    {
        name: "rebase_dev_start",
        description: "Start the Rebase development server (frontend + backend). Returns immediately — use rebase_dev_logs to check output.",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "rebase_dev_logs",
        description: "Read recent output from the running Rebase dev server.",
        inputSchema: {
            type: "object",
            properties: {
                lines: { type: "number", description: "Number of recent lines to return (default 50)" },
            },
        },
    },
    {
        name: "rebase_dev_stop",
        description: "Stop the running Rebase development server.",
        inputSchema: { type: "object", properties: {} },
    },
];

const ALL_TOOLS: ToolDef[] = [
    ...CLI_TOOLS.map(({ cmd: _c, ...rest }) => rest),
    ...DATA_TOOLS,
    ...ADMIN_TOOLS,
    ...DEV_TOOLS,
];

// ── Tool Handlers ───────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS,
}));

/** Spawn `npx rebase <args>` and capture output. */
function runRebaseCmd(commandArgs: string[]): Promise<string> {
    return new Promise((resolve) => {
        const child = spawn("npx", ["rebase", ...commandArgs], {
            cwd: PROJECT_DIR,
            shell: true,
            env: { ...process.env },
        });
        const chunks: string[] = [];
        child.stdout?.on("data", (d: Buffer) => chunks.push(d.toString()));
        child.stderr?.on("data", (d: Buffer) => chunks.push(d.toString()));
        child.on("error", (err) => resolve(`Error spawning command: ${err.message}`));
        child.on("close", (code) => {
            const output = chunks.join("").trim();
            resolve(code !== 0 ? `Command exited with code ${code}\n\n${output}` : output || "(no output)");
        });
    });
}

// Dev server management
let devProcess: ChildProcess | null = null;
const devLogs: string[] = [];
const MAX_DEV_LOG_LINES = 500;

function appendDevLog(line: string) {
    devLogs.push(line);
    if (devLogs.length > MAX_DEV_LOG_LINES) {
        devLogs.splice(0, devLogs.length - MAX_DEV_LOG_LINES);
    }
}

function textResult(text: string) {
    return { content: [{ type: "text" as const, text }] };
}

function jsonResult(data: unknown) {
    return textResult(JSON.stringify(data, null, 2));
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // ── CLI tools ───────────────────────────────────────────────────────
    const cliTool = CLI_TOOLS.find((t) => t.name === name);
    if (cliTool) {
        const result = await runRebaseCmd(cliTool.cmd);
        return textResult(result);
    }

    // ── Data tools (via @rebasepro/client) ──────────────────────────────
    const client = await getClient();

    switch (name) {
        case "list_documents": {
            const argsObj = args as { collection: string; limit?: number; offset?: number; orderBy?: string; where?: Record<string, unknown> };
            const { collection: slug, limit, offset, orderBy, where } = argsObj;
            const result = await client.data.collection(slug).find({
                limit,
                offset,
                orderBy,
                where,
            });
            return jsonResult(result);
        }

        case "get_document": {
            const argsObj = args as { collection: string; id: string };
            const { collection: slug, id } = argsObj;
            const entity = await client.data.collection(slug).findById(id);
            if (!entity) return textResult(`Document ${id} not found in ${slug}`);
            return jsonResult(entity);
        }

        case "create_document": {
            const argsObj = args as { collection: string; data: Record<string, unknown> };
            const { collection: slug, data } = argsObj;
            const entity = await client.data.collection(slug).create(data);
            return jsonResult(entity);
        }

        case "update_document": {
            const argsObj = args as { collection: string; id: string; data: Record<string, unknown> };
            const { collection: slug, id, data } = argsObj;
            const entity = await client.data.collection(slug).update(id, data);
            return jsonResult(entity);
        }

        case "delete_document": {
            const argsObj = args as { collection: string; id: string };
            const { collection: slug, id } = argsObj;
            await client.data.collection(slug).delete(id);
            return textResult(`Deleted document ${id} from ${slug}`);
        }

        // ── Admin tools ────────────────────────────────────────────────────
        case "list_users": {
            const result = await client.admin.listUsers();
            return jsonResult(result);
        }

        case "create_user": {
            const argsObj = args as { email: string; displayName?: string; password?: string; roles?: string[] };
            const { email, displayName, password, roles } = argsObj;
            const result = await client.admin.createUser({ email, displayName, password, roles });
            return jsonResult(result);
        }

        case "update_user": {
            const argsObj = args as { userId: string; email?: string; displayName?: string; roles?: string[] };
            const { userId, email, displayName, roles } = argsObj;
            const result = await client.admin.updateUser(userId, { email, displayName, roles });
            return jsonResult(result);
        }

        case "delete_user": {
            const argsObj = args as { userId: string };
            const { userId } = argsObj;
            const result = await client.admin.deleteUser(userId);
            return jsonResult(result);
        }

        case "list_roles": {
            const result = await client.admin.listRoles();
            return jsonResult(result);
        }

        // ── Dev server management ──────────────────────────────────────────
        case "rebase_dev_start": {
            if (devProcess && !devProcess.killed) {
                return textResult("Dev server is already running (PID " + devProcess.pid + ")");
            }
            devLogs.length = 0;
            devProcess = spawn("pnpm", ["run", "dev"], {
                cwd: resolve(PROJECT_DIR, "app"),
                shell: true,
                env: { ...process.env },
            });
            devProcess.stdout?.on("data", (d: Buffer) => appendDevLog(d.toString()));
            devProcess.stderr?.on("data", (d: Buffer) => appendDevLog(d.toString()));
            devProcess.on("close", (code) => {
                appendDevLog(`\n[dev server exited with code ${code}]`);
                devProcess = null;
            });
            // Wait a moment for initial output
            await new Promise((r) => setTimeout(r, 2000));
            return textResult(`Dev server started (PID ${devProcess?.pid})\n\n${devLogs.join("")}`);
        }

        case "rebase_dev_logs": {
            const argsObj = args as { lines?: number } | undefined;
            const lineCount = argsObj?.lines ?? 50;
            const recent = devLogs.slice(-lineCount);
            if (recent.length === 0) {
                return textResult(devProcess ? "No output captured yet." : "Dev server is not running.");
            }
            return textResult(recent.join(""));
        }

        case "rebase_dev_stop": {
            if (!devProcess || devProcess.killed) {
                return textResult("Dev server is not running.");
            }
            devProcess.kill("SIGTERM");
            return textResult("Dev server stopped.");
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// ── Resources ───────────────────────────────────────────────────────────────

function findCollectionsDir(): string | null {
    const candidates = [
        resolve(PROJECT_DIR, "app", "shared", "collections"),
        resolve(PROJECT_DIR, "shared", "collections"),
        resolve(PROJECT_DIR, "collections"),
    ];
    for (const dir of candidates) {
        if (existsSync(dir)) return dir;
    }
    return null;
}

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources: Array<{ uri: string; name: string; description: string; mimeType: string }> = [];

    // Collection files
    const collectionsDir = findCollectionsDir();
    if (collectionsDir) {
        const files = readdirSync(collectionsDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
        for (const file of files) {
            const name = file.replace(/\.ts$/, "");
            resources.push({
                uri: `rebase://collections/${name}`,
                name: `Collection: ${name}`,
                description: `TypeScript collection definition for "${name}"`,
                mimeType: "text/typescript",
            });
        }
    }

    // Generated schema
    const schemaPath = resolve(PROJECT_DIR, "app", "backend", "src", "schema.generated.ts");
    if (existsSync(schemaPath)) {
        resources.push({
            uri: "rebase://schema",
            name: "Generated Drizzle Schema",
            description: "Auto-generated Drizzle ORM schema from collection definitions",
            mimeType: "text/typescript",
        });
    }

    return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri === "rebase://schema") {
        const schemaPath = resolve(PROJECT_DIR, "app", "backend", "src", "schema.generated.ts");
        if (!existsSync(schemaPath)) {
            throw new Error("Generated schema not found. Run `rebase schema generate` first.");
        }
        return {
            contents: [{
                uri,
                mimeType: "text/typescript",
                text: readFileSync(schemaPath, "utf-8"),
            }],
        };
    }

    const collectionMatch = uri.match(/^rebase:\/\/collections\/(.+)$/);
    if (collectionMatch) {
        const name = collectionMatch[1];
        const collectionsDir = findCollectionsDir();
        if (!collectionsDir) throw new Error("Collections directory not found.");

        const filePath = join(collectionsDir, `${name}.ts`);
        if (!existsSync(filePath)) throw new Error(`Collection "${name}" not found.`);

        return {
            contents: [{
                uri,
                mimeType: "text/typescript",
                text: readFileSync(filePath, "utf-8"),
            }],
        };
    }

    throw new Error(`Unknown resource: ${uri}`);
});

// ── Start ───────────────────────────────────────────────────────────────────

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);
