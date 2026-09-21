/**
 * What a failed collection setup needs from the user.
 *
 * - `service-account`: the stored account is missing or was rejected. The
 *   backend says which (`data.reason`), and `CloudErrorView` knows the remedy
 *   for each, including recreating the account where that helps.
 * - `not-ready`: setup was asked for before the project finished being
 *   created. Waiting a few seconds is the whole fix.
 * - `other`: anything else; the message is all we have.
 *
 * Kept free of React and Firebase so it can be tested on its own.
 */
export type CollectionSetupErrorKind = "service-account" | "not-ready" | "other";

const SERVICE_ACCOUNT_CODES = ["service-account-missing", "service-account-corrupt"];

export function collectionSetupErrorKind(error: unknown): CollectionSetupErrorKind {
    const code = (error as { code?: unknown } | undefined)?.code;
    if (typeof code !== "string") return "other";
    if (SERVICE_ACCOUNT_CODES.includes(code)) return "service-account";
    if (code === "project-not-ready") return "not-ready";
    return "other";
}

/**
 * The line shown after "Error setting up collections", or undefined when the
 * error carries nothing the user could act on.
 */
export function collectionSetupErrorDetail(error: unknown): string | undefined {
    const message = (error as { message?: unknown } | undefined)?.message;
    if (typeof message !== "string") return undefined;
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
