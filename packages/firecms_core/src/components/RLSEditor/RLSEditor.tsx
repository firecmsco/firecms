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
    ResizablePanels,
    SecurityIcon,
    RefreshIcon,
    WarningIcon,
    KeyIcon
} from "@firecms/ui";
import { useDataSource, useSnackbarController, useCollectionRegistryController } from "../../hooks";
import { PolicyEditor } from "./PolicyEditor";

export interface PostgresPolicy {
    policyname: string;
    tablename: string;
    permissive: "PERMISSIVE" | "RESTRICTIVE";
    roles: string[];
    cmd: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
    qual: string | null; // USING clause
    with_check: string | null; // WITH CHECK clause
    status?: "live" | "code_only" | "both";
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
    const [activeTab, setActiveTab] = useState(0);

    const [editingPolicy, setEditingPolicy] = useState<PostgresPolicy | "new" | null>(null);

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("firecms_rls_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 20;
        } catch (e) {
            return 20;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("firecms_rls_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

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
        setEditingPolicy(null);
    }, [selectedTable]);

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

    const mergedPolicies = useMemo(() => {
        if (!activeTableData) return [];

        const policiesMap: Record<string, PostgresPolicy> = {};

        // Load live policies
        (activeTableData.policies || []).forEach(p => {
            policiesMap[p.policyname] = { ...p, status: "live" };
        });

        // Merge code-based policies
        if (activeCollection && activeCollection.securityRules) {
            activeCollection.securityRules.forEach((rule: any) => {
                const ruleName = rule.name;
                if (!ruleName) return;

                if (policiesMap[ruleName]) {
                    // It exists in Postgres, but we have a code definition (potentially edited)
                    policiesMap[ruleName] = {
                        policyname: ruleName,
                        tablename: activeTableData.tableName,
                        permissive: (rule.mode || "permissive").toUpperCase() as any,
                        cmd: (rule.operation || "ALL").toUpperCase() as any,
                        roles: rule.roles || ["public"],
                        qual: rule.using || null,
                        with_check: rule.withCheck || null,
                        status: "both"
                    };
                } else {
                    policiesMap[ruleName] = {
                        policyname: ruleName,
                        tablename: activeTableData.tableName,
                        permissive: (rule.mode || "permissive").toUpperCase() as any,
                        cmd: (rule.operation || "ALL").toUpperCase() as any,
                        roles: rule.roles || ["public"],
                        qual: rule.using || null,
                        with_check: rule.withCheck || null,
                        status: "code_only"
                    };
                }
            });
        }

        return Object.values(policiesMap).sort((a, b) => a.policyname.localeCompare(b.policyname));
    }, [activeTableData, activeCollection]);

