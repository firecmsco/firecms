import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";

const server = new Server(
  {
    name: "rebase-mcp-server",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "rebase_schema_generate",
    description:
      "Generate Drizzle schema from Rebase TypeScript collection definitions. " +
      "Run this after adding or modifying collection files.",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["schema", "generate"],
  },
  {
    name: "rebase_db_push",
    description:
      "Apply the current Drizzle schema directly to the database (development shortcut, skips migration files).",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["db", "push"],
  },
  {
    name: "rebase_db_pull",
    description:
      "Introspect the live database and write back a Drizzle schema (reverse-engineer existing tables).",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["db", "pull"],
  },
  {
    name: "rebase_db_generate",
    description:
      "Generate SQL migration files from schema changes (compares current Drizzle schema against the last snapshot).",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["db", "generate"],
  },
  {
    name: "rebase_db_migrate",
    description:
      "Run all pending SQL migrations against the database.",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["db", "migrate"],
  },
  {
    name: "rebase_generate_sdk",
    description:
      "Generate a fully-typed JavaScript/TypeScript SDK from collection definitions.",
    inputSchema: { type: "object" as const, properties: {} },
    cmd: ["generate-sdk"],
  },
] as const;

// ── Handlers ────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ cmd: _cmd, ...rest }) => rest),
}));

/**
 * Spawn `npx rebase <args>` and capture all output.
 * Uses Node built-in child_process to avoid execa version conflicts in the monorepo.
 */
function runRebaseCmd(commandArgs: readonly string[]): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["rebase", ...commandArgs], {
      cwd: process.cwd(),
      shell: true,
      env: { ...process.env },
    });

    const chunks: string[] = [];

    child.stdout?.on("data", (d: Buffer) => chunks.push(d.toString()));
    child.stderr?.on("data", (d: Buffer) => chunks.push(d.toString()));

    child.on("error", (err) => {
      resolve(`Error spawning command: ${err.message}`);
    });

    child.on("close", (code) => {
      const output = chunks.join("").trim();
      if (code !== 0) {
        resolve(`Command exited with code ${code}\n\n${output}`);
      } else {
        resolve(output || "(no output)");
      }
    });
  });
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const result = await runRebaseCmd(tool.cmd);
  return {
    content: [{ type: "text", text: result }],
  };
});

// ── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
