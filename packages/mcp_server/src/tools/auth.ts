import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    isLoggedIn,
    getCurrentUserEmail,
    loginFlow,
    logoutFlow,
} from "../auth.js";
import { clearBackendTokenCache } from "../backend-auth.js";

/**
 * Register login/logout tools — same flow as `firecms login` CLI.
 *
 * Local server only: they open a browser on this machine and keep tokens in
 * `~/.firecms/tokens.json`. The hosted server's clients sign in with OAuth when
 * they connect, so it has nothing to log in to.
 */
export function registerAuthTools(server: McpServer) {

    server.registerTool(
        "firecms_login",
        {
            title: "Sign in to FireCMS",
            description: "Sign in to FireCMS Cloud. Opens a browser window for Google OAuth authentication. Required before using any other tools.",
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        async () => {
            const existingEmail = getCurrentUserEmail();
            if (existingEmail) {
                return {
                    content: [{
                        type: "text" as const,
                        text: `Already logged in as ${existingEmail}. Use firecms_logout to sign out first.`,
                    }],
                };
            }

            try {
                await loginFlow();
                const email = getCurrentUserEmail();
                return {
                    content: [{
                        type: "text" as const,
                        text: `Successfully logged in as ${email ?? "unknown"}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{
                        type: "text" as const,
                        text: `Login failed: ${error.message}`,
                    }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "firecms_logout",
        {
            title: "Sign out of FireCMS",
            description: "Sign out of FireCMS Cloud. Revokes the current session.",
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        async () => {
            if (!isLoggedIn()) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "Not currently logged in.",
                    }],
                };
            }

            const email = getCurrentUserEmail();
            try {
                await logoutFlow();
                // Drop the exchanged FireCMS backend token too, or the session would
                // survive the logout until it expired on its own.
                clearBackendTokenCache();
                return {
                    content: [{
                        type: "text" as const,
                        text: `Successfully logged out ${email ?? ""}`.trim(),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{
                        type: "text" as const,
                        text: `Logout failed: ${error.message}`,
                    }],
                    isError: true,
                };
            }
        }
    );
}