    const renderPolicyTag = (label: string, value: string) => {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50">
                <span className="text-[10px] uppercase text-text-secondary dark:text-text-secondary-dark font-medium tracking-wider">
                    {label}:
                </span>
                <span className="font-mono text-xs text-text-primary dark:text-text-primary-dark break-all">
                    {value}
                </span>
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
                        <div className={cls("px-4 py-3 border-b", defaultBorderMixin)}>
                            <Typography variant="subtitle1" className="flex items-center gap-2">
                                <SecurityIcon size="small" />
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
                                                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
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
                                className="text-[11px] text-text-secondary dark:text-text-secondary-dark"
                                onClick={fetchRLSData}
                                startIcon={<RefreshIcon size="smallest" />}
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
                        ) : editingPolicy ? (
                            <PolicyEditor
                                policy={editingPolicy === "new" ? undefined : editingPolicy}
                                schema={activeTableData.schemaName}
                                table={activeTableData.tableName}
                                onSave={async (newPolicy) => {
                                    if (!activeCollection) return;
                                    const rule: any = {
                                        name: newPolicy.policyname,
                                        operation: newPolicy.cmd?.toLowerCase(),
                                        mode: newPolicy.permissive?.toLowerCase(),
                                        using: newPolicy.qual || undefined,
                                        withCheck: newPolicy.with_check || undefined,
                                        roles: newPolicy.roles
                                    };

                                    const existingRules = activeCollection.securityRules || [];
                                    let newRules;
                                    if (editingPolicy === "new") {
                                        newRules = [...existingRules, rule];
                                    } else {
                                        newRules = existingRules.map((r: any) => r.name === editingPolicy.policyname ? rule : r);
                                    }

                                    try {
                                        const response = await fetch(`http://localhost:3001/api/schema-editor/collection/save`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                collectionId: (activeCollection as any).id || (activeCollection as any).path || (activeCollection as any).alias || activeTableData.tableName,
                                                collectionData: { securityRules: newRules }
                                            })
                                        });
                                        if (!response.ok) throw new Error("Failed to save policy");

                                        snackbarController.open({ type: "success", message: "Policy saved successfully" });
                                        setEditingPolicy(null);
                                        fetchRLSData();
                                    } catch (e: any) {
                                        snackbarController.open({ type: "error", message: e.message });
                                    }
                                }}
                                onCancel={() => setEditingPolicy(null)}
                            />
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
                                            onClick={() => setEditingPolicy("new")}
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
                                            <Typography variant="body2" className="mb-1">
                                                Table not managed by Rebase
                                            </Typography>
                                            <Typography variant="caption" className="opacity-80">
                                                This table is not mapped to a FireCMS Schema via code. To edit security policies visually, you must first import this table into a Schema configuration file.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {activeTableData && !activeTableData.rlsEnabled && (
                                        <div className={cls("p-4 sm:p-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", defaultBorderMixin)}>
                                            <div className="flex gap-3 items-start">
                                                <div className="mt-1 bg-yellow-100 dark:bg-yellow-900/50 p-1.5 rounded-md shrink-0 flex items-center justify-center">
                                                    <WarningIcon size="small" />
                                                </div>
                                                <div>
                                                    <Typography variant="subtitle2" className="text-yellow-800 dark:text-yellow-500">
                                                        Row Level Security (RLS) is disabled
                                                    </Typography>
                                                    <Typography variant="body2" className="text-yellow-700 dark:text-yellow-600/90 mt-1 max-w-2xl">
                                                        Your table is completely readable and writable by anyone with access privileges. Enable RLS to create policies that restrict access to specific rows.
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Button
                                                size="medium"
                                                onClick={() => setEditingPolicy("new")}
                                                className="whitespace-nowrap bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 dark:text-yellow-500 border-none shrink-0"
                                                disabled={!activeCollection}
                                            >
                                                Create Policy
                                            </Button>
                                        </div>
                                    )}

                                    {activeTableData && mergedPolicies && mergedPolicies.length > 0 && (
                                        <div className="mt-8 flex flex-col gap-3">
                                            <Typography variant="subtitle2" className="text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-1">Active Policies</Typography>
                                            {mergedPolicies.map(policy => (
                                                <div key={policy.policyname} className={cls("p-3 sm:px-4 sm:py-3 bg-white dark:bg-surface-950 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4", defaultBorderMixin)}>
                                                    <div className="flex flex-col gap-2 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <KeyIcon size="small" className="text-text-secondary shrink-0" />
                                                            <Typography variant="body2" className="truncate">{policy.policyname}</Typography>
                                                            {policy.status === "code_only" && (
                                                                <Tooltip title="This policy is defined in your code but hasn't been applied to the database yet.">
                                                                    <div className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                                        Unapplied
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                            {policy.status === "live" && (
                                                                <Tooltip title="This policy is live in the database but missing from your codebase schema.">
                                                                    <div className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
                                                                        DB Only
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 text-sm">
                                                            {renderPolicyTag("Action", policy.cmd)}
                                                            {renderPolicyTag("Roles", Array.isArray(policy.roles) ? policy.roles.join(", ") : policy.roles)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <Button size="small" variant="text" onClick={() => setEditingPolicy(policy)} disabled={!activeCollection}>
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
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
