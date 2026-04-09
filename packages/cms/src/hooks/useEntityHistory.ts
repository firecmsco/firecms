import { useCallback, useEffect, useRef, useState } from "react";
import { useApiConfig } from "@rebasepro/core";

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

    // Track the current entity identity so we can detect stale responses
    const currentEntityRef = useRef<string | undefined>(undefined);

    const fetchEntries = useCallback(async (
        currentOffset: number,
        signal?: AbortSignal
    ) => {
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
            const response = await fetch(url, { headers, signal });

            // Check if the request was aborted or the entity changed while in-flight
            if (signal?.aborted) return;
            const entityKey = `${slug}/${entityId}`;
            if (currentEntityRef.current !== entityKey) return;

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
            // Don't set error state for intentional aborts
            if (err instanceof DOMException && err.name === "AbortError") return;
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [apiConfig, slug, entityId, enabled, pageSize]);

    // Single unified effect: reset state when entity changes, fetch when offset changes.
    // Uses AbortController to cancel stale requests on entity change or unmount.
    useEffect(() => {
        const entityKey = `${slug}/${entityId}`;
        const isNewEntity = currentEntityRef.current !== entityKey;

        if (isNewEntity) {
            // Reset state for new entity
            currentEntityRef.current = entityKey;
            setEntries([]);
            setTotal(0);
            setHasMore(true);
            setOffset(0);
        }

        if (!enabled || !entityId) return;

        const abortController = new AbortController();
        // When entity changed, always fetch from offset 0
        const effectiveOffset = isNewEntity ? 0 : offset;
        fetchEntries(effectiveOffset, abortController.signal);

        return () => {
            abortController.abort();
        };
    }, [fetchEntries, offset, enabled, entityId, slug]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore && offset + entries.length < total) {
            setOffset(prev => prev + pageSize);
        }
    }, [isLoading, hasMore, pageSize, offset, entries.length, total]);

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

        // Refresh the history list after revert by resetting to page 0.
        // Setting offset to 0 will re-trigger the fetch effect.
        setEntries([]);
        setTotal(0);
        setHasMore(true);
        // Force a re-fetch by invalidating the entity ref so the effect treats it as "new"
        currentEntityRef.current = undefined;
        setOffset(0);
    }, [apiConfig, slug, entityId]);

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
