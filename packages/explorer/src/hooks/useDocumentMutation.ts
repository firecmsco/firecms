import { useState, useCallback, useMemo } from "react";
import { useDataSource } from "@firecms/core";
import { DocumentMutationService, createDocumentMutationService } from "../services/documentMutation";

/**
 * Hook for document CRUD operations
 */
export function useDocumentMutation() {
    const dataSource = useDataSource();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Create mutation service
    const mutationService = useMemo(
        () => createDocumentMutationService(dataSource),
        [dataSource]
    );

    // Update a single field
    const updateField = useCallback(async (
        docPath: string,
        field: string,
        value: any
    ) => {
        try {
            setLoading(true);
            setError(null);
            await mutationService.updateField(docPath, field, value);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update field');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [mutationService]);

    // Update entire document
    const updateDocument = useCallback(async (
        docPath: string,
        data: Record<string, any>
    ) => {
        try {
            setLoading(true);
            setError(null);
            await mutationService.updateDocument(docPath, data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update document');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [mutationService]);

    // Create new document
    const createDocument = useCallback(async (
        collectionPath: string,
        data: Record<string, any>,
        id?: string
    ): Promise<string> => {
        try {
            setLoading(true);
            setError(null);
            const docId = await mutationService.createDocument(collectionPath, data, id);
            return docId;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create document');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [mutationService]);

    // Delete document
    const deleteDocument = useCallback(async (docPath: string) => {
        try {
            setLoading(true);
            setError(null);
            await mutationService.deleteDocument(docPath);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete document');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [mutationService]);

    return {
        updateField,
        updateDocument,
        createDocument,
        deleteDocument,
        loading,
        error
    };
}
