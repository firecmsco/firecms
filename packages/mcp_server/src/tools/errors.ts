/**
 * What went wrong with a backend call, in words an agent can act on: the backend's own
 * explanation when it gave one, and axios's "Request failed with status code …" only
 * when it didn't. FireCMS exceptions answer `{ message, code }`; some endpoints answer
 * `{ error }`, as a string or with a message of its own.
 */
export function describeError(error: any): string {
    const data = error?.response?.data;
    const fromBackend = [data?.message, data?.error, data?.error?.message]
        .find((value) => typeof value === "string" && value.length > 0);
    return fromBackend ?? error?.message ?? String(error);
}
