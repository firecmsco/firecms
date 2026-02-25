import React, { useEffect, useState } from "react";
import {
    Typography,
    CircularProgress,
    cls,
    IconButton
} from "@firecms/ui";
import { useDataSource } from "../../hooks";

interface TableInfo {
    schemaName: string;
    tableName: string;
    columns: string[];
}

export const SchemaBrowser = ({ onTableClick }: { onTableClick?: (tableName: string) => void }) => {
    const dataSource = useDataSource();
    const [loading, setLoading] = useState(true);
    const [schemas, setSchemas] = useState<Record<string, TableInfo[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({ public: true });
    const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchSchema();
    }, []);

    const fetchSchema = async () => {
        if (!dataSource.executeSql) {
            setError("SQL execution not supported by this data source");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("Fetching database schema...");
            const sql = `
                SELECT 
                    table_schema as schema, 
                    table_name as "table", 
                    column_name as "column"
                FROM 
                    information_schema.columns
                WHERE 
                    table_schema NOT IN ('information_schema', 'pg_catalog')
                ORDER BY 
                    schema, "table", ordinal_position;
            `;
            const result = await dataSource.executeSql(sql);
            console.debug("Schema fetch result:", result);

            const processGrouped = (data: any[]) => {
                const grouped = data.reduce((acc: Record<string, TableInfo[]>, curr: any) => {
                    const schema = curr.schema || curr.SCHEMA || curr.table_schema || "public";
                    const table = curr.table || curr.TABLE || curr.table_name;
                    const column = curr.column || curr.COLUMN || curr.column_name;

                    if (!acc[schema]) acc[schema] = [];
                    let tableInfo = acc[schema].find(t => t.tableName === table);
                    if (!tableInfo) {
                        tableInfo = { schemaName: schema, tableName: table, columns: [] };
                        acc[schema].push(tableInfo);
                    }
                    tableInfo.columns.push(column);
                    return acc;
                }, {});
                setSchemas(grouped);
            };

            if (!result || !Array.isArray(result)) {
                console.error("Expected array from executeSql, got:", typeof result, result);
                if (result && typeof result === "object" && "rows" in result && Array.isArray((result as any).rows)) {
                    processGrouped((result as any).rows);
                } else {
                    setError(`Unexpected data format: ${typeof result}`);
                }
            } else if (result.length === 0) {
                setError("No tables found in the database.");
            } else {
                processGrouped(result);
            }

        } catch (e: any) {
            console.error(e);
            setError("Failed to fetch schema: " + (e.message || String(e)));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><CircularProgress size="small" /></div>;
    if (error) return (
        <div className="p-4">
            <div className="text-red-500 text-sm mb-2 font-medium">{error}</div>
            <button
                onClick={fetchSchema}
                className="text-xs text-primary hover:underline font-medium"
            >
                Try again
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-900">
                <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">Database Schema</Typography>
                <IconButton size="small" onClick={fetchSchema} title="Refresh schema">
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
                                            <div className="ml-6 mt-1 space-y-0.5 border-l border-surface-200 dark:border-surface-800">
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
