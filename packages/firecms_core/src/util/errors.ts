export function asError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}