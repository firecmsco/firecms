import { useCallback, useEffect, useState } from "react";
import { useApiConfig } from "./ApiConfigContext";

export interface HistoryEntryData {
    id: string;
    table_name: string;
    entity_id: string;
    action: "create" | "update" | "delete";
    changed_fields: string[] | null;
    values: Record<string, unknown> | null;
    previous_values: Record<string, unknown> | null;
    updated_by: string | null;
    updated_at: string;
}

export interface UseEntityHistoryResult {
    entries: HistoryEntryData[];
    total: number;
    isLoading: boolean;
    hasMore: boolean;
    error?: Error;
    loadMore: () => void;
    revert: (historyId: string) => Promise<void>;
}

/**
 * Hook to fetch entity history from the backend REST API.
 * Replaces the old subcollection-based approach with a proper API call.
 */
export function useEntityHistory(params: {
    slug: string;
    entityId: string | number | undefined;
    enabled?: boolean;
    pageSize?: number;
}): UseEntityHistoryResult {
    const { slug, entityId, enabled = true, pageSize = 10 } = params;
    const apiConfig = useApiConfig();

    const [entries, setEntries] = useState<HistoryEntryData[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const [offset, setOffset] = useState(0);

    const fetchEntries = useCallback(async (currentOffset: number) => {
        if (!apiConfig?.apiUrl || !entityId || !enabled) return;

        setIsLoading(true);
        setError(undefined);

        try {
            const token = await apiConfig.getAuthToken?.();
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const url = `${apiConfig.apiUrl}/api/data/${slug}/${entityId}/history?limit=${pageSize}&offset=${currentOffset}`;
            const response = await fetch(url, { headers });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                throw new Error(errorData.error?.message || `Failed to fetch history (${response.status})`);
            }

            const result = await response.json();

            if (currentOffset === 0) {
                setEntries(result.data);
            } else {
                setEntries(prev => [...prev, ...result.data]);
            }

            setTotal(result.meta.total);
            setHasMore(result.meta.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [apiConfig, slug, entityId, enabled, pageSize]);

    // Fetch on mount and when offset changes
    useEffect(() => {
        if (enabled && entityId) {
            fetchEntries(offset);
        }
    }, [fetchEntries, offset, enabled, entityId]);

    // Reset when entity changes
    useEffect(() => {
        setEntries([]);
        setTotal(0);
        setOffset(0);
        setHasMore(true);
    }, [slug, entityId]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            setOffset(prev => prev + pageSize);
        }
    }, [isLoading, hasMore, pageSize]);

    const revert = useCallback(async (historyId: string) => {
        if (!apiConfig?.apiUrl || !entityId) {
            throw new Error("Cannot revert: missing API configuration or entity ID");
        }

        const token = await apiConfig.getAuthToken?.();
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const url = `${apiConfig.apiUrl}/api/data/${slug}/${entityId}/history/${historyId}/revert`;
        const response = await fetch(url, { method: "POST", headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(errorData.error?.message || `Failed to revert (${response.status})`);
        }

        // Refresh the history list after revert
        setOffset(0);
        setEntries([]);
        await fetchEntries(0);
    }, [apiConfig, slug, entityId, fetchEntries]);

    return {
        entries,
        total,
        isLoading,
        hasMore,
        error,
        loadMore,
        revert
    };
}
