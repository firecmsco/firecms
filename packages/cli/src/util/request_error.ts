import { inspect } from "util";

/**
 * `firecms login` or `firecms logout` for `env`. Logins are saved per environment, so after
 * a dev login expires a bare `firecms login` signs in to prod and leaves dev broken.
 */
export function authCommand(command: "login" | "logout", env: "prod" | "dev"): string {
    return `firecms ${command}${env === "dev" ? " --env=dev" : ""}`;
}

/**
 * One line describing a failed request: the status and body when the server answered,
 * otherwise the error message. Axios only sets `response` when there was an answer, so a
 * network failure, a timeout or an error thrown by our own code arrives without one.
 */
export function describeRequestError(err: unknown): string {
    const e = err as any;
    const response = e?.response;
    if (response) {
        const status = [response.status, response.statusText].filter(Boolean).join(" ");
        const data = response.data;
        const body = typeof data === "string"
            ? data.trim()
            : data === undefined ? "" : inspect(data, { depth: 4, breakLength: Infinity });
        return body ? `HTTP ${status}: ${body}` : `HTTP ${status}`;
    }
    if (typeof e?.message === "string") {
        // Node reports some connection failures as an AggregateError with an empty message.
        return e.message || e.code || e.name || "Unknown error";
    }
    return String(err);
}

/**
 * Whether the FireCMS API rejected the saved login. It answers 401 when the Google access
 * token is missing, malformed, expired or revoked.
 */
export function isLoginRejected(err: unknown): boolean {
    return (err as any)?.response?.status === 401;
}
