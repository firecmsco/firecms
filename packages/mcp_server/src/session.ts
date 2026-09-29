/**
 * Who the server is acting for, and how it proves that to FireCMS Cloud.
 *
 * The server runs in two places, and they differ exactly here:
 *
 * - **Local** (`firecms-mcp` over stdio): one person on their own machine, signed in
 *   with `firecms_login`. Their Google tokens live in `~/.firecms/tokens.json`, and
 *   the Google access token carries the `cloud-platform` scope, so this server can
 *   also provision Google Cloud projects. See `local-session.ts`.
 *
 * - **Hosted** (`https://api.firecms.co/mcp`): many people through one URL, each
 *   signed in with OAuth by their MCP client. The backend resolves the bearer token
 *   of each request to a session. It never holds anyone's Google Cloud credentials,
 *   so `googleAccessToken()` is always undefined there, and connecting a new Google
 *   Cloud project is handed off to the web app.
 *
 * Everything that talks to the backend takes a session rather than reading
 * process-wide state, so on the hosted server one person's token can never be
 * used for another person's request.
 */
export interface FireCMSSession {
    /** The signed-in user's email, or undefined when nobody is signed in. */
    email(): Promise<string | undefined>;

    /**
     * A Firebase ID token on the FireCMS backend project (`firecms-backend`). The
     * backend's `firebaseAuthorization()` accepts nothing else, and the backend
     * Firestore's security rules are evaluated against it.
     *
     * @throws when nobody is signed in
     */
    backendIdToken(): Promise<string>;

    /**
     * A Google OAuth access token with the `cloud-platform` scope, for the endpoints
     * gated by `googleCloudAuthentication()`. Only a local sign-in has one.
     */
    googleAccessToken(): Promise<string | undefined>;
}

/** Where the server runs, which decides the tools it offers. See {@link FireCMSSession}. */
export type FireCMSServerMode = "local" | "hosted";
