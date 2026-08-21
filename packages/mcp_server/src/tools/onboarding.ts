import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Format an error coming back from the backend so the agent can act on it rather
 * than just seeing "Request failed with status code 400".
 */
function formatError(error: any): string {
    const data = error.response?.data;
    const code = data?.code;
    const message = data?.message ?? data?.error ?? error.message;

    const hints: Record<string, string> = {
        "firecms-project-already-exists":
            "This project is already connected to FireCMS Cloud. Use list_projects to see it.",
        "firebase-not-activated-in-project":
            "Firebase is not enabled on this Google Cloud project. Enable it in the Firebase console, then retry.",
        "no-access-to-project":
            "The signed-in Google account cannot access this project. Check the project ID, or sign in with an account that has access.",
        "google-token-expired":
            "The Google session has expired. Use firecms_logout then firecms_login to sign in again.",
        "delegated-firebase-app-initialization-failed":
            "FireCMS could not open the project with its service account. If the underlying error is " +
            "auth/configuration-not-found, Firebase Authentication is not enabled on the project — " +
            "enable it in the Firebase console and retry.",
    };

    const hint = code && hints[code] ? ` — ${hints[code]}` : "";
    return `${message}${hint}`;
}


/**
 * Firebase Authentication has to be switched on by hand in the Firebase console.
 *
 * There is no API for it — the web onboarding sends the user to the console and
 * polls until it appears, and this server has no better option. Connecting a project
 * without it fails deep inside the backend with "Unable to initialize delegated
 * Firebase app", because creating the project's first admin user needs Auth; the
 * underlying cause, `auth/configuration-not-found`, is not visible in that message.
 */
function authNotEnabledMessage(projectId: string): string {
    return `Firebase Authentication is not enabled on "${projectId}", and connecting requires it: ` +
        `FireCMS creates your admin user in the project's own Firebase Auth.\n\n` +
        `It cannot be enabled through an API — turn it on once in the console:\n` +
        `  https://console.firebase.google.com/project/${projectId}/authentication\n\n` +
        `Click "Get started", then run this tool again. Nothing has been changed in the project.`;
}

/**
 * Register the tools that connect a Firebase project to FireCMS Cloud.
 *
 * These run *before* a project exists in FireCMS, so none of them can go through
 * `assertAdmin` — there is no project membership to check yet.
 */
export function registerOnboardingTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Discover connectable projects ──────────────────

    server.registerTool(
        "list_firebase_projects",
        {
            description:
                "List the Google Cloud / Firebase projects the signed-in user can access, and " +
                "whether each one is ready to be connected to FireCMS Cloud. Use this first when " +
                "connecting an existing project.\n\n" +
                "Each entry reports:\n" +
                "- `fireCMSProject`: true if it is ALREADY connected to FireCMS Cloud\n" +
                "- `cloudProjectConfigurationStatus.firebaseEnabled` / `firestoreEnabled` / " +
                "`apisEnabled` / `authEnabled`: prerequisites for connecting\n\n" +
                "A project needs Firebase and Firestore enabled before connect_project_to_firecms " +
                "will succeed.",
            annotations: { readOnlyHint: true },
        },
        async () => {
            try {
                const projects = await api.listAvailableFirebaseProjects();
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(projects, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error listing Firebase projects: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Status of a single project ─────────────────────

    server.registerTool(
        "get_project_setup_status",
        {
            description:
                "Get the detailed FireCMS readiness status of a single Google Cloud project: " +
                "whether Firebase, Firestore, Storage, Auth and the required APIs are enabled. " +
                "Use this to work out what is still missing before connecting a project.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId }) => {
            try {
                const status = await api.getProjectSetupStatus(projectId);
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(status, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Prerequisites ──────────────────────────────────

    server.registerTool(
        "list_firestore_locations",
        {
            description:
                "List the locations available for creating a Firestore database. Needed as the " +
                "`locationId` argument of enable_firestore.",
            annotations: { readOnlyHint: true },
        },
        async () => {
            try {
                const locations = await api.listAvailableLocations();
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(locations, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "enable_project_apis",
        {
            description:
                "Enable the Google Cloud APIs that FireCMS requires on a project. Run this when " +
                "get_project_setup_status reports `apisEnabled: false`. Safe to run more than once.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
            },
        },
        async ({ projectId }) => {
            try {
                const result = await api.enableProjectApis(projectId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `APIs enabled for "${projectId}".\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error enabling APIs: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "enable_firestore",
        {
            description:
                "Create the default Firestore database in a Google Cloud project. Run this when " +
                "get_project_setup_status reports `firestoreEnabled: false`. The location is " +
                "permanent and cannot be changed later — use list_firestore_locations and confirm " +
                "the choice with the user before calling this.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
                locationId: z.string().describe("Firestore location, e.g. 'eur3' or 'us-central'. Permanent."),
            },
        },
        async ({ projectId, locationId }) => {
            try {
                const result = await api.enableFirestore(projectId, locationId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Firestore created for "${projectId}" in ${locationId}.\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error enabling Firestore: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Connect ────────────────────────────────────────

    server.registerTool(
        "connect_project_to_firecms",
        {
            description:
                "Connect an existing Firebase project to FireCMS Cloud. This is the main " +
                "onboarding step.\n\n" +
                "It creates a delegated service account in the project with the permissions " +
                "FireCMS needs, registers the signed-in user as an admin, and creates the FireCMS " +
                "project on the free plan.\n\n" +
                "Prerequisites: Firebase, Firestore AND Firebase Authentication must already be " +
                "enabled — check with list_firebase_projects or get_project_setup_status first. " +
                "Authentication in particular cannot be enabled through any API and has to be " +
                "switched on once in the Firebase console. Fails if the project is already " +
                "connected.\n\n" +
                "After this succeeds, use infer_collections_from_data or setup_all_collections to " +
                "populate the CMS from the project's existing Firestore data.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID to connect"),
                creationType: z.enum(["existing", "new"]).optional()
                    .describe("'existing' (default) for a project that already has data; 'new' for a freshly created one"),
            },
        },
        async ({ projectId, creationType }) => {
            try {
                // Checked up front: without it the backend fails after eight retries
                // with a message that does not mention Authentication at all.
                try {
                    const status = await api.getProjectSetupStatus(projectId);
                    if (status && status.authEnabled === false) {
                        return {
                            content: [{ type: "text" as const, text: authNotEnabledMessage(projectId) }],
                            isError: true,
                        };
                    }
                } catch {
                    // Status is advisory; if it cannot be read, let the connect speak.
                }

                const result = await api.connectProject(projectId, creationType ?? "existing");
                return {
                    content: [{
                        type: "text" as const,
                        text: `Project "${projectId}" is now connected to FireCMS Cloud.\n\n` +
                            `${JSON.stringify(result, null, 2)}\n\n` +
                            `Next: run setup_all_collections to infer collections from the existing ` +
                            `Firestore data, or create them yourself with save_collection_schema.\n\n` +
                            `Note: the project's service account was just created, and its permissions ` +
                            `take a moment to propagate. A data call made immediately may fail with ` +
                            `PERMISSION_DENIED — if it does, simply try again.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error connecting project: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "create_firecms_webapp",
        {
            description:
                "Create the FireCMS web app inside the client's Firebase project. Normally done " +
                "automatically by connect_project_to_firecms — use this only to retry when that " +
                "step failed.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
            },
        },
        async ({ projectId }) => {
            try {
                const result = await api.createWebApp(projectId);
                return {
                    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error creating web app: ${formatError(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
