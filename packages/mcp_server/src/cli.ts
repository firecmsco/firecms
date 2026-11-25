#!/usr/bin/env node

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createFireCMSMcpServer, loadFireCMSSkills } from "./index.js";
import { getCurrentUserEmail } from "./auth.js";

/**
 * FireCMS MCP Server CLI
 *
 * Usage:
 *   firecms-mcp
 *
 * Auth is handled interactively via the firecms_login tool (browser OAuth),
 * same flow as `firecms login` in the CLI. Tokens are stored at ~/.firecms/tokens.json.
 *
 * Claude Desktop config (claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "firecms": {
 *         "command": "node",
 *         "args": ["/path/to/packages/mcp_server/dist/cli.js"]
 *       }
 *     }
 *   }
 */
/**
 * Route every console channel to stderr.
 *
 * On a stdio transport, stdout carries the JSON-RPC stream — a single stray
 * `console.log` anywhere in the process corrupts it and kills the session. Our own
 * code is careful, but dependencies are not: `@firecms/schema_inference` logs while
 * inferring properties, and `@firecms/cli` logs during the login flow. Redirecting
 * the console keeps those messages visible for debugging without putting them on the
 * wire. The transport writes to `process.stdout` directly, so it is unaffected.
 */
function redirectConsoleToStderr() {
    const toStderr = (...args: any[]) => {
        process.stderr.write(args.map(a =>
            typeof a === "string" ? a : JSON.stringify(a)
        ).join(" ") + "\n");
    };
    console.log = toStderr;
    console.info = toStderr;
    console.debug = toStderr;
    console.warn = toStderr;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
FireCMS MCP Server — Model Context Protocol server for FireCMS Cloud

Usage:
  firecms-mcp

No configuration needed. Authentication is handled interactively
via the firecms_login tool, which opens a browser for Google OAuth.
Tokens are stored at ~/.firecms/tokens.json (shared with the FireCMS CLI).

Claude Desktop config (claude_desktop_config.json):
  {
    "mcpServers": {
      "firecms": {
        "command": "npx",
        "args": ["@firecms/mcp-server"]
      }
    }
  }
`);
        process.exit(0);
    }

    // Must happen before anything else can log.
    redirectConsoleToStderr();

    // The skills are read once; every server instance serves the same catalog.
    // `serveStdio` decides the protocol era from the client's opening message
    // (2026-07-28 `server/discover`, or a 2025 `initialize`) and builds the server
    // for it from this factory.
    const skills = await loadFireCMSSkills();
    serveStdio(() => createFireCMSMcpServer({ skills }), {
        onerror: (error) => console.error(`[firecms-mcp] ${error.message}`),
    });

    // Log to stderr (stdout is reserved for MCP protocol)
    const email = getCurrentUserEmail();
    console.error("FireCMS MCP server started");
    if (email) {
        console.error(`  Logged in as: ${email}`);
    } else {
        console.error("  Not logged in — use the firecms_login tool to sign in");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
