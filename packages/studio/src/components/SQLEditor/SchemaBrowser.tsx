import React, { useState } from "react";
import {
    Typography,
    CircularProgress,
    cls,
    IconButton,
    defaultBorderMixin,
    Menu,
    MenuItem
} from "@rebasepro/ui";
import { TableInfo } from "./SQLEditor";
import { ErrorView } from "@rebasepro/core";

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
        <div className="p-2">
            <ErrorView error={schemaError} onRetry={onRetrySchema} />
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
                                            className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors group relative"
                                            onClick={() => setExpandedTables(prev => ({ ...prev, [`${schemaName}.${table.tableName}`]: !prev[`${schemaName}.${table.tableName}`] }))}
                                        >
                                            <svg className={cls("w-3 h-3 mr-1 transition-transform shrink-0", expandedTables[`${schemaName}.${table.tableName}`] ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                            <svg className="w-3.5 h-3.5 mr-1 shrink-0 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark text-xs truncate flex-1 min-w-0">{table.tableName}</Typography>

                                            <div className="flex opacity-0 group-hover:opacity-100 focus-within:opacity-100 absolute right-1 items-center bg-surface-100 dark:bg-surface-800 px-1 gap-1 rounded transition-opacity">
                                                <button
                                                    className="p-1 transition-colors rounded hover:bg-surface-200 dark:hover:bg-surface-700 pointer-events-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(table.tableName);
                                                    }}
                                                    title="Copy table name"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                </button>

                                                <Menu
                                                    trigger={
                                                        <button
                                                            className="p-1 transition-colors rounded hover:bg-surface-200 dark:hover:bg-surface-700 pointer-events-auto"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Generate SQL templates"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                                        </button>
                                                    }
                                                >
                                                    <MenuItem dense className="text-xs" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onTableClick?.(`SELECT * FROM ${schemaName !== 'public' ? `${schemaName}.` : ''}${table.tableName} LIMIT 100;`);
                                                    }}>SELECT (Top 100)</MenuItem>
                                                    <MenuItem dense className="text-xs" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onTableClick?.(`SELECT \n  ${table.columns.map(c => c.name).join(",\n  ")}\nFROM ${schemaName !== 'public' ? `${schemaName}.` : ''}${table.tableName};`);
                                                    }}>SELECT (All columns)</MenuItem>
                                                    <MenuItem dense className="text-xs" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onTableClick?.(`INSERT INTO ${schemaName !== 'public' ? `${schemaName}.` : ''}${table.tableName} (\n  ${table.columns.map(c => c.name).join(",\n  ")}\n) VALUES (\n  ${table.columns.map(() => '?').join(",\n  ")}\n);`);
                                                    }}>INSERT statement</MenuItem>
                                                    <MenuItem dense className="text-xs" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onTableClick?.(`UPDATE ${schemaName !== 'public' ? `${schemaName}.` : ''}${table.tableName} \nSET \n  ${table.columns.map(c => `${c.name} = ?`).join(",\n  ")}\nWHERE id = ?;`);
                                                    }}>UPDATE statement</MenuItem>
                                                </Menu>

                                                <button
                                                    className="text-[10px] text-primary hover:underline px-1 font-medium"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTableClick?.(`SELECT * FROM ${schemaName !== 'public' ? `${schemaName}.` : ''}${table.tableName} LIMIT 100;`);
                                                    }}
                                                >
                                                    SELECT
                                                </button>
                                            </div>
                                        </div>

                                        {expandedTables[`${schemaName}.${table.tableName}`] && (
                                            <div className={cls("ml-5 mt-1 space-y-0.5 border-l", defaultBorderMixin)}>
                                                {table.columns.map(col => (
                                                    <div key={col.name} className="flex items-center p-1 group pl-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-r relative min-h-[28px]">
                                                        <svg className="w-3 h-3 mr-1.5 text-text-disabled dark:text-text-disabled-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4.5v15m6-15v15m-10.5-1.5h15c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125h-15c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125Z" /></svg>
                                                        <Typography variant="caption" className="text-text-primary dark:text-text-primary-dark text-[11px] truncate flex-grow mr-2">{col.name}</Typography>
                                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-[9px] truncate mr-1 uppercase shrink-0" title={col.dataType}>{col.dataType}</Typography>
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 absolute right-1 bg-surface-50 dark:bg-surface-800 p-1 transition-colors rounded hover:bg-surface-200 dark:hover:bg-surface-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(col.name);
                                                                // Could add a toast here if passed down, but simple clipboard write is fine for now
                                                            }}
                                                            title="Copy column name"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        </button>
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
