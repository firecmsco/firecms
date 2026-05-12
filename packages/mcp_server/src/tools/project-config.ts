import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Register project configuration tools — manage project settings like
 * name, colors, locale, feature toggles, etc. Admin-only operations.
 */
export function registerProjectConfigTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Get project configuration ──────────────────────

    server.registerTool(
        "get_project_config",
        {
            description: `Get the full configuration for a FireCMS project, including:
- Project name, logo, and brand colors (primary/secondary)
- Subscription plan and trial status
- Feature toggles (text search, entity history, App Check)
- Default locale settings
- Customization revision info`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId }) => {
            try {
                await api.assertAdmin(projectId);
                const config = await api.getProjectConfig(projectId);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(config, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Update project name ────────────────────────────

    server.registerTool(
        "update_project_name",
        {
            description: "Update the display name of a FireCMS project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                name: z.string().describe("New project name"),
            },
        },
        async ({ projectId, name }) => {
            try {
                await api.assertAdmin(projectId);
                await api.updateProjectConfig(projectId, { name });
                return {
                    content: [{
                        type: "text" as const,
                        text: `Project name updated to "${name}".`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Update brand colors ────────────────────────────

    server.registerTool(
        "update_project_colors",
        {
            description: "Update the primary and/or secondary brand colors for the CMS UI. Colors should be hex values (e.g., '#0070F4').",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                primaryColor: z.string().optional().describe("Primary color hex (e.g., '#0070F4')"),
                secondaryColor: z.string().optional().describe("Secondary color hex (e.g., '#FF5B79')"),
            },
        },
        async ({ projectId, primaryColor, secondaryColor }) => {
            try {
                await api.assertAdmin(projectId);
                const data: Record<string, any> = {};
                if (primaryColor) data.primary_color = primaryColor;
                if (secondaryColor) data.secondary_color = secondaryColor;
                await api.updateProjectConfig(projectId, data);
                const parts: string[] = [];
                if (primaryColor) parts.push(`primary → ${primaryColor}`);
                if (secondaryColor) parts.push(`secondary → ${secondaryColor}`);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Brand colors updated: ${parts.join(", ")}.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Update default locale ──────────────────────────

    server.registerTool(
        "update_default_locale",
        {
            description: "Change the default locale for the CMS (affects date formatting, etc.).",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                locale: z.string().describe("Locale code (e.g., 'en', 'es', 'de', 'fr', 'it')"),
            },
        },
        async ({ projectId, locale }) => {
            try {
                await api.assertAdmin(projectId);
                await api.updateProjectConfig(projectId, { default_locale: locale });
                return {
                    content: [{
                        type: "text" as const,
                        text: `Default locale updated to "${locale}".`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 5. Toggle text search ─────────────────────────────

    server.registerTool(
        "toggle_text_search",
        {
            description: "Enable or disable the local text search feature for a project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                enabled: z.boolean().describe("true to enable, false to disable"),
            },
        },
        async ({ projectId, enabled }) => {
            try {
                await api.assertAdmin(projectId);
                await api.updateProjectConfig(projectId, { local_text_search_enabled: enabled });
                return {
                    content: [{
                        type: "text" as const,
                        text: `Local text search ${enabled ? "enabled" : "disabled"}.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 6. Toggle entity history ──────────────────────────

    server.registerTool(
        "toggle_entity_history",
        {
            description: "Enable or disable entity history tracking (audit log of document changes) for a project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                enabled: z.boolean().describe("true to enable, false to disable"),
            },
        },
        async ({ projectId, enabled }) => {
            try {
                await api.assertAdmin(projectId);
                await api.updateProjectConfig(projectId, { history_default_enabled: enabled });
                return {
                    content: [{
                        type: "text" as const,
                        text: `Entity history tracking ${enabled ? "enabled" : "disabled"}.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
