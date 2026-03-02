import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Paper,
    Typography,
    CircularProgress,
    cls,
    Alert,
    defaultBorderMixin,
    Card,
    Chip,
    Button,
    Tooltip,
    ResizablePanels
} from "@firecms/ui";
import { useDataSource, useSnackbarController, useCollectionRegistryController } from "../../hooks";

export interface PostgresPolicy {
    policyname: string;
    tablename: string;
    permissive: "PERMISSIVE" | "RESTRICTIVE";
    roles: string[];
    cmd: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
    qual: string | null; // USING clause
    with_check: string | null; // WITH CHECK clause
}

export interface TableRLSStatus {
    schemaName: string;
    tableName: string;
    rlsEnabled: boolean;
    policies: PostgresPolicy[];
}

export const RLSEditor = () => {
    const dataSource = useDataSource();
    const snackbarController = useSnackbarController();
    const collectionRegistry = useCollectionRegistryController();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tables, setTables] = useState<TableRLSStatus[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [sidebarSize, setSidebarSize] = useState(20);

    const fetchRLSData = useCallback(async () => {
        if (!dataSource.executeSql) {
            setError("SQL execution not supported by this data source");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch tables and whether RLS is enabled
            const tablesSql = `
                SELECT 
                    schemaname, 
                    tablename, 
                    rowsecurity 
                FROM pg_tables 
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
                ORDER BY schemaname, tablename;
            `;
            const tablesResult = await dataSource.executeSql(tablesSql);

            // 2. Fetch all policies
            const policiesSql = `
                SELECT 
                    schemaname,
                    tablename,
                    policyname,
                    permissive,
                    roles,
                    cmd,
                    qual,
                    with_check
                FROM pg_policies
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog');
            `;
            const policiesResult = await dataSource.executeSql(policiesSql);

            const extractRows = (result: any) => {
                if (result && typeof result === "object" && "rows" in result && Array.isArray((result as any).rows)) {
                    return (result as any).rows;
                }
                if (Array.isArray(result)) return result;
                return [];
            };

            const tRows = extractRows(tablesResult);
            const pRows = extractRows(policiesResult);

            const tableMap: Record<string, TableRLSStatus> = {};

            tRows.forEach((t: any) => {
                const schema = t.schemaname || t.SCHEMANAME || "public";
                const table = t.tablename || t.TABLENAME;
                const rlsEnabled = t.rowsecurity || t.ROWSECURITY || false;

                const key = `${schema}.${table}`;
                tableMap[key] = {
                    schemaName: schema,
                    tableName: table,
                    rlsEnabled: rlsEnabled,
                    policies: []
                };
            });

            pRows.forEach((p: any) => {
                const schema = p.schemaname || p.SCHEMANAME || "public";
                const table = p.tablename || p.TABLENAME;
                const key = `${schema}.${table}`;

                if (tableMap[key]) {
                    // Postgres roles come back as an array string like "{public}" or literal array
                    let parsedRoles: string[] = [];
                    const r = p.roles || p.ROLES;
                    if (Array.isArray(r)) {
                        parsedRoles = r;
                    } else if (typeof r === "string") {
                        parsedRoles = r.replace(/^{|}$/g, "").split(",").map(s => s.trim());
                    }

                    tableMap[key].policies.push({
                        policyname: p.policyname || p.POLICYNAME,
                        tablename: table,
                        permissive: p.permissive || p.PERMISSIVE,
                        roles: parsedRoles,
                        cmd: p.cmd || p.CMD,
                        qual: p.qual || p.QUAL,
                        with_check: p.with_check || p.WITH_CHECK
                    });
                }
            });

            const sortedTables = Object.values(tableMap).sort((a, b) => a.tableName.localeCompare(b.tableName));
            setTables(sortedTables);

            if (sortedTables.length > 0 && !selectedTable) {
                setSelectedTable(`${sortedTables[0].schemaName}.${sortedTables[0].tableName}`);
            }

        } catch (e: any) {
            console.error("RLS fetch error:", e);
            setError("Failed to fetch RLS policies: " + (e.message || String(e)));
        } finally {
            setIsLoading(false);
        }
    }, [dataSource, selectedTable]);

    useEffect(() => {
        fetchRLSData();
    }, [fetchRLSData]);

    const activeTableData = useMemo(() => {
        if (!selectedTable) return null;
        return tables.find(t => `${t.schemaName}.${t.tableName}` === selectedTable) || null;
    }, [selectedTable, tables]);

    const activeCollection = useMemo(() => {
        if (!activeTableData) return null;
        return collectionRegistry.collections?.find((c: any) =>
            c.id === activeTableData.tableName ||
            c.path === activeTableData.tableName ||
            c.dbPath === activeTableData.tableName ||
            c.slug === activeTableData.tableName ||
            c.collectionId === activeTableData.tableName
        ) || null;
    }, [activeTableData, collectionRegistry.collections]);

    const renderPolicyTag = (label: string, value: string, color: "primary" | "secondary" | "success" | "warning" | "error" = "primary") => {
        return (
            <div className="flex flex-col border border-surface-200 dark:border-surface-800 rounded bg-surface-50 dark:bg-surface-900 overflow-hidden">
                <div className="bg-surface-200 dark:bg-surface-800 px-2 py-1 text-[10px] uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark hidden sm:block">
                    {label}
                </div>
                <div className="p-2 font-mono text-sm break-all">
                    {value}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <ResizablePanels
                orientation="horizontal"
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={220}
                firstPanel={
                    <div className={cls("flex flex-col h-full w-full bg-surface-50 dark:bg-surface-900 border-r", defaultBorderMixin)}>
                        <div className={cls("p-4 border-b", defaultBorderMixin)}>
                            <Typography variant="subtitle1" className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                RLS Studio
                            </Typography>
                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark mt-1 block">
                                Row Level Security Policies
                            </Typography>
                        </div>

                        <div className="flex-grow overflow-y-auto w-full no-scrollbar px-2 py-4 space-y-1">
                            {isLoading && tables.length === 0 ? (
                                <div className="flex justify-center p-4"><CircularProgress size="small" /></div>
                            ) : (
                                tables.map(table => {
                                    const key = `${table.schemaName}.${table.tableName}`;
                                    const isSelected = selectedTable === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedTable(key)}
                                            className={cls(
                                                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                                isSelected
                                                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-medium"
                                                    : "hover:bg-surface-200 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                                            )}
                                        >
                                            <span className="truncate">{table.tableName}</span>
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                {table.rlsEnabled ? (
                                                    <Tooltip title="RLS Enabled">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="RLS Disabled (Warning)">
                                                        <div className="w-2 h-2 rounded-full bg-orange-400 opacity-50" />
                                                    </Tooltip>
                                                )}
                                                <span className="text-xs opacity-50 group-hover:opacity-100 min-w-[1.2rem] text-right">
                                                    {table.policies.length}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                }
                secondPanel={
                    <div className="flex-grow flex flex-col min-w-0 h-full w-full bg-white dark:bg-surface-950">
                        {/* Toolbar Header matching SQLEditor style */}
                        <div className={cls("h-[44px] shrink-0 flex items-center justify-between px-4 border-b bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="font-mono text-text-secondary dark:text-text-secondary-dark">
                                {activeTableData ? `${activeTableData.schemaName}.${activeTableData.tableName}` : "Select a table"}
                            </Typography>
                            <Button
                                size="small"
                                variant="text"
                                className="text-[10px] uppercase text-text-secondary dark:text-text-secondary-dark"
                                onClick={fetchRLSData}
                                startIcon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                            >
                                Refresh
                            </Button>
                        </div>
                        {error ? (
                            <div className="p-6 h-full flex items-center justify-center">
                                <Alert color="error">{error}</Alert>
                            </div>
                        ) : !activeTableData ? (
                            <div className="flex-grow flex items-center justify-center text-text-disabled h-full">
                                <Typography variant="body2">Select a table to view its security policies</Typography>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="p-6 pb-2 shrink-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <Typography variant="h5" className="flex items-center gap-3">
                                            {activeTableData.tableName}
                                            {activeTableData.rlsEnabled ? (
                                                <Chip size="small" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">RLS Enabled</Chip>
                                            ) : (
                                                <Chip size="small" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">RLS Disabled</Chip>
                                            )}
                                        </Typography>
                                        <Button
                                            variant="filled"
                                            color="primary"
                                            disabled={!activeCollection}
                                            onClick={() => {
                                                snackbarController.open({
                                                    type: "info",
                                                    message: "RLS Creation coming soon"
                                                });
                                            }}
                                        >
                                            Create Policy
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6 pt-4 flex-grow overflow-auto bg-surface-50 dark:bg-surface-900">
                                    {activeTableData && !activeCollection && (
                                        <Alert
                                            color="warning"
                                            className="mb-6"
                                        >
                                            <Typography variant="body2" className="font-medium mb-1">
                                                Table not managed by Rebase
                                            </Typography>
                                            <Typography variant="caption" className="opacity-80">
                                                This table is not mapped to a FireCMS Schema via code. To edit security policies visually, you must first import this table into a Schema configuration file.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {activeTableData && !activeTableData.rlsEnabled && (
                                        <div className={cls("p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", defaultBorderMixin)}>
                                            <div className="flex gap-4 items-start">
                                                <div className="mt-1 bg-yellow-100 dark:bg-yellow-900/50 p-1.5 rounded-md text-yellow-600 dark:text-yellow-500 shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                </div>
                                                <div>
                                                    <Typography variant="subtitle2" className="text-yellow-800 dark:text-yellow-500 font-medium">
                                                        Row Level Security (RLS) is disabled
                                                    </Typography>
                                                    <Typography variant="body2" className="text-yellow-700 dark:text-yellow-600/90 mt-1 max-w-2xl">
                                                        Your table is completely readable and writable by anyone with access privileges. Enable RLS to create policies that restrict access to specific rows.
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Button
                                                size="medium"
                                                onClick={() => snackbarController.open({ type: "info", message: "Enabling RLS will be available soon." })}
                                                className="whitespace-nowrap bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 dark:text-yellow-500 border-none shrink-0"
                                                disabled={!activeCollection}
                                            >
                                                Enable RLS
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                }
            />
        </div>
    );
};
