import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    isLoggedIn,
    getCurrentUserEmail,
    loginFlow,
    logoutFlow,
} from "../auth.js";

/**
 * Register login/logout tools — same flow as `firecms login` CLI.
 */
export function registerAuthTools(server: McpServer) {

    server.registerTool(
        "firecms_login",
        {
            description: "Sign in to FireCMS Cloud. Opens a browser window for Google OAuth authentication. Required before using any other tools.",
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
            description: "Sign out of FireCMS Cloud. Revokes the current session.",
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

    server.registerTool(
        "firecms_get_current_user",
        {
            description: "Get the currently authenticated FireCMS user",
        },
        async () => {
            const email = getCurrentUserEmail();
            if (!email) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "Not logged in. Use firecms_login to sign in.",
                    }],
                };
            }
            return {
                content: [{
                    type: "text" as const,
                    text: `Logged in as: ${email}`,
                }],
            };
        }
    );
}
