import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register user management tools.
 */
export function registerUserTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "list_users",
        {
            description: "List all users that have access to a FireCMS project, including their roles (admin, editor, viewer)",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
            },
        },
        async ({ projectId }) => {
            try {
                const result = await api.listUsers(projectId);
                return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        "add_user",
        {
            description: "Invite a new user to a FireCMS project. Sends an invitation email.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
                email: z.string().email().describe("Email address of the user to invite"),
                roles: z.array(z.enum(["admin", "editor", "viewer"])).describe("Roles to assign"),
            },
        },
        async ({ projectId, email, roles }) => {
            try {
                const result = await api.createUser(projectId, email, roles);
                return {
                    content: [{ type: "text" as const, text: `Invited ${email} with roles: ${roles.join(", ")}\n\n${JSON.stringify(result, null, 2)}` }],
                };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        "update_user_roles",
        {
            description: "Update the roles of an existing user in a FireCMS project",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
                userId: z.string().describe("The user ID to update"),
                roles: z.array(z.enum(["admin", "editor", "viewer"])).describe("New roles"),
            },
        },
        async ({ projectId, userId, roles }) => {
            try {
                const result = await api.updateUser(projectId, userId, roles);
                return {
                    content: [{ type: "text" as const, text: `Updated user ${userId} roles to: ${roles.join(", ")}\n\n${JSON.stringify(result, null, 2)}` }],
                };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        "remove_user",
        {
            description: "Remove a user from a FireCMS project, revoking their access",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
                userId: z.string().describe("The user ID to remove"),
            },
        },
        async ({ projectId, userId }) => {
            try {
                const result = await api.deleteUser(projectId, userId);
                return {
                    content: [{ type: "text" as const, text: `Removed user ${userId}\n\n${JSON.stringify(result, null, 2)}` }],
                };
            } catch (error: any) {
                return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
            }
        }
    );
}
