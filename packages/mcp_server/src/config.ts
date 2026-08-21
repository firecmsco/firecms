/**
 * Which FireCMS backend this server talks to.
 *
 * Defaults to FireCMS Cloud. `FIRECMS_API_URL` points it somewhere else — a staging
 * backend, or a self-hosted one. Everything else follows from this single value: the
 * backend's Firebase project, and therefore which project's Firestore holds the
 * collection configurations, is read from that host's own `/config` endpoint rather
 * than being configured separately, so the two can never disagree.
 */
export const DEFAULT_API_URL = "https://api.firecms.co";

/**
 * Resolve the backend URL, trimming any trailing slash so callers can concatenate
 * paths without producing a double slash.
 */
export function resolveApiUrl(env: NodeJS.ProcessEnv = process.env): string {
    const configured = env.FIRECMS_API_URL?.trim();
    if (!configured) return DEFAULT_API_URL;
    return configured.replace(/\/+$/, "");
}

/** True when pointed at something other than FireCMS Cloud. */
export function isCustomApiUrl(env: NodeJS.ProcessEnv = process.env): boolean {
    return resolveApiUrl(env) !== DEFAULT_API_URL;
}
