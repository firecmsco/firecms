import React from "react";
import { 
    Typography, 
    CircularProgress,
    Button,
    cls
} from "@firecms/ui";
import { ColumnHeader } from "./ColumnHeader";
import { EditableCell } from "./EditableCell";
import { DocumentIdHeaderWidget } from "./DocumentIdHeaderWidget";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { DocumentData, InferredSchema } from "../types";

interface FireCMSTableProps {
    documents: DocumentData[];
    schema: InferredSchema;
    onCellEdit: (docId: string, field: string, value: any) => Promise<void>;
    onDocumentFilter?: (documentId: string) => void;
    onExploreSubcollections?: (documentId: string) => void;
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

/**
 * FireCMS-style table view with dark mode support
 */
export const FireCMSTable: React.FC<FireCMSTableProps> = ({
    documents,
    schema,
    onCellEdit,
    onDocumentFilter,
    onExploreSubcollections,
    loading = false,
    hasMore = false,
    onLoadMore
}) => {
    // Infinite scroll hook
    const { containerRef } = useInfiniteScroll({
        hasMore,
        loading,
        onLoadMore: onLoadMore || (() => {}),
        threshold: 200 // Load more when 200px from bottom
    });
    // Only show full-page loader on initial load with no documents
    if (loading && documents.length === 0) {
        return (
            <div className="flex justify-center items-center p-12">
                <CircularProgress size="large" />
            </div>
        );
    }

    if (!loading && documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-4xl mb-4">📄</div>
                <Typography variant="h6" className="text-surface-600 dark:text-surface-400 mb-2">
                    No documents found
                </Typography>
                <Typography variant="body2" className="text-surface-500 dark:text-surface-500">
                    This collection doesn't contain any documents yet.
                </Typography>
            </div>
        );
    }

