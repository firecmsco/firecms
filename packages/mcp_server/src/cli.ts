#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRebaseMcpServer } from "./server.js";
import { getCurrentUserEmail } from "./auth.js";

/**
 * Rebase MCP Server CLI
 *
 * Usage:
 *   rebase-mcp
 *
 * Auth is handled interactively via the rebase_login tool (browser OAuth),
 * same flow as `rebase login` in the CLI. Tokens are stored at ~/.rebase/tokens.json.
 *
 * Claude Desktop config (claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "rebase": {
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
Rebase MCP Server — Model Context Protocol server for Rebase Cloud

Usage:
  rebase-mcp

No configuration needed. Authentication is handled interactively
via the rebase_login tool, which opens a browser for Google OAuth.
Tokens are stored at ~/.rebase/tokens.json (shared with the Rebase CLI).

Claude Desktop config (claude_desktop_config.json):
  {
    "mcpServers": {
      "rebase": {
        "command": "npx",
        "args": ["@rebasepro/mcp-server"]
      }
    }
  }
`);
    process.exit(0);
  }

  const server = createRebaseMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  const email = getCurrentUserEmail();
  console.error("Rebase MCP server started");
  if (email) {
    console.error(`  Logged in as: ${email}`);
  } else {
    console.error("  Not logged in — use the rebase_login tool to sign in");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
