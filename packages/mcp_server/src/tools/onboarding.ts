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
 *
 * Connecting a project provisions it on Google Cloud as the user, with their
 * `cloud-platform` token. Only the local server has one; the hosted server gets
 * `hosted` and offers a link to the web app for that step instead.
 */
export function registerOnboardingTools(
    server: McpServer,
    api: FireCMSApiClient,
    { hosted }: { hosted?: { appUrl: string } } = {}
) {
    if (hosted) {
        registerConnectInWebAppTool(server, hosted.appUrl);
    } else {
        registerGoogleCloudTools(server, api);
    }
    registerProjectRepairTools(server, api);
}

/**
 * The hosted server's stand-in for the Google Cloud tools: the same entry point by
 * name, answered with the link to connect the project in FireCMS Cloud.
 */
function registerConnectInWebAppTool(server: McpServer, appUrl: string) {
    server.registerTool(
        "connect_project_to_firecms",
        {
            title: "Connect a Firebase project",
            description:
                "Get the link to connect a Firebase project to FireCMS Cloud.\n" +
                "\n" +
                "Connecting creates a service account in the user's Google Cloud project, which takes their own Google Cloud permissions. This server holds none, so the step happens in the FireCMS Cloud web app and takes about a minute; this tool returns the link to it. Once connected, the project is listed with the user's other FireCMS projects and can be managed from here.",
            inputSchema: {
                projectId: z.string().optional().describe("The Firebase project to connect, if the user named one"),
            },
            annotations: { title: "Connect a Firebase project", readOnlyHint: true },
        },
        async ({ projectId }) => ({
            content: [{
                type: "text" as const,
                text: `Connecting a Firebase project needs your Google Cloud permissions, so it ` +
                    `happens in FireCMS Cloud rather than here:\n\n` +
                    `  ${appUrl}/new\n\n` +
                    `Sign in with the Google account that has access to ` +
                    `${projectId ? `"${projectId}"` : "the project"}, pick it, and follow the steps ` +
                    `(about a minute). Once it is connected it shows up in list_projects, and ` +
                    `everything else can be done from here.`,
            }],
        })
    );
}

/**
 * Discover, prepare and connect Google Cloud projects, as the signed-in user.
 * Local server only: these need the user's Google `cloud-platform` token.
 */
function registerGoogleCloudTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. Discover connectable projects ──────────────────

    server.registerTool(
        "list_firebase_projects",
        {
            title: "List Firebase projects",
            description:
                "List the Google Cloud / Firebase projects the signed-in user can access, and whether each one is ready to be connected to FireCMS Cloud.\n" +
                "\n" +
                "Each entry reports:\n" +
                "- `fireCMSProject`: true if it is already connected to FireCMS Cloud\n" +
                "- `cloudProjectConfigurationStatus.firebaseEnabled` / `firestoreEnabled` / `apisEnabled` / `authEnabled`: what connecting requires\n" +
                "\n" +
                "Connecting needs Firebase, Firestore and Firebase Authentication enabled.",
            annotations: { title: "List Firebase projects", readOnlyHint: true },
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
            title: "Check project setup",
            description:
                "Get the detailed FireCMS readiness status of a single Google Cloud project: whether Firebase, Firestore, Storage, Auth and the required APIs are enabled, and so what is still missing before it can be connected.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
            },
            annotations: { title: "Check project setup", readOnlyHint: true },
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
            title: "List Firestore locations",
            description:
                "List the locations available for a new Firestore database, as location IDs such as 'eur3' or 'us-central'.",
            annotations: { title: "List Firestore locations", readOnlyHint: true },
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
            title: "Enable required APIs",
            description:
                "Enable the Google Cloud APIs that FireCMS requires on a project (reported as `apisEnabled` in its setup status). Safe to run more than once.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
            },
            annotations: { title: "Enable required APIs", readOnlyHint: false, destructiveHint: false },
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
            title: "Create Firestore database",
            description:
                "Create the default Firestore database in a Google Cloud project, in the given location. The location is permanent and cannot be changed later.",
            inputSchema: {
                projectId: z.string().describe("The Google Cloud / Firebase project ID"),
                locationId: z.string().describe("Firestore location, e.g. 'eur3' or 'us-central'. Permanent."),
            },
            annotations: { title: "Create Firestore database", readOnlyHint: false, destructiveHint: false },
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
            title: "Connect a Firebase project",
            description:
                "Connect an existing Firebase project to FireCMS Cloud.\n" +
                "\n" +
                "It creates a delegated service account in the project with the permissions FireCMS needs, registers the signed-in user as an admin, creates the FireCMS project on the free plan, and by default adds FireCMS's access rule to the project's Firestore and Storage security rules.\n" +
                "\n" +
                "Firebase, Firestore and Firebase Authentication must already be enabled on the project. Authentication cannot be enabled through any API: it is switched on once in the Firebase console. Fails if the project is already connected.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID to connect"),
                creationType: z.enum(["existing", "new"]).optional()
                    .describe("'existing' (default) for a project that already has data; 'new' for a freshly created one"),
                applySecurityRules: z.boolean().optional()
                    .describe("Add FireCMS's Firestore and Storage access rule as part of connecting (default true). The CMS cannot open any collection without it."),
            },
            // It also adds FireCMS's rule to the project's security rules.
            annotations: { title: "Connect a Firebase project", readOnlyHint: false, destructiveHint: true },
        },
        async ({ projectId, creationType, applySecurityRules }) => {
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

                // The web creation flow applies the access rule as one of its steps, so
                // a project onboarded there works the moment it is opened. Nothing
                // downstream here would catch a missing rule: these tools read through
                // the backend's delegated service account, which bypasses security
                // rules entirely, so the CMS would be broken for the human while every
                // tool reported success.
                let rulesNote: string;
                if (applySecurityRules === false) {
                    rulesNote = `Security rules were NOT applied, because applySecurityRules was false. ` +
                        `Opening a collection in the CMS will fail with "Missing Firestore Security Rules" ` +
                        `until you run apply_firestore_security_rules.`;
                } else {
                    try {
                        await api.applySecurityRules(projectId);
                        rulesNote = `FireCMS's access rule was added to the project's Firestore and Storage ` +
                            `security rules, so the CMS can read the data.`;
                    } catch (rulesError: any) {
                        rulesNote = `The project is connected, but adding the security rules failed: ` +
                            `${formatError(rulesError)}\n` +
                            `Run apply_firestore_security_rules to retry — until it succeeds, opening a ` +
                            `collection in the CMS fails with "Missing Firestore Security Rules".`;
                    }
                }

                return {
                    content: [{
                        type: "text" as const,
                        text: `Project "${projectId}" is now connected to FireCMS Cloud.\n\n` +
                            `${JSON.stringify(result, null, 2)}\n\n` +
                            `${rulesNote}\n\n` +
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
}

/**
 * Repair steps for a project that is already connected. The backend runs them with
 * the user's Google token when there is one, and with the project's own service
 * account otherwise, so they work on the hosted server too.
 */
function registerProjectRepairTools(server: McpServer, api: FireCMSApiClient) {

    server.registerTool(
        "apply_firestore_security_rules",
        {
            title: "Apply FireCMS security rules",
            description:
                "Add FireCMS's access rule to a project's Firestore and Storage security rules. Requires admin.\n" +
                "\n" +
                "FireCMS Cloud reads the customer's Firestore from the browser using the signed-in user's own token, so it needs a rule granting access to users carrying the `fireCMSUser` claim:\n" +
                "    match /{document=**} { allow read, write: if request.auth.token.fireCMSUser; }\n" +
                "\n" +
                "Without it the CMS shows \"Missing Firestore Security Rules\" and no collection opens, although this server keeps working: it reads through the backend's service account, which bypasses security rules.\n" +
                "\n" +
                "The rule is injected into the existing ruleset rather than replacing it, and a project that already has it is left alone, so it is safe to run again. Connecting a project applies it already; this repairs projects connected earlier, or where that step failed.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
            },
            annotations: { title: "Apply FireCMS security rules", readOnlyHint: false, destructiveHint: true },
        },
        async ({ projectId }) => {
            try {
                // Run with the project's service account when the session has no
                // Google token, so the backend's membership check is not enough.
                await api.assertAdmin(projectId);
                await api.applySecurityRules(projectId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `FireCMS's access rule is in place for "${projectId}", on every Firestore ` +
                            `database in the project and on Storage. Any rules that were already there ` +
                            `were kept. Reload the CMS and the collections will open.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{
                        type: "text" as const,
                        text: `Error applying security rules: ${formatError(error)}\n\n` +
                            `You can add the rule by hand instead, at ` +
                            `https://console.firebase.google.com/project/${projectId}/firestore/rules`,
                    }],
                    isError: true,
                };
            }
        }
    );

    server.registerTool(
        "create_firecms_webapp",
        {
            title: "Create FireCMS web app",
            description:
                "Create the FireCMS web app inside the client's Firebase project, or reuse the one already there. Connecting a project normally does this; this repairs a project where that step failed. Requires admin.",
            inputSchema: {
                projectId: z.string().describe("The Firebase project ID"),
            },
            annotations: { title: "Create FireCMS web app", readOnlyHint: false, destructiveHint: false },
        },
        async ({ projectId }) => {
            try {
                await api.assertAdmin(projectId);
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
