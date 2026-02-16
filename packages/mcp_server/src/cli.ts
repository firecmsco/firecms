#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createFireCMSMcpServer } from "./server.js";
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

    const server = createFireCMSMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);

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
