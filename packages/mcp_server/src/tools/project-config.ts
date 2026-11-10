import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";
import { describeError } from "./errors.js";

/**
 * The only formats the CMS's theme code reads; anything else crashed the project's CMS.
 * A fresh schema per field, and no `/i` flag: JSON Schema patterns have no flags, so the
 * published pattern would refuse "#0070F4", and a shared instance is published as a $ref.
 */
const hexColor = () => z.string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a hex color, #rgb or #rrggbb (e.g. '#0070F4')");

/**
 * The locales FireCMS formats dates in: the `Locale` type of @firecms/core
 * (packages/firecms_core/src/types/locales.ts), date-fns keys. The CMS hands the stored
 * value to both date-fns and Intl, so "en_US" did nothing in one and threw in the other.
 * Keep in sync.
 */
const FIRECMS_LOCALES = [
    "af", "ar", "arDZ", "arMA", "arSA", "az", "be", "bg", "bn", "ca", "cs", "cy", "da", "de", "el",
    "en", "enAU", "enCA", "enGB", "enIN", "enNZ", "enUS", "eo", "es", "et", "eu", "faIR", "fi", "fil",
    "fr", "frCA", "frCH", "gd", "gl", "gu", "he", "hi", "hr", "hu", "hy", "id", "is", "it", "ja", "ka",
    "kk", "kn", "ko", "lb", "lt", "lv", "mk", "ms", "mt", "nb", "nl", "nlBE", "nn", "pl", "pt", "ptBR",
    "ro", "ru", "sk", "sl", "sr", "srLatn", "sv", "ta", "te", "th", "tr", "ug", "uk", "uz", "vi",
    "zhCN", "zhTW"
];
const localesByFoldedKey = new Map(FIRECMS_LOCALES.map((locale) => [locale.toLowerCase(), locale]));

/** The FireCMS locale a value names in any spelling ("en_US", "en-US" → "enUS"), or its language's. */
function resolveFireCMSLocale(value: string): { locale?: string; closest?: string } {
    const parts = value.trim().split(/[-_\s]+/).filter(Boolean);
    if (parts.length === 0) return {};
    const locale = localesByFoldedKey.get(parts.join("").toLowerCase());
    return locale ? { locale } : { closest: localesByFoldedKey.get(parts[0].toLowerCase()) };
}

const Locale = z.string()
    .superRefine((value, ctx) => {
        const { locale, closest } = resolveFireCMSLocale(value);
        if (!locale) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be a FireCMS locale such as 'en', 'es' or 'enUS'" +
                    (closest ? `; the closest one supported is '${closest}'` : ""),
            });
        }
    })
    .transform((value) => resolveFireCMSLocale(value).locale!);

/**
 * Register project configuration tools — manage project settings like
 * name, colors, locale, feature toggles, etc. Admin-only operations.
 */
export function registerProjectConfigTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Get project configuration ──────────────────────

    server.registerTool(
        "get_project_config",
        {
            title: "Get project settings",
            description: `Get the full configuration for a FireCMS project, including:
- Project name, logo, and brand colors (primary/secondary)
- Subscription plan and trial status
- Feature toggles (text search, entity history, App Check)
- Default locale settings
- Customization revision info`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
            },
            annotations: { title: "Get project settings", readOnlyHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Update project name ────────────────────────────

    server.registerTool(
        "update_project_name",
        {
            title: "Rename project",
            description: "Update the display name of a FireCMS project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                name: z.string().trim().min(1, "The project name can't be empty").describe("New project name"),
            },
            annotations: { title: "Rename project", readOnlyHint: false, destructiveHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Update brand colors ────────────────────────────

    server.registerTool(
        "update_project_colors",
        {
            title: "Change brand colors",
            description: "Update the primary and/or secondary brand colors for the CMS UI. Colors should be hex values (e.g., '#0070F4').",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                primaryColor: hexColor().optional().describe("Primary color hex, #rgb or #rrggbb (e.g., '#0070F4')"),
                secondaryColor: hexColor().optional().describe("Secondary color hex, #rgb or #rrggbb (e.g., '#FF5B79')"),
            },
            annotations: { title: "Change brand colors", readOnlyHint: false, destructiveHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Update default locale ──────────────────────────

    server.registerTool(
        "update_default_locale",
        {
            title: "Change default locale",
            description: "Change the default locale for the CMS (affects date formatting, etc.).",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                locale: Locale.describe("FireCMS locale for dates (e.g., 'en', 'es', 'de', 'fr', 'it', 'enUS', 'ptBR'); 'en-US' and 'en_US' are read as 'enUS'"),
            },
            annotations: { title: "Change default locale", readOnlyHint: false, destructiveHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 5. Toggle text search ─────────────────────────────

    server.registerTool(
        "toggle_text_search",
        {
            title: "Turn text search on or off",
            description: "Enable or disable the local text search feature for a project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                enabled: z.boolean().describe("true to enable, false to disable"),
            },
            annotations: { title: "Turn text search on or off", readOnlyHint: false, destructiveHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 6. Toggle entity history ──────────────────────────

    server.registerTool(
        "toggle_entity_history",
        {
            title: "Turn entity history on or off",
            description: "Enable or disable entity history tracking (audit log of document changes) for a project.",
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                enabled: z.boolean().describe("true to enable, false to disable"),
            },
            annotations: { title: "Turn entity history on or off", readOnlyHint: false, destructiveHint: true },
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
                    content: [{ type: "text" as const, text: `Error: ${describeError(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
