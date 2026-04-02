export interface RebaseClientConfig {
    baseUrl: string;
    token?: string;
    apiPath?: string;
    fetch?: typeof globalThis.fetch;
    onUnauthorized?: () => Promise<boolean>;
    websocketUrl?: string; // Optional real-time WebSocket connection
}

export interface FindParams {
    limit?: number;
    offset?: number;
    page?: number;
    where?: Record<string, string>;
    orderBy?: string;
    include?: string[];
    searchString?: string;
}

export interface FindResponse<T> {
    data: T[];
    meta: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export class RebaseApiError extends Error {
    status: number;
    code?: string;
    details?: any;

    constructor(status: number, message: string, code?: string, details?: any) {
        super(message);
        this.name = "RebaseApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export function buildQueryString(params?: FindParams): string {
    if (!params) return "";
    const parts: string[] = [];

    if (params.limit != null) parts.push(`limit=${params.limit}`);
    if (params.offset != null) parts.push(`offset=${params.offset}`);
    if (params.page != null) parts.push(`page=${params.page}`);

    if (params.orderBy) {
        parts.push(`orderBy=${encodeURIComponent(params.orderBy)}`);
    }

    if (params.include && params.include.length > 0) {
        parts.push(`include=${encodeURIComponent(params.include.join(","))}`);
    }

    if (params.where) {
        for (const [field, value] of Object.entries(params.where)) {
            parts.push(`${encodeURIComponent(field)}=${encodeURIComponent(String(value))}`);
        }
    }

    return parts.length > 0 ? "?" + parts.join("&") : "";
}

export interface Transport {
    request: <T = any>(path: string, init?: RequestInit) => Promise<T>;
    setToken: (newToken: string | null) => void;
    readonly baseUrl: string;
    readonly apiPath: string;
    readonly fetchFn: typeof globalThis.fetch;
}

export function createTransport(config: RebaseClientConfig): Transport {
    const fetchFn = config.fetch || globalThis.fetch;
    const apiPath = config.apiPath || "/api";
    let token = config.token;

    async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
        const url = config.baseUrl.replace(/\/$/, "") + apiPath + path;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...((init?.headers as Record<string, string>) || {}),
        };

        const res = await fetchFn(url, { ...init, headers });

        if (res.status === 204) return undefined as unknown as T;

        const body = await res.json().catch(() => ({}));

        if (res.status === 401 && config.onUnauthorized) {
            const retried = await config.onUnauthorized();
            if (retried) {
                const retryHeaders: Record<string, string> = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...((init?.headers as Record<string, string>) || {}),
                };
                const retryRes = await fetchFn(url, { ...init, headers: retryHeaders });
                if (retryRes.status === 204) return undefined as unknown as T;
                const retryBody = await retryRes.json().catch(() => ({}));
                if (!retryRes.ok) {
                    throw new RebaseApiError(
                        retryRes.status,
                        retryBody?.error?.message || retryBody?.message || retryRes.statusText,
                        retryBody?.error?.code || retryBody?.code,
                        retryBody?.error?.details || retryBody?.details,
                    );
                }
                return retryBody as T;
            }
        }

        if (!res.ok) {
            throw new RebaseApiError(
                res.status,
                body?.error?.message || body?.message || res.statusText,
                body?.error?.code || body?.code,
                body?.error?.details || body?.details,
            );
        }

        return body as T;
    }

    return {
        request,
        setToken(newToken: string | null) { token = newToken || undefined; },
        get baseUrl() { return config.baseUrl.replace(/\/$/, ""); },
        get apiPath() { return apiPath; },
        get fetchFn() { return fetchFn; },
    };
}
