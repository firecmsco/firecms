import React, { useState, useMemo } from "react";
import { 
    Container, 
    Typography, 
    Button, 
    Paper, 
    IconButton,
    Badge,
    CircularProgress
} from "@firecms/ui";
import { ViewToggle } from "./ViewToggle";
import { FireCMSTable } from "./FireCMSTable";
import { JsonView } from "./JsonView";
import { DocumentEditor } from "./DocumentEditor";
import { CollectionBreadcrumbs } from "./CollectionBreadcrumbs";
import { useCollectionData } from "../hooks/useCollectionData";
import { useFieldAnalysis } from "../hooks/useFieldAnalysis";
import { useDocumentMutation } from "../hooks/useDocumentMutation";
import { useDataSource } from "@firecms/core";
import { ViewMode, FilterState } from "../types";
import { filterDocuments } from "../utils/filterDocuments";

interface CollectionDataViewProps {
    collectionPath: string;
    navigationPath: string[];
    onBack: () => void;
    onNavigateBack: (targetIndex?: number) => void;
    onNavigateToSubcollection: (subcollectionPath: string) => void;
}

/**
 * Full-screen view for browsing and editing collection documents
 */
export const CollectionDataView: React.FC<CollectionDataViewProps> = ({
    collectionPath,
    navigationPath,
    onBack,
    onNavigateBack,
    onNavigateToSubcollection
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        columnFilters: {}
    });
    const [editorMode, setEditorMode] = useState<'create' | 'delete' | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
    const [documentIdFilter, setDocumentIdFilter] = useState<string>('');

    // Data source for fetching individual documents
    const dataSource = useDataSource();

    // Fetch collection data
    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        hasMore,
        fetchMore,
        refresh
    } = useCollectionData({ collectionPath, limit: 30 });

    // Analyze fields
    const schema = useFieldAnalysis(documents);

    // Document mutations
    const {
        updateField,
        updateDocument,
        createDocument,
        deleteDocument,
        loading: mutationLoading,
        error: mutationError
    } = useDocumentMutation();

    // Check if there are active filters
    const hasActiveFilters = useMemo(() => {
        return documentIdFilter.trim() !== '' || 
               filters.searchTerm.trim() !== '' || 
               Object.keys(filters.columnFilters).length > 0;
    }, [documentIdFilter, filters]);

    // Filter documents
    const filteredDocuments = useMemo(() => {
        let filtered = filterDocuments(documents, filters);
        
        // Apply document ID filter if set
        if (documentIdFilter.trim()) {
            filtered = filtered.filter(doc => 
                doc.id.toLowerCase().includes(documentIdFilter.toLowerCase())
            );
        }
        
        return filtered;
    }, [documents, filters, documentIdFilter]);

    const handleCellEdit = async (docId: string, field: string, value: any) => {
        const docPath = `${collectionPath}/${docId}`;
        await updateField(docPath, field, value);
        await refresh();
    };

    const handleDocumentEdit = async (docId: string, newData: any) => {
        const docPath = `${collectionPath}/${docId}`;
        await updateDocument(docPath, newData);
        await refresh();
    };

    const handleCreateDocument = async (data: Record<string, any>, id?: string) => {
        await createDocument(collectionPath, data, id);
        await refresh();
        setEditorMode(null);
    };

    const handleDeleteDocument = async () => {
        if (!documentToDelete) return;
        const docPath = `${collectionPath}/${documentToDelete}`;
        await deleteDocument(docPath);
        await refresh();
        setEditorMode(null);
        setDocumentToDelete(null);
    };

    const openDeleteDialog = (docId: string) => {
        setDocumentToDelete(docId);
        setEditorMode('delete');
    };

    const handleClearFilters = () => {
        setDocumentIdFilter('');
        setFilters({
            searchTerm: '',
            columnFilters: {}
        });
    };



    return (
        <div className="flex flex-col h-screen bg-surface-50 dark:bg-surface-900">
            {/* Header - Following FireCMS CollectionTableToolbar pattern */}
            <div className="no-scrollbar min-h-[56px] overflow-x-auto px-2 md:px-4 bg-surface-50 dark:bg-surface-900 border-b flex flex-row justify-between items-center w-full">
                
                {/* Left side - Title and actions */}
                <div className="flex items-center gap-3 md:mr-6 mr-3">
                    
                    {/* Breadcrumb navigation */}
                    <div className="flex items-center gap-4">
                        <CollectionBreadcrumbs
                            navigationPath={navigationPath}
                            onNavigateBack={onNavigateBack}
                            onBackToSelection={onBack}
                        />
                        
                        {/* Document count badges */}
                        <div className="flex items-center gap-2">
                            <Badge color="primary">
                                {documents.length}
                            </Badge>
                            {filteredDocuments.length !== documents.length && (
                                <Badge color="secondary">
                                    {filteredDocuments.length} filtered
                                </Badge>
                            )}
                        </div>
                    </div>
                    
                    {/* View toggle */}
                    <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                    
                </div>

                {/* Right side - Search and actions */}
                <div className="flex items-center gap-3">
                    
                    {/* Loading indicator */}
                    <div className="w-[22px] mr-4">
                        {documentsLoading && (
                            <CircularProgress size="smallest" />
                        )}
                    </div>

                    {/* Clear filters button */}
                    {hasActiveFilters && (
                        <Button
                            variant="outlined"
                            color="neutral"
                            size="small"
                            onClick={handleClearFilters}
                            className="text-xs"
                        >
                            ✕ Clear Filters
                        </Button>
                    )}

                    {/* Create document button */}
                    <Button
                        variant="filled"
                        color="primary"
                        size="medium"
                        onClick={() => setEditorMode('create')}
                    >
                        Create Document
                    </Button>
                    
                </div>
            </div>

            {/* Error Display */}
            {(documentsError || mutationError) && (
                <div className="px-2 md:px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <Typography variant="body2" className="text-red-700 dark:text-red-400">
                        ⚠️ {documentsError?.message || mutationError?.message}
                    </Typography>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'table' ? (
                    <FireCMSTable
                        documents={filteredDocuments}
                        schema={schema}
                        onCellEdit={handleCellEdit}
                        onDocumentFilter={setDocumentIdFilter}
                        loading={documentsLoading}
                        hasMore={hasMore}
                        onLoadMore={fetchMore}
                    />
                ) : (
                    <JsonView
                        documents={filteredDocuments}
                        onDocumentEdit={handleDocumentEdit}
                        loading={documentsLoading}
                    />
                )}


            </div>

            {/* Document Editor Modal */}
            <DocumentEditor
                open={editorMode !== null}
                mode={editorMode || 'create'}
                documentId={documentToDelete || undefined}
                onClose={() => {
                    setEditorMode(null);
                    setDocumentToDelete(null);
                }}
                onCreate={editorMode === 'create' ? handleCreateDocument : undefined}
                onDelete={editorMode === 'delete' ? handleDeleteDocument : undefined}
            />
        </div>
    );
};