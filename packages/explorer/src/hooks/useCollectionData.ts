import { useState, useEffect, useCallback, useMemo } from "react";
import { useDataSource } from "@firecms/core";
import { DataFetcher, createDataFetcher } from "../services/dataFetcher";
import { DocumentData } from "../types";

interface UseCollectionDataProps {
    collectionPath: string | null;
    limit?: number;
}

/**
 * Hook to fetch and manage collection documents
 */
export function useCollectionData({ collectionPath, limit }: UseCollectionDataProps) {
    const dataSource = useDataSource();
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastDocument, setLastDocument] = useState<any>(null);


    // Create data fetcher service
    const dataFetcher = useMemo(
        () => createDataFetcher(dataSource, limit),
        [dataSource, limit]
    );

    // Fetch initial documents
    useEffect(() => {
        if (!collectionPath) {
            setDocuments([]);
            setLoading(false);
            setError(null);
            setHasMore(false);
            return;
        }

        let mounted = true;

        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const docs = await dataFetcher.fetchCollection(collectionPath, limit);
                
                if (mounted) {
                    setDocuments(docs);
                    setHasMore(docs.length >= (limit || 20));
                    // Store the entire last document for pagination cursor
                    setLastDocument(docs.length > 0 ? docs[docs.length - 1] : null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
                    setDocuments([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchDocuments();

        return () => {
            mounted = false;
        };
    }, [collectionPath, limit, dataFetcher]);

    // Fetch more documents (pagination)
    const fetchMore = useCallback(async () => {
        if (!collectionPath || !hasMore) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // For now, fetch a larger batch instead of using cursor pagination
            // This avoids the startAfter/orderBy mismatch issue
            const newLimit = documents.length + (limit || 20);
            const allDocs = await dataFetcher.fetchCollection(collectionPath, newLimit);
            
            setDocuments(allDocs);
            setHasMore(allDocs.length >= newLimit);
            setLastDocument(allDocs.length > 0 ? allDocs[allDocs.length - 1] : null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch more documents'));
        } finally {
            setLoading(false);
        }
    }, [collectionPath, hasMore, limit, dataFetcher, documents.length]);

    // Refresh documents
    const refresh = useCallback(async () => {
        if (!collectionPath) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const docs = await dataFetcher.fetchCollection(collectionPath, limit);
            
            setDocuments(docs);
            setHasMore(docs.length >= (limit || 20));
            // Store the entire last document for pagination cursor
            setLastDocument(docs.length > 0 ? docs[docs.length - 1] : null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to refresh documents'));
        } finally {
            setLoading(false);
        }
    }, [collectionPath, limit, dataFetcher]);

    return {
        documents,
        loading,
        error,
        hasMore,
        fetchMore,
        refresh
    };
}