    if (schema.fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <Typography variant="h6" className="text-surface-600 dark:text-surface-400 mb-2">
                    No fields discovered
                </Typography>
                <Typography variant="body2" className="text-surface-500 dark:text-surface-500">
                    The documents in this collection don't have any readable fields.
                </Typography>
            </div>
        );
    }

    const getFieldValue = (doc: DocumentData, fieldPath: string): any => {
        const keys = fieldPath.split('.');
        let value: any = doc.data;
        
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    };

    const formatArrayValue = (value: any[]): string => {
        if (value.length === 0) return '[]';
        if (value.length <= 3) {
            return `[${value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')}]`;
        }
        return `[${value.length} items]`;
    };

    const renderCellValue = (doc: DocumentData, field: any) => {
        const value = getFieldValue(doc, field.path);
        
        // Handle arrays specially for display
        if (Array.isArray(value)) {
            return (
                <div className="px-3 py-2">
                    <Typography
                        variant="body2"
                        className="text-xs font-mono text-surface-600 dark:text-surface-400"
                    >
                        {formatArrayValue(value)}
                    </Typography>
                </div>
            );
        }

        return (
            <EditableCell
                value={value}
                fieldPath={field.path}
                dataType={field.dataType}
                onSave={async (newValue) => {
                    await onCellEdit(doc.id, field.path, newValue);
                }}
            />
        );
    };



    return (
        <div className="flex flex-col h-full">
            {/* Table container with FireCMS styling */}
            <div ref={containerRef} className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    {/* Header */}
                    <thead className="sticky top-0 z-20 bg-surface-50 dark:bg-surface-900">
                        <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                            {/* Document ID column */}
                            <th className="h-12 min-w-[150px]">
                                <div className={cls(
                                    "flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center bg-surface-50 dark:bg-surface-900",
                                    "text-text-secondary hover:text-text-primary dark:text-text-secondary-dark dark:hover:text-text-primary-dark",
                                    "hover:bg-surface-100 dark:hover:bg-surface-800"
                                )}>
                                    <div className="overflow-hidden flex-grow">
                                        <div className="flex items-center justify-start flex-row">
                                            <div className="truncate -webkit-box w-full mx-1 overflow-hidden">
                                                Document ID
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Search widget */}
                                    {onDocumentFilter && (
                                        <DocumentIdHeaderWidget
                                            onDocumentFilter={onDocumentFilter}
                                        />
                                    )}
                                </div>
                            </th>
                            
                            {/* Field columns */}
                            {schema.fields.map((field) => (
                                <th key={field.path} className="h-12">
                                    <div className={cls(
                                        "flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center bg-surface-50 dark:bg-surface-900",
                                        "text-text-secondary hover:text-text-primary dark:text-text-secondary-dark dark:hover:text-text-primary-dark",
                                        "hover:bg-surface-100 dark:hover:bg-surface-800"
                                    )}>
                                        <div className="overflow-hidden flex-grow">
                                            <div className="flex items-center justify-start flex-row">
                                                <div className="truncate -webkit-box w-full mx-1 overflow-hidden">
                                                    {field.path}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                            ))}
                            
                            {/* Actions column */}
                            {onExploreSubcollections && (
                                <th className="h-12 min-w-[100px]">
                                    <div className={cls(
                                        "flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center bg-surface-50 dark:bg-surface-900",
                                        "text-text-secondary hover:text-text-primary dark:text-text-secondary-dark dark:hover:text-text-primary-dark",
                                        "hover:bg-surface-100 dark:hover:bg-surface-800"
                                    )}>
                                        <div className="overflow-hidden flex-grow">
                                            <div className="flex items-center justify-start flex-row">
                                                <div className="truncate -webkit-box w-full mx-1 overflow-hidden">
                                                    Actions
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    
                    {/* Body */}
                    <tbody>
                        {documents.map((doc, index) => (
                                <tr
                                    key={doc.id}
                                    className={cls(
                                        "border-b border-surface-200 dark:border-surface-700 transition-colors",
                                        "hover:bg-surface-50 dark:hover:bg-surface-800/50",
                                        index % 2 === 0 
                                            ? "bg-white dark:bg-surface-900" 
                                            : "bg-surface-25 dark:bg-surface-900/50"
                                    )}
                                >
                        
                                {/* Document ID */}
                                <td className="px-3 py-2">
                                    <Typography 
                                        variant="body2" 
                                        className="font-mono text-xs text-surface-600 dark:text-surface-400 max-w-[200px] truncate"
                                        title={doc.id}
                                    >
                                        {doc.id}
                                    </Typography>
                                </td>
                                
                                {/* Field values */}
                                {schema.fields.map((field) => (
                                    <td key={field.path} className="border-r border-surface-100 dark:border-surface-800 last:border-r-0">
                                        {renderCellValue(doc, field)}
                                    </td>
                                ))}
                                
                                {/* Actions cell */}
                                {onExploreSubcollections && (
                                    <td className="px-3 py-2">
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => onExploreSubcollections(doc.id)}
                                            className="text-xs text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200"
                                        >
                                            📁 Explore
                                        </Button>
                                    </td>
                                )}

                                </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Loading more indicator */}
                {loading && documents.length > 0 && (
                    <div className="flex justify-center items-center py-4 border-t border-surface-200 dark:border-surface-700">
                        <CircularProgress size="small" />
                        <Typography variant="caption" className="ml-2 text-surface-600 dark:text-surface-400">
                            Loading more documents...
                        </Typography>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
                <div className="flex justify-between items-center">
                    <Typography variant="caption" className="text-surface-600 dark:text-surface-400">
                        Showing {documents.length} document{documents.length !== 1 ? 's' : ''} with {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
                    </Typography>
                    
                    {/* Loading indicator for pagination */}
                    {loading && documents.length > 0 && (
                        <div className="flex items-center gap-2">
                            <CircularProgress size="smallest" />
                            <Typography variant="caption" className="text-surface-500 dark:text-surface-500">
                                Loading more...
                            </Typography>
                        </div>
                    )}
                    
                    {/* Show scroll hint when not loading and has more */}
                    {!loading && hasMore && (
                        <Typography variant="caption" className="text-surface-500 dark:text-surface-500">
                            Scroll down to load more
                        </Typography>
                    )}
                </div>
            </div>


        </div>
    );
};