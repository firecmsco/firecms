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
    KeyIcon,
    DeleteIcon,
    IconButton,
    Tabs,
    Tab
} from "@rebasepro/ui";
import { useRebaseContext, useSnackbarController, useCollectionRegistryController, ErrorView, useTranslation } from "@rebasepro/core";
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

export const RLSEditor = ({ apiUrl = "" }: { apiUrl?: string }) => {
    const { databaseAdmin } = useRebaseContext();
    const snackbarController = useSnackbarController();
    const collectionRegistry = useCollectionRegistryController();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tables, setTables] = useState<TableRLSStatus[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const [editingPolicy, setEditingPolicy] = useState<PostgresPolicy | "new" | null>(null);

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("rebase_rls_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 20;
        } catch (e) {
            return 20;
        }
    });

    const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({ public: true });

    // Sidebar tab: "tables" or "info"
    const [sidebarTab, setSidebarTab] = useState<"tables" | "info">("tables");

    useEffect(() => {
        try {
            localStorage.setItem("rebase_rls_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

    const fetchRLSData = useCallback(async () => {
        if (!databaseAdmin?.executeSql) {
            setError(t("studio_sql_sql_not_supported"));
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
            const tablesResult = await databaseAdmin!.executeSql!(tablesSql);

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
            const policiesResult = await databaseAdmin!.executeSql!(policiesSql);

            const extractRows = (result: unknown): Record<string, unknown>[] => {
                if (result && typeof result === "object" && "rows" in result && Array.isArray((result as { rows: Record<string, unknown>[] }).rows)) {
                    return (result as { rows: Record<string, unknown>[] }).rows;
                }
                if (Array.isArray(result)) return result as Record<string, unknown>[];
                return [];
            };

            const tRows = extractRows(tablesResult);
            const pRows = extractRows(policiesResult);

            const tableMap: Record<string, TableRLSStatus> = {};

            tRows.forEach((tRow: Record<string, unknown>) => {
                const t = tRow as { schemaname?: string, SCHEMANAME?: string, tablename?: string, TABLENAME?: string, rowsecurity?: boolean, ROWSECURITY?: boolean };
                const schema = t.schemaname || t.SCHEMANAME || "public";
                const table = t.tablename || t.TABLENAME || "";
                const rlsEnabled = t.rowsecurity || t.ROWSECURITY || false;

                const key = `${schema}.${table}`;
                tableMap[key] = {
                    schemaName: schema,
                    tableName: table,
                    rlsEnabled: rlsEnabled,
                    policies: []
                };
            });

            pRows.forEach((pRow: Record<string, unknown>) => {
                const p = pRow as { schemaname?: string, SCHEMANAME?: string, tablename?: string, TABLENAME?: string, roles?: string | string[], ROLES?: string | string[], policyname?: string, POLICYNAME?: string, permissive?: "PERMISSIVE" | "RESTRICTIVE", PERMISSIVE?: "PERMISSIVE" | "RESTRICTIVE", cmd?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL", CMD?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL", qual?: string | null, QUAL?: string | null, with_check?: string | null, WITH_CHECK?: string | null };
                const schema = p.schemaname || p.SCHEMANAME || "public";
                const table = p.tablename || p.TABLENAME || "";
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
                        policyname: p.policyname || p.POLICYNAME || "",
                        tablename: table,
                        permissive: p.permissive || p.PERMISSIVE || "PERMISSIVE",
                        roles: parsedRoles,
                        cmd: p.cmd || p.CMD || "ALL",
                        qual: p.qual || p.QUAL || null,
                        with_check: p.with_check || p.WITH_CHECK || null
                    });
                }
            });

            const sortedTables = Object.values(tableMap).sort((a, b) => a.tableName.localeCompare(b.tableName));
            setTables(sortedTables);

            if (sortedTables.length > 0 && !selectedTable) {
                setSelectedTable(`${sortedTables[0].schemaName}.${sortedTables[0].tableName}`);
            }

        } catch (e: unknown) {
            console.error("RLS fetch error:", e);
            setError("Failed to fetch RLS policies: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsLoading(false);
        }
    }, [databaseAdmin, selectedTable]);

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

    const groupedTables = useMemo(() => {
        const groups: Record<string, TableRLSStatus[]> = {};
        tables.forEach(table => {
            if (!groups[table.schemaName]) {
                groups[table.schemaName] = [];
            }
            groups[table.schemaName].push(table);
        });
        return groups;
    }, [tables]);

    const activeCollection = useMemo(() => {
        if (!activeTableData) return null;
        return collectionRegistry.collections?.find((c: { id?: string, path?: string, dbPath?: string, slug?: string, collectionId?: string }) =>
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
            activeCollection.securityRules.forEach((rule: { name?: string, mode?: string, operation?: string, roles?: string[], using?: string, withCheck?: string }) => {
                const ruleName = rule.name;
                if (!ruleName) return;

                if (policiesMap[ruleName]) {
                    // It exists in Postgres, but we have a code definition (potentially edited)
                    policiesMap[ruleName] = {
                        policyname: ruleName,
                        tablename: activeTableData.tableName,
                        permissive: (rule.mode || "permissive").toUpperCase() as PostgresPolicy["permissive"],
                        cmd: (rule.operation || "ALL").toUpperCase() as PostgresPolicy["cmd"],
                        roles: rule.roles || ["public"],
                        qual: rule.using || null,
                        with_check: rule.withCheck || null,
                        status: "both"
                    };
                } else {
                    policiesMap[ruleName] = {
                        policyname: ruleName,
                        tablename: activeTableData.tableName,
                        permissive: (rule.mode || "permissive").toUpperCase() as PostgresPolicy["permissive"],
                        cmd: (rule.operation || "ALL").toUpperCase() as PostgresPolicy["cmd"],
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

    // Stats for the info tab
    const rlsStats = useMemo(() => {
        const total = tables.length;
        const enabled = tables.filter(t => t.rlsEnabled).length;
        const withPolicies = tables.filter(t => t.policies.length > 0).length;
        const totalPolicies = tables.reduce((sum, t) => sum + t.policies.length, 0);
        return { total, enabled, withPolicies, totalPolicies };
    }, [tables]);

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
                    <div className={cls("flex flex-col h-full w-full bg-white dark:bg-surface-950 border-r", defaultBorderMixin)}>
                        <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as "tables" | "info")} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                            <Tab value="tables">Tables</Tab>
                            <Tab value="info">Info</Tab>
                        </Tabs>

                        <div className="flex-grow overflow-hidden relative">
                            {sidebarTab === "tables" && (
                                <div className="flex flex-col h-full">
                                    <div className={cls("flex items-center justify-between px-3 py-2 border-b bg-surface-50 dark:bg-surface-900 min-h-[48px]", defaultBorderMixin)}>
                                        <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                                            {t("studio_schema_tables")}
                                        </Typography>
                                        <IconButton size="small" onClick={fetchRLSData} title="Refresh">
                                            <RefreshIcon size="small" />
                                        </IconButton>
                                    </div>
                                    <div className="flex-grow overflow-y-auto no-scrollbar p-1">
                                        {isLoading && tables.length === 0 ? (
                                            <div className="flex justify-center p-4"><CircularProgress size="small" /></div>
                                        ) : Object.keys(groupedTables).length === 0 ? (
                                            <div className="p-4 text-center">
                                                <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark italic">{t("studio_rls_no_tables")}</Typography>
                                            </div>
                                        ) : (
                                            Object.entries(groupedTables).map(([schemaName, schemaTables]) => (
                                                <div key={schemaName} className="mb-2">
                                                    <div
                                                        className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
                                                        onClick={() => setExpandedSchemas(prev => ({ ...prev, [schemaName]: !prev[schemaName] }))}
                                                    >
                                                        <svg className={cls("w-3 h-3 mr-1 transition-transform", expandedSchemas[schemaName] ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                                        <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-xs truncate flex-grow">{schemaName}</Typography>
                                                    </div>

                                                    {expandedSchemas[schemaName] && (
                                                        <div className="ml-3 mt-1 space-y-0.5">
                                                            {schemaTables.map(table => {
                                                                const key = `${table.schemaName}.${table.tableName}`;
                                                                const isSelected = selectedTable === key;
                                                                return (
                                                                    <div
                                                                        key={key}
                                                                        onClick={() => setSelectedTable(key)}
                                                                        className={cls(
                                                                            "flex items-center p-1 cursor-pointer rounded transition-colors group relative",
                                                                            isSelected
                                                                                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                                                                                : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                                                                        )}
                                                                    >
                                                                        <svg className="w-3.5 h-3.5 mr-1 shrink-0 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                        <Typography variant="body2" className="text-xs truncate flex-1 min-w-0">{table.tableName}</Typography>
                                                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                            {table.rlsEnabled ? (
                                                                                <Tooltip title={t("studio_rls_enabled")}>
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                                </Tooltip>
                                                                            ) : (
                                                                                <Tooltip title={t("studio_rls_disabled")}>
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-50" />
                                                                                </Tooltip>
                                                                            )}
                                                                            <span className="text-[10px] opacity-40 group-hover:opacity-100 min-w-[1.2rem] text-right font-medium">
                                                                                {table.policies.length}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {sidebarTab === "info" && (
                                <div className="flex flex-col h-full">
                                    <div className={cls("flex items-center justify-between px-3 py-2 border-b bg-surface-50 dark:bg-surface-900 min-h-[48px]", defaultBorderMixin)}>
                                        <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                                            Overview
                                        </Typography>
                                    </div>
                                    <div className="flex-grow overflow-y-auto p-3 space-y-3 no-scrollbar">
                                        <div className={cls("p-3 rounded-lg border bg-white dark:bg-surface-900", defaultBorderMixin)}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <SecurityIcon size="small" className="text-primary" />
                                                <Typography variant="body2" className="font-semibold text-[13px]">RLS Studio</Typography>
                                            </div>
                                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[11px] leading-relaxed block">
                                                Manage Row Level Security policies for your PostgreSQL tables. Enable RLS and create fine-grained access policies.
                                            </Typography>
                                        </div>

                                        <div className="space-y-2">
                                            <div className={cls("p-2.5 rounded border bg-white dark:bg-surface-900 flex items-center justify-between", defaultBorderMixin)}>
                                                <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[11px]">Total tables</Typography>
                                                <Typography variant="body2" className="font-mono text-[13px] font-medium">{rlsStats.total}</Typography>
                                            </div>
                                            <div className={cls("p-2.5 rounded border bg-white dark:bg-surface-900 flex items-center justify-between", defaultBorderMixin)}>
                                                <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[11px]">RLS enabled</Typography>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    <Typography variant="body2" className="font-mono text-[13px] font-medium">{rlsStats.enabled}</Typography>
                                                </div>
                                            </div>
                                            <div className={cls("p-2.5 rounded border bg-white dark:bg-surface-900 flex items-center justify-between", defaultBorderMixin)}>
                                                <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[11px]">Tables with policies</Typography>
                                                <Typography variant="body2" className="font-mono text-[13px] font-medium">{rlsStats.withPolicies}</Typography>
                                            </div>
                                            <div className={cls("p-2.5 rounded border bg-white dark:bg-surface-900 flex items-center justify-between", defaultBorderMixin)}>
                                                <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[11px]">Total policies</Typography>
                                                <Typography variant="body2" className="font-mono text-[13px] font-medium">{rlsStats.totalPolicies}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
                secondPanel={
                    <div className="flex-grow flex flex-col min-w-0 h-full w-full bg-white dark:bg-surface-950">
                        {/* Toolbar Header matching SQL/JS Editor style */}
                        <div className={cls("flex items-center justify-between pr-2 border-b bg-white dark:bg-surface-950 min-h-[46px]", defaultBorderMixin)}>
                            <div className="flex items-center flex-grow overflow-hidden px-4">
                                <Typography variant="subtitle2" className="font-mono text-text-secondary dark:text-text-secondary-dark truncate">
                                    {activeTableData ? `${activeTableData.schemaName}.${activeTableData.tableName}` : t("studio_rls_select_table")}
                                </Typography>
                                {activeTableData && (
                                    <div className="ml-3">
                                        {activeTableData.rlsEnabled ? (
                                            <Chip size="smallest" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">{t("studio_rls_enabled")}</Chip>
                                        ) : (
                                            <Chip size="smallest" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">{t("studio_rls_disabled")}</Chip>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex shrink-0 items-center justify-end gap-1.5">
                                {activeTableData && (
                                    <>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={async () => {
                                                const table = activeTableData.tableName;
                                                const action = activeTableData.rlsEnabled ? "DISABLE" : "ENABLE";
                                                if (!confirm(`Are you sure you want to ${action.toLowerCase()} Row Level Security on "${table}"?`)) return;
                                                try {
                                                    await databaseAdmin!.executeSql!(`ALTER TABLE "${table}" ${action} ROW LEVEL SECURITY`);
                                                    snackbarController.open({ type: "success", message: `RLS ${action.toLowerCase()}d on ${table}` });
                                                    fetchRLSData();
                                                } catch (e: unknown) {
                                                    snackbarController.open({ type: "error", message: e instanceof Error ? e.message : String(e) });
                                                }
                                            }}
                                        >
                                            {activeTableData.rlsEnabled ? t("studio_rls_disable_rls") : t("studio_rls_enable_rls")}
                                        </Button>

                                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1" />

                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={fetchRLSData}
                                            startIcon={<RefreshIcon size="smallest" />}
                                        >
                                            Refresh
                                        </Button>

                                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1" />

                                        <Button
                                            size="small"
                                            color="primary"
                                            disabled={!activeCollection}
                                            onClick={() => setEditingPolicy("new")}
                                        >
                                            {t("studio_rls_create_policy")}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {error ? (
                            <div className="p-6 h-full flex items-center justify-center">
                                <ErrorView title={t("studio_rls_error")} error={error} onRetry={fetchRLSData} />
                            </div>
                        ) : !activeTableData ? (
                            <div className="flex-grow flex items-center justify-center text-text-disabled h-full">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    <Typography variant="body2">{t("studio_rls_select_table")}</Typography>
                                </div>
                            </div>
                        ) : editingPolicy ? (
                            <PolicyEditor
                                policy={editingPolicy === "new" ? undefined : editingPolicy}
                                schema={activeTableData.schemaName}
                                table={activeTableData.tableName}
                                onSave={async (newPolicy) => {
                                    if (!activeCollection) return;
                                    const rule: Record<string, unknown> = {
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
                                        newRules = existingRules.map((r: { name?: string }) => r.name === editingPolicy.policyname ? rule : r);
                                    }

                                    try {
                                        const response = await fetch(`${apiUrl}/api/schema-editor/collection/save`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                collectionId: (activeCollection as { id?: string, path?: string, alias?: string }).id || (activeCollection as { id?: string, path?: string, alias?: string }).path || (activeCollection as { id?: string, path?: string, alias?: string }).alias || activeTableData.tableName,
                                                collectionData: { securityRules: newRules }
                                            })
                                        });
                                        if (!response.ok) throw new Error("Failed to save policy");

                                        snackbarController.open({ type: "success", message: "Policy saved successfully" });
                                        setEditingPolicy(null);
                                        fetchRLSData();
                                    } catch (e: unknown) {
                                        snackbarController.open({ type: "error", message: e instanceof Error ? e.message : String(e) });
                                    }
                                }}
                                onCancel={() => setEditingPolicy(null)}
                            />
                        ) : (
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="p-6 pt-4 flex-grow overflow-auto bg-surface-50 dark:bg-surface-900">
                                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                                    {activeTableData && !activeCollection && (
                                        <Alert
                                            color="warning"
                                        >
                                            <Typography variant="body2" className="mb-1">
                                                Table not managed by Rebase
                                            </Typography>
                                            <Typography variant="caption" className="opacity-80">
                                                This table is not mapped to a Rebase Schema via code. To edit security policies visually, you must first import this table into a Schema configuration file.
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
                                                variant="filled"
                                                color="neutral"
                                                onClick={() => setEditingPolicy("new")}
                                                className="shrink-0 whitespace-nowrap"
                                                disabled={!activeCollection}
                                            >
                                                {t("studio_rls_create_policy")}
                                            </Button>
                                        </div>
                                    )}

                                    {activeTableData && mergedPolicies && mergedPolicies.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <Typography variant="subtitle2" className="text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mb-1">{t("studio_rls_policies")}</Typography>
                                            {mergedPolicies.map(policy => (
                                                <Paper key={policy.policyname} className={cls("p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-lg", defaultBorderMixin)}>
                                                    <div className="flex flex-col gap-2 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <KeyIcon size="small" className="text-text-secondary dark:text-text-secondary-dark shrink-0" />
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
                                                    <div className="flex gap-2 shrink-0 items-center">
                                                        {policy.status === "live" && activeCollection && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={async () => {
                                                                    const rule: Record<string, unknown> = {
                                                                        name: policy.policyname,
                                                                        operation: policy.cmd?.toLowerCase(),
                                                                        mode: policy.permissive?.toLowerCase(),
                                                                        using: policy.qual || undefined,
                                                                        withCheck: policy.with_check || undefined,
                                                                        roles: policy.roles
                                                                    };

                                                                    const existingRules = activeCollection.securityRules || [];
                                                                    const newRules = [...existingRules, rule];

                                                                    try {
                                                                        const response = await fetch(`${apiUrl}/api/schema-editor/collection/save`, {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({
                                                                                collectionId: (activeCollection as { id?: string, path?: string, alias?: string }).id || (activeCollection as { id?: string, path?: string, alias?: string }).path || (activeCollection as { id?: string, path?: string, alias?: string }).alias || activeTableData!.tableName,
                                                                                collectionData: { securityRules: newRules }
                                                                            })
                                                                        });
                                                                        if (!response.ok) throw new Error("Failed to save policy");

                                                                        snackbarController.open({ type: "success", message: "Policy imported successfully" });
                                                                        fetchRLSData();
                                                                    } catch (e: unknown) {
                                                                        snackbarController.open({ type: "error", message: e instanceof Error ? e.message : String(e) });
                                                                    }
                                                                }}
                                                            >
                                                                Import to codebase
                                                            </Button>
                                                        )}
                                                        <Button size="small" variant="text" color="primary" onClick={() => setEditingPolicy(policy)} disabled={!activeCollection}>
                                                            {t("studio_rls_edit")}
                                                        </Button>
                                                        {policy.status !== "code_only" && (
                                                            <Tooltip title={t("studio_rls_delete")} asChild={true}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={async () => {
                                                                        const table = activeTableData!.tableName;
                                                                        if (!confirm(`Drop policy "${policy.policyname}" from table "${table}"?`)) return;
                                                                        try {
                                                                            await databaseAdmin!.executeSql!(`DROP POLICY "${policy.policyname}" ON "${table}"`);
                                                                            snackbarController.open({ type: "success", message: `Policy "${policy.policyname}" dropped` });
                                                                            fetchRLSData();
                                                                        } catch (e: unknown) {
                                                                            snackbarController.open({ type: "error", message: e instanceof Error ? e.message : String(e) });
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon size="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </Paper>
                                            ))}
                                        </div>
                                    )}

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                }
            />
        </div>
    );
};
