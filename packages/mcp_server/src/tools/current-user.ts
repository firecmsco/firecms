import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FireCMSServerMode, FireCMSSession } from "../session.js";

/**
 * Register the tool that says who the server is acting for.
 */
export function registerCurrentUserTool(server: McpServer, session: FireCMSSession, mode: FireCMSServerMode) {

    server.registerTool(
        "firecms_get_current_user",
        {
            title: "Current user",
            description: "Get the currently authenticated FireCMS user",
            annotations: { title: "Current user", readOnlyHint: true },
        },
        async () => {
            const email = await session.email();
            if (!email) {
                return {
                    content: [{
                        type: "text" as const,
                        // A hosted request without a user is refused before it gets here,
                        // so only the local server can be signed out.
                        text: mode === "local"
                            ? "Not logged in. Use firecms_login to sign in."
                            : "Not signed in.",
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
