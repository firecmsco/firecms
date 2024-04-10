import { ApiError } from "../types/errors";

export async function handleApiResponse<T>(res: Response, projectId: string): Promise<T> {
    const jsonResponse = await res.json();
    if (res.ok) {
        return jsonResponse.data as T;
    } else {
        if (res.status === 409) // already exists
            throw new ApiError(jsonResponse.message ?? jsonResponse.error ?? "This already exists.", jsonResponse.code ?? "already-exists", projectId);
        throw new ApiError(jsonResponse.message ?? jsonResponse.error, jsonResponse.code, projectId, jsonResponse.data);
    }
}
