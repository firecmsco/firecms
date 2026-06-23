import { ApiError } from "../types/errors";


export async function handleApiResponse<T>(res: Response, projectId: string): Promise<T> {
    let jsonResponse: any;
    try {
        jsonResponse = await res.json();
    } catch (_) {
        if (!res.ok) {
            throw new ApiError(
                `Server error (HTTP ${res.status})`,
                String(res.status),
                projectId
            );
        }
        throw new ApiError("Unexpected response from server", "parse-error", projectId);
    }
    if (res.ok) {
        return jsonResponse.data as T;
    } else {
        const message = jsonResponse?.message ?? jsonResponse?.error ?? `Server error (HTTP ${res.status})`;
        const code = jsonResponse?.code ?? String(res.status);
        if (res.status === 409) // already exists
            throw new ApiError(message, jsonResponse?.code ?? "already-exists", projectId);
        throw new ApiError(message, code, projectId, jsonResponse?.data);
    }
}
