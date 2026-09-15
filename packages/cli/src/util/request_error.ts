import { inspect } from "util";
import path from "path";

/**
 * `firecms login` or `firecms logout` for `env`. Logins are saved per environment, so after
 * a dev login expires a bare `firecms login` signs in to prod and leaves dev broken.
 *
 * Under `create-firecms-app` there is no `firecms` on the PATH, so it names the command
 * that does exist.
 */
export function authCommand(command: "login" | "logout", env: "prod" | "dev"): string {
    const invokedAs = path.basename(process.argv[1] ?? "").replace(/\.[cm]?js$/, "");
    const cli = invokedAs.startsWith("create-firecms-app") ? "npx @firecms/cli" : "firecms";
    return `${cli} ${command}${env === "dev" ? " --env=dev" : ""}`;
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
