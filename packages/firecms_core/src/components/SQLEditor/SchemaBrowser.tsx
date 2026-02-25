import React, { useState } from "react";
import {
    Typography,
    CircularProgress,
    cls,
    IconButton,
    defaultBorderMixin
} from "@firecms/ui";
import { TableInfo } from "./SQLEditor";

export const SchemaBrowser = ({
    onTableClick,
    schemas,
    isSchemaLoading,
    schemaError,
    onRetrySchema
}: {
    onTableClick?: (tableName: string) => void,
    schemas: Record<string, TableInfo[]>,
    isSchemaLoading: boolean,
    schemaError: string | null,
    onRetrySchema: () => void
}) => {
    const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({ public: true });
    const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

    if (isSchemaLoading) return <div className="p-4 flex justify-center"><CircularProgress size="small" /></div>;
    if (schemaError) return (
        <div className="p-4">
            <div className="text-red-500 text-sm mb-2 font-medium">{schemaError}</div>
            <button
                onClick={onRetrySchema}
                className="text-xs text-primary hover:underline font-medium"
            >
                Try again
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">Database Schema</Typography>
                <IconButton size="small" onClick={onRetrySchema} title="Refresh schema">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </IconButton>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar p-1">
                {Object.keys(schemas).length === 0 ? (
                    <div className="p-4 text-center">
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark italic">No tables found</Typography>
                    </div>
                ) : Object.entries(schemas).map(([schemaName, tables]) => (
                    <div key={schemaName} className="mb-2">
                        <div
                            className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
                            onClick={() => setExpandedSchemas(prev => ({ ...prev, [schemaName]: !prev[schemaName] }))}
                        >
                            <svg className={cls("w-3 h-3 mr-1 transition-transform", expandedSchemas[schemaName] ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-xs truncate flex-grow">{schemaName}</Typography>
                        </div>

                        {expandedSchemas[schemaName] && (
                            <div className="ml-3 mt-1 space-y-1">
                                {tables.map(table => (
                                    <div key={table.tableName}>
                                        <div
                                            className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors group"
                                            onClick={() => setExpandedTables(prev => ({ ...prev, [`${schemaName}.${table.tableName}`]: !prev[`${schemaName}.${table.tableName}`] }))}
                                        >
                                            <svg className={cls("w-3 h-3 mr-1 transition-transform", expandedTables[`${schemaName}.${table.tableName}`] ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                            <svg className="w-3.5 h-3.5 mr-1 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark text-xs truncate flex-grow">{table.tableName}</Typography>
                                            <button
                                                className="hidden group-hover:block ml-1 text-[10px] text-primary hover:underline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTableClick?.(table.tableName);
                                                }}
                                            >
                                                SELECT
                                            </button>
                                        </div>

                                        {expandedTables[`${schemaName}.${table.tableName}`] && (
                                            <div className={cls("ml-6 mt-1 space-y-0.5 border-l", defaultBorderMixin)}>
                                                {table.columns.map(col => (
                                                    <div key={col} className="flex items-center p-1 group pl-2">
                                                        <svg className="w-3 h-3 mr-1 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16" /></svg>
                                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-[11px] truncate">{col}</Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
