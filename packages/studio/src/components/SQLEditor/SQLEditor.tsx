import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    Button,
    Paper,
    Typography,
    CircularProgress,
    cls,
    IconButton,
    InputLabel,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    TextField,
    Tooltip,
    Alert,
    Tabs,
    Tab,
    defaultBorderMixin,
    Select,
    SelectItem,
    Menu,
    MenuItem,
    ResizablePanels,
    Chip
} from "@rebasepro/ui";
import { useDataSource, useSnackbarController, useCollectionRegistryController, useSideEntityController, VirtualTable, VirtualTableColumn, VirtualTableInput, ConfirmationDialog, ErrorView, IconForView, useTranslation } from "@rebasepro/core";
import { MonacoEditor } from "./MonacoEditor";
import { SQLEditorSidebar, Snippet } from "./SQLEditorSidebar";
import { parseFirst } from "pgsql-ast-parser";
import { determineTableAndPK, resolveQueryCollections, ResolvedQueryCollection } from "../../utils/sql_utils";
import { ExplainVisualizer } from "./ExplainVisualizer";

export interface SQLEditorColumnInfo {
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
}

export interface TableInfo {
    schemaName: string;
    tableName: string;
    columns: SQLEditorColumnInfo[];
}

const QueryLoadingView = () => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            setElapsed(Date.now() - start);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <CircularProgress size="medium" />
                <Typography variant="body2" className="mt-4 text-text-secondary dark:text-text-secondary-dark font-mono tracking-tight animate-pulse">
                    EXECUTING QUERY...
                </Typography>
                <div className="mt-2 text-xs font-mono text-text-disabled dark:text-text-disabled-dark">
                    {(elapsed / 1000).toFixed(1)}s elapsed
                </div>
            </div>
        </div>
    );
};

const STORAGE_KEY_TABS = "rebase_sql_tabs";
const STORAGE_KEY_ACTIVE_TAB = "rebase_sql_active_tab";

export const SQLEditor = () => {
    const dataSource = useDataSource();
    const snackbarController = useSnackbarController();
    const collectionRegistry = useCollectionRegistryController();
    const sideEntityController = useSideEntityController();
    const { t } = useTranslation();

    // Schema state
    const [schemas, setSchemas] = useState<Record<string, TableInfo[]>>({});
    const [isSchemaLoading, setIsSchemaLoading] = useState(true);
    const schemaFetchedRef = useRef(false);
    const [schemaError, setSchemaError] = useState<string | null>(null);

    // Connection state
    const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(() => {
        return localStorage.getItem("rebase_sql_selected_db") || undefined;
    });
    const [selectedRole, setSelectedRole] = useState<string | undefined>(() => {
        return localStorage.getItem("rebase_sql_selected_role") || undefined;
    });

    const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [connectionConfigError, setConnectionConfigError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchConnectionConfig = async () => {
            if (!dataSource.fetchAvailableDatabases || !dataSource.fetchAvailableRoles) {
                setConnectionConfigError(t("studio_sql_sql_not_supported"));
                setIsLoadingConfig(false);
                return;
            }

            try {
                const [dbs, roles, currentDbFromApi] = await Promise.all([
                    dataSource.fetchAvailableDatabases(),
                    dataSource.fetchAvailableRoles(),
                    typeof dataSource.fetchCurrentDatabase === "function" ? dataSource.fetchCurrentDatabase() : Promise.resolve(undefined)
                ]);

                if (mounted) {
                    setAvailableDatabases(dbs);
                    setAvailableRoles(roles);

                    // Set default database: always prefer the actual connected database.
                    // The 'postgres' system database is typically empty and not useful as a default.
                    if (dbs.length > 0) {
                        const actualDb = currentDbFromApi && dbs.includes(currentDbFromApi) ? currentDbFromApi : dbs[0];
                        setSelectedDatabase(actualDb);
                        localStorage.setItem("rebase_sql_selected_db", actualDb);
                    }

                    // Set default role if not selected, preferring 'postgres'
                    if (!localStorage.getItem("rebase_sql_selected_role") && roles.length > 0) {
                        const defaultRole = roles.includes("postgres") ? "postgres" : roles[0];
                        setSelectedRole(defaultRole);
                        localStorage.setItem("rebase_sql_selected_role", defaultRole);
                    }
                }
            } catch (err: unknown) {
                console.error("Failed to fetch databases or roles:", err);
                if (mounted) {
                    const message = err instanceof Error ? err.message : String(err);
                    setConnectionConfigError(t("studio_sql_fetch_error", { message }));
                }
            } finally {
                if (mounted) {
                    setIsLoadingConfig(false);
                }
            }
        };

        fetchConnectionConfig();

        return () => { mounted = false; };
    }, [dataSource]);

    const handleDatabaseChange = (db: string) => {
        setSelectedDatabase(db);
        localStorage.setItem("rebase_sql_selected_db", db);
        // Reset so the schema will be re-fetched for the new database
        schemaFetchedRef.current = false;
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        localStorage.setItem("rebase_sql_selected_role", role);
    };

    const fetchSchema = useCallback(async () => {
        if (!dataSource.executeSql) {
            setSchemaError(t("studio_sql_sql_not_supported"));
            setIsSchemaLoading(false);
            return;
        }

        setIsSchemaLoading(true);
        setSchemaError(null);
        try {
            const sql = `
                SELECT 
                    c.table_schema as schema, 
                    c.table_name as "table", 
                    c.column_name as "column",
                    c.data_type as "data_type",
                    CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END as "is_pk"
                FROM 
                    information_schema.columns c
                LEFT JOIN information_schema.table_constraints tc
                    ON tc.table_schema = c.table_schema 
                    AND tc.table_name = c.table_name 
                    AND tc.constraint_type = 'PRIMARY KEY'
                LEFT JOIN information_schema.key_column_usage kcu
                    ON kcu.constraint_name = tc.constraint_name
                    AND kcu.table_schema = tc.table_schema
                    AND kcu.table_name = tc.table_name
                    AND kcu.column_name = c.column_name
                WHERE 
                    c.table_schema NOT IN ('information_schema', 'pg_catalog')
                ORDER BY 
                    c.table_schema, c.table_name, c.ordinal_position;
            `;
            // Pass the selected database so schema introspection targets the right DB.
            const result = await dataSource.executeSql(sql, { database: selectedDatabase });

            const processGrouped = (data: Record<string, unknown>[]) => {
                const grouped = data.reduce((acc: Record<string, TableInfo[]>, curr: Record<string, unknown>) => {
                    const schema = (curr.schema || curr.SCHEMA || curr.table_schema || "public") as string;
                    const table = (curr.table || curr.TABLE || curr.table_name) as string;
                    const column = (curr.column || curr.COLUMN || curr.column_name) as string;
                    const dataType = (curr.data_type || curr.DATA_TYPE || "") as string;
                    const isPrimaryKey = curr.is_pk === true || curr.is_pk === "true";

                    if (!acc[schema]) acc[schema] = [];
                    let tableInfo = acc[schema].find(t => t.tableName === table);
                    if (!tableInfo) {
                        tableInfo = { schemaName: schema, tableName: table, columns: [] };
                        acc[schema].push(tableInfo);
                    }
                    tableInfo.columns.push({ name: column, dataType, isPrimaryKey });
                    return acc;
                }, {});
                setSchemas(grouped);
            };

            if (!result || !Array.isArray(result)) {
                if (result && typeof result === "object" && "rows" in result && Array.isArray((result as { rows: Record<string, unknown>[] }).rows)) {
                    processGrouped((result as { rows: Record<string, unknown>[] }).rows);
                } else {
                    setSchemaError(t("studio_sql_unexpected_format", { type: typeof result }));
                    setSchemas({});
                }
            } else if (result.length === 0) {
                setSchemas({});
                setSchemaError(t("studio_sql_no_tables"));
            } else {
                processGrouped(result);
            }

            schemaFetchedRef.current = true;
        } catch (e: unknown) {
            console.error("Schema fetch error:", e);
            const message = e instanceof Error ? e.message : String(e);
            setSchemaError(t("studio_sql_schema_fetch_error", { message }));
        } finally {
            setIsSchemaLoading(false);
        }
    }, [dataSource, selectedDatabase]);

    useEffect(() => {
        // Fetch schema after config finishes loading, and re-fetch when the selected database changes.
        if (!isLoadingConfig && !schemaFetchedRef.current) {
            fetchSchema();
        }
    }, [fetchSchema, isLoadingConfig, selectedDatabase]);

    // Tabbed interface state
    const [tabs, setTabs] = useState<Array<{
        id: string,
        name: string,
        sql: string,
        results: Record<string, unknown>[] | null,
        loading: boolean,
        error: string | null,
        execTime: number | null,
        lastExecutedSql: string | null
    }>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_TABS);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((t: Record<string, unknown>) => ({
                ...t,
                results: null,
                loading: false,
                error: null,
                execTime: null,
                lastExecutedSql: null
            }));
        }
        return [{
            id: "1",
            name: "Query 1",
            sql: "SELECT * FROM ",
            results: null,
            loading: false,
            error: null,
            execTime: null,
            lastExecutedSql: null
        }];
    });
    const [activeTabId, setActiveTabId] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY_ACTIVE_TAB) || "1";
    });

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // Helper to update active tab state
    const updateActiveTab = useCallback((update: Partial<typeof activeTab>) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...update } : t));
    }, [activeTabId]);

    const sql = activeTab.sql;
    const results = activeTab.results;
    const loading = activeTab.loading;
    const error = activeTab.error;
    const execTime = activeTab.execTime;

    const setSql = (newSql: string) => updateActiveTab({ sql: newSql });
    const setResults = (newResults: Record<string, unknown>[] | null) => updateActiveTab({ results: newResults });
    const setLoading = (newLoading: boolean) => updateActiveTab({ loading: newLoading });
    const setError = (newError: string | null) => updateActiveTab({ error: newError });

    const [autoLimit, setAutoLimit] = useState(true);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{ rowIndex: number, columnKey: string, initialValue: unknown } | null>(null);

    const handleDoubleClick = useCallback((rowIndex: number, columnKey: string, initialValue: unknown, rowData: Record<string, unknown>) => {
        if (!activeTab.lastExecutedSql) {
            snackbarController.open({
                type: "error",
                message: t("studio_sql_cannot_edit_missing_query")
            });
            return;
        }

        const resolution = determineTableAndPK(activeTab.lastExecutedSql, columnKey, schemas);

        if (resolution.error || !resolution.primaryKeys || resolution.primaryKeys.length === 0) {
            snackbarController.open({
                type: "error",
                message: resolution.error || t("studio_sql_cannot_resolve_table")
            });
            return;
        }

        // Check all PK values are present in the row
        const missingPKs = resolution.primaryKeys.filter(
            pk => rowData[pk.resultColumn] === undefined || rowData[pk.resultColumn] === null
        );
        if (missingPKs.length > 0) {
            snackbarController.open({
                type: "error",
                message: t("studio_sql_missing_pk", { columns: missingPKs.map(pk => `"${pk.resultColumn}"`).join(", ") })
            });
            return;
        }

        setEditingCell({ rowIndex, columnKey, initialValue });
    }, [activeTab.lastExecutedSql, schemas, snackbarController]);

    const handleCellSave = useCallback(async (newValue: string | null, rowData: Record<string, unknown>, columnKey: string, rowIndex: number) => {
        if (!editingCell || !activeTab.lastExecutedSql) return;

        setEditingCell(null); // Optimistically close

        if (newValue === editingCell.initialValue) return;

        const resolution = determineTableAndPK(activeTab.lastExecutedSql, columnKey, schemas);
        if (resolution.error || !resolution.tableName || !resolution.primaryKeys || resolution.primaryKeys.length === 0) {
            snackbarController.open({ type: "error", message: resolution.error || "Resolution failed." });
            return;
        }

        const tableName = resolution.tableName;

        const formatValue = (val: unknown) => {
            if (val === null || val === undefined) return "NULL";
            if (typeof val === "number") return val;
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            return `'${String(val).replace(/'/g, "''")}'`;
        };

        // Resolve the actual DB column name for the edited column (may differ from the result alias)
        // e.g. if the query has `a.name AS author_name`, columnKey = "author_name" but DB column = "name"
        const resolveDbColumnName = (resultColKey: string): string => {
            try {
                const ast = parseFirst(activeTab.lastExecutedSql!);
                if (ast.type === "select" && ast.columns) {
                    for (const col of ast.columns) {
                        if (col.expr?.type === "ref") {
                            const alias = col.alias?.name;
                            const colName = col.expr.name;
                            if (alias === resultColKey || (!alias && colName === resultColKey)) {
                                return colName;
                            }
                        }
                    }
                }
            } catch { /* fall back to columnKey */ }
            return resultColKey;
        };

        const dbColumnName = resolveDbColumnName(columnKey);

        // Build composite WHERE clause
        const whereConditions = resolution.primaryKeys.map(
            pk => `"${pk.dbColumn}" = ${formatValue(rowData[pk.resultColumn])}`
        ).join(" AND ");

        const updateSql = `UPDATE "${tableName}" SET "${dbColumnName}" = ${formatValue(newValue)} WHERE ${whereConditions};`;

        try {
            if (dataSource.executeSql) {
                await dataSource.executeSql(updateSql, { database: selectedDatabase, role: selectedRole });

                const newResults = [...(activeTab.results || [])];
                if (newResults[rowIndex]) {
                    newResults[rowIndex] = { ...newResults[rowIndex], [columnKey]: newValue };
                }
                updateActiveTab({ results: newResults });

                snackbarController.open({
                    type: "success",
                    message: t("studio_sql_row_updated")
                });
            }
        } catch (e: unknown) {
            snackbarController.open({
                type: "error",
                message: t("studio_sql_update_failed", { message: e instanceof Error ? e.message : String(e) })
            });
        }
    }, [editingCell, schemas, activeTab.lastExecutedSql, activeTab.results, dataSource, updateActiveTab, snackbarController, selectedDatabase, selectedRole]);

    const [columnWidths, setColumnWidths] = useState<Record<string, Record<string, number>>>(() => {
        const saved = localStorage.getItem("rebase_sql_column_widths");
        return saved ? JSON.parse(saved) : {};
    });
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [newSnippetName, setNewSnippetName] = useState("");

    // Load from local storage
    useEffect(() => {
        const savedSnippets = localStorage.getItem("rebase_sql_snippets");
        if (savedSnippets) setSnippets(JSON.parse(savedSnippets));

        const savedHistory = localStorage.getItem("rebase_sql_history");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    // Save tabs and active tab to local storage
    useEffect(() => {
        const sanitizedTabs = tabs.map(t => ({
            id: t.id,
            name: t.name,
            sql: t.sql
        }));
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(sanitizedTabs));
    }, [tabs]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, activeTabId);
    }, [activeTabId]);

    const saveSnippets = (newSnippets: Snippet[]) => {
        setSnippets(newSnippets);
        localStorage.setItem("rebase_sql_snippets", JSON.stringify(newSnippets));
    };

    const saveHistory = (newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem("rebase_sql_history", JSON.stringify(newHistory.slice(-50)));
    };

    const handleDeleteSnippet = (id: string) => {
        saveSnippets(snippets.filter(s => s.id !== id));
    };

    const handleAddTab = () => {
        const newId = Math.random().toString(36).substring(2, 9);

        // Find the next available query number
        let maxNumber = 0;
        tabs.forEach(tab => {
            const match = tab.name.match(/^Query (\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) maxNumber = num;
            }
        });
        const name = `Query ${maxNumber + 1}`;
        setTabs(prev => [...prev, {
            id: newId,
            name,
            sql: "SELECT * FROM ",
            results: null,
            loading: false,
            error: null,
            execTime: null,
            lastExecutedSql: null
        }]);
        setActiveTabId(newId);
    };

    const handleCloseTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length === 1) return;

        const tabIndex = tabs.findIndex(t => t.id === id);
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);

        if (activeTabId === id) {
            // Find a new active tab: the one at the same index, or the last one if we closed the last
            const nextIndex = Math.min(tabIndex, newTabs.length - 1);
            if (newTabs[nextIndex]) {
                setActiveTabId(newTabs[nextIndex].id);
            }
        }
    };

    const handleColumnResize = useCallback(({ key, width }: { key: string, width: number }) => {
        setColumnWidths(prev => {
            const newWidths = {
                ...prev,
                [activeTab.sql]: {
                    ...(prev[activeTab.sql] || {}),
                    [key]: width
                }
            };
            localStorage.setItem("rebase_sql_column_widths", JSON.stringify(newWidths));
            return newWidths;
        });
    }, [activeTab.sql]);

    const handlePrettify = () => {
        // Simple formatting for now
        const formatted = activeTab.sql
            .replace(/\s+/g, " ")
            .replace(/\s?,\s?/g, ", ")
            .replace(/\s?=\s?/g, " = ")
            .trim();
        setSql(formatted);
    };

    const handleExplain = async () => {
        const explainSql = `EXPLAIN (FORMAT JSON, ANALYZE) ${activeTab.sql}`;
        updateActiveTab({ loading: true, error: null, results: null });
        const start = performance.now();
        try {
            if (dataSource.executeSql) {
                const result = await dataSource.executeSql(explainSql, { database: selectedDatabase, role: selectedRole });
                updateActiveTab({ results: result, execTime: Math.round(performance.now() - start) });
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            updateActiveTab({ error: message || t("studio_sql_error_explaining") });
        } finally {
            updateActiveTab({ loading: false });
        }
    };

    const executeRun = useCallback(async (sqlOverride?: string) => {
        let sqlToRun = sqlOverride || activeTab.sql;
        if (autoLimit && sqlToRun.toUpperCase().includes("SELECT") && !sqlToRun.toUpperCase().includes("LIMIT")) {
            sqlToRun = `${sqlToRun.trim()} LIMIT 1000`;
        }

        updateActiveTab({ loading: true, error: null, results: null });
        const start = performance.now();

        try {
            if (dataSource.executeSql) {
                const result = await dataSource.executeSql(sqlToRun, { database: selectedDatabase, role: selectedRole });
                updateActiveTab({
                    results: result,
                    execTime: Math.round(performance.now() - start),
                    lastExecutedSql: sqlToRun
                });

                if (history[history.length - 1] !== activeTab.sql) {
                    saveHistory([...history, activeTab.sql]);
                }
            } else {
                updateActiveTab({ error: t("studio_sql_execution_not_supported") });
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            updateActiveTab({ error: message || t("studio_sql_error_executing") });
        } finally {
            updateActiveTab({ loading: false });
        }
    }, [activeTab.sql, autoLimit, dataSource, history, updateActiveTab]);

    const handleRun = useCallback(async (selectedText?: string) => {
        const sqlTarget = selectedText || activeTab.sql;
        if (!sqlTarget.trim()) return;

        // Destructive operation check
        const destructiveKeywords = ["DELETE", "DROP", "TRUNCATE", "UPDATE"];
        const hasDestructive = destructiveKeywords.some(kw => sqlTarget.toUpperCase().includes(kw));
        const hasWhere = sqlTarget.toUpperCase().includes("WHERE");

        if (hasDestructive && (!hasWhere || sqlTarget.toUpperCase().includes("DROP") || sqlTarget.toUpperCase().includes("TRUNCATE"))) {
            setPendingAction(() => () => executeRun(selectedText));
            setIsConfirmDialogOpen(true);
            return;
        }

        executeRun(selectedText);
    }, [activeTab.sql, executeRun]);

    // Global keybindings
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                // If we are in an input or textarea (except the code editor which handles its own), we might not want to run
                const activeElement = document.activeElement;
                const isInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";
                // If it's the monaco editor textarea, it's fine, let's trigger handleRun
                // Actually the monaco editor already has its own action, so we don't need a global one IF focused in monaco.
                // But wait, if we have both, it might run twice.
                // Let's check if we're focused in monaco.
                const isMonaco = activeElement?.className?.includes("monaco-mouse-cursor-text");

                if (!isMonaco && !isInput) {
                    e.preventDefault();
                    handleRun();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleRun]);

    const handleSaveSnippet = () => {
        if (!newSnippetName.trim() || !sql.trim()) return;

        const newSnippet: Snippet = {
            id: Math.random().toString(36).substring(2, 9),
            name: newSnippetName,
            sql: sql,
            createdAt: Date.now()
        };

        saveSnippets([...snippets, newSnippet]);
        setNewSnippetName("");
        setIsSaveDialogOpen(false);
        snackbarController.open({
            type: "success",
            message: t("studio_sql_snippet_saved", { name: newSnippetName })
        });
    };

    const handleExportCSV = () => {
        if (!results || results.length === 0) return;

        const headers = Object.keys(results[0]).join(",");
        const rows = results.map(row =>
            Object.values(row).map(val => {
                const str = String(val);
                return str.includes(",") ? `"${str}"` : str;
            }).join(",")
        );
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `query_results_${new Date().toISOString().slice(0, 19)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        if (!results || results.length === 0) return;

        const json = JSON.stringify(results, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `query_results_${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportMarkdown = () => {
        if (!results || results.length === 0) return;

        const headers = Object.keys(results[0]);
        const headerRow = `| ${headers.join(" | ")} |`;
        const dividerRow = `| ${headers.map(() => "---").join(" | ")} |`;
        const dataRows = results.map(row =>
            `| ${headers.map(header => {
                const val = row[header];
                if (val === null) return "null";
                if (val === undefined) return "";
                // Replace pipes and newlines to avoid breaking the markdown table
                return String(val).replace(/\|/g, "\\|").replace(/\n/g, " ");
            }).join(" | ")} |`
        );

        const markdown = [headerRow, dividerRow, ...dataRows].join("\n");
        navigator.clipboard.writeText(markdown).then(() => {
            snackbarController.open({
                type: "success",
                message: t("studio_sql_markdown_copied")
            });
        }).catch(() => {
            snackbarController.open({
                type: "error",
                message: t("studio_sql_markdown_copy_failed")
            });
        });
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <CircularProgress size="medium" />
                        <Typography variant="body2" className="mt-4 text-text-secondary dark:text-text-secondary-dark font-mono tracking-tight animate-pulse">{t("studio_sql_executing_query")}</Typography>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-grow flex items-center justify-center p-6 overflow-auto">
                    <ErrorView title={t("studio_sql_query_error")} error={error} />
                </div>
            );
        }

        if (!results) {
            return (
                <div className="flex-grow flex items-center justify-center text-text-disabled dark:text-text-disabled-dark">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        <Typography variant="body2">{t("studio_sql_run_query_placeholder")}</Typography>
                    </div>
                </div>
            );
        }

        // Check for EXPLAIN (FORMAT JSON) response
        if (results.length === 1 && results[0]["QUERY PLAN"] && Array.isArray(results[0]["QUERY PLAN"])) {
            try {
                const plan = results[0]["QUERY PLAN"][0].Plan;
                if (plan) {
                    return (
                        <div className="flex-grow overflow-auto p-4 bg-surface-50 dark:bg-surface-900 flex flex-col items-start">
                            <Typography variant="caption" className="font-bold text-text-secondary mb-4 tracking-wider uppercase">{t("studio_sql_visual_execution_plan")}</Typography>
                            <div className="pb-12">
                                <ExplainVisualizer plan={plan} />
                            </div>
                        </div>
                    );
                }
            } catch (e) {
                console.warn("Failed to parse EXPLAIN JSON output:", e);
            }
        }

        if (results.length === 0) {
            return (
                <div className="flex-grow p-6 flex flex-col items-center justify-center">
                    <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark font-mono border-b border-surface-200 dark:border-surface-800 pb-2 mb-2">{t("studio_sql_success")}</Typography>
                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_no_results")}</Typography>
                </div>
            );
        }

        const savedWidths = columnWidths[activeTab.sql] || {};
        const resultColumnKeys = Object.keys(results[0]);

        // Compute matched CMS collections for this query, including PK column detection
        const matchedCollections: ResolvedQueryCollection[] = (() => {
            if (!activeTab.lastExecutedSql || !collectionRegistry.collections) return [];
            try {
                return resolveQueryCollections(activeTab.lastExecutedSql, schemas, collectionRegistry.collections, resultColumnKeys);
            } catch {
                return [];
            }
        })();

        // Only collections that have a PK column in the result set can be opened
        const actionableCollections = matchedCollections.filter(mc => mc.pkColumn && resultColumnKeys.includes(mc.pkColumn));

        // For each row, determine which entities can be opened
        const getRowEntityActions = (rowData: Record<string, unknown>): { collection: ResolvedQueryCollection, entityId: string | number }[] => {
            if (!rowData) return [];
            return actionableCollections
                .filter(mc => rowData[mc.pkColumn!] != null)
                .map(mc => ({
                    collection: mc,
                    entityId: rowData[mc.pkColumn!] as string | number
                }));
        };

        // Build the columns array. If we have actionable CMS collections, prepend a dedicated action column.
        const dataColumns: VirtualTableColumn[] = resultColumnKeys.map(key => ({
            key,
            title: key,
            width: savedWidths[key] ?? 150,
            sortable: false,
            resizable: true
        }));

        const columns: VirtualTableColumn[] = actionableCollections.length > 0
            ? [{ key: "__cms_action__", title: "", width: 36, sortable: false, resizable: false }, ...dataColumns]
            : dataColumns;

        return (
            <div className="flex-grow flex flex-col overflow-hidden min-h-0">
                {/* CMS Collection Badges Bar */}
                {actionableCollections.length > 0 && (
                    <div className={cls("px-4 py-1.5 border-b flex items-center gap-2 shrink-0 bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                        <Tooltip title={t("studio_sql_cms_collections_tooltip")}>
                            <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-widest text-text-disabled dark:text-text-disabled-dark mr-1 shrink-0 cursor-help">{t("studio_sql_cms")}</Typography>
                        </Tooltip>
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {actionableCollections.map(mc => (
                                <Tooltip key={mc.tableName} title={`Table "${mc.tableName}" → ${mc.collection.name} (PK: ${mc.pkColumn})`}>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 dark:bg-primary-dark/15 text-primary dark:text-primary-dark whitespace-nowrap border border-primary/20 dark:border-primary-dark/20">
                                        {typeof mc.collection.icon === "string" && (
                                            <IconForView collectionOrView={{ icon: mc.collection.icon } as never} className="text-[12px]" />
                                        )}
                                        {mc.collection.name}
                                    </span>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex-grow relative h-full">
                    <VirtualTable
                        data={results}
                        columns={columns}
                        rowHeight={32}
                        headerHeight={32}
                        onColumnResizeEnd={handleColumnResize}
                        cellRenderer={({ rowData, column, rowIndex }) => {
                            // Dedicated CMS action column
                            if (column.key === "__cms_action__") {
                                const rowActions = getRowEntityActions(rowData);
                                if (rowActions.length === 0) {
                                    return <div className="h-full w-full" />;
                                }
                                if (rowActions.length === 1) {
                                    const ra = rowActions[0];
                                    return (
                                        <div className="h-full flex items-center justify-center">
                                            <Tooltip title={t("studio_sql_edit_entity", { name: ra.collection.collection.name, id: String(ra.entityId) })}>
                                                <button
                                                    className="p-1 text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors rounded"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sideEntityController.open({
                                                            path: ra.collection.collection.slug,
                                                            entityId: ra.entityId,
                                                            collection: ra.collection.collection,
                                                            updateUrl: false
                                                        });
                                                    }}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </button>
                                            </Tooltip>
                                        </div>
                                    );
                                }
                                // Multiple matched collections (JOIN) — show a dropdown
                                return (
                                    <div className="h-full flex items-center justify-center">
                                        <Menu
                                            trigger={
                                                <button
                                                    className="p-1 text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </button>
                                            }
                                        >
                                            {rowActions.map(ra => (
                                                <MenuItem
                                                    key={ra.collection.tableName}
                                                    dense
                                                    onClick={() => {
                                                        sideEntityController.open({
                                                            path: ra.collection.collection.slug,
                                                            entityId: ra.entityId,
                                                            collection: ra.collection.collection,
                                                            updateUrl: false
                                                        });
                                                    }}
                                                >
                                                    {t("studio_sql_edit_entity", { name: ra.collection.collection.name, id: String(ra.entityId) })}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </div>
                                );
                            }

                            // Regular data cell
                            const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
                            const value = rowData ? rowData[column.key] : null;
                            const displayValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");

                            if (isEditing) {
                                return (
                                    <div className="absolute inset-x-0 -inset-y-0.5 z-10 bg-surface-50 dark:bg-surface-900 border border-primary dark:border-primary-dark shadow-md overflow-y-auto max-h-[200px] flex px-2 py-1 items-start text-[13px] font-mono">
                                        <VirtualTableInput
                                            error={undefined}
                                            value={displayValue}
                                            multiline={true}
                                            focused={true}
                                            disabled={false}
                                            updateValue={(newValue: string | null) => {
                                                handleCellSave(newValue, rowData, column.key, rowIndex);
                                            }}
                                            onBlur={() => setEditingCell(null)}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <div
                                    className="px-4 py-1.5 h-full flex items-center whitespace-nowrap text-[13px] text-text-primary dark:text-text-primary-dark font-mono cursor-text group/cell"
                                    onDoubleClick={() => handleDoubleClick(rowIndex, column.key, displayValue, rowData)}
                                >
                                    <div className="truncate flex-grow" title={displayValue}>
                                        {displayValue === "" ? <span className="text-text-disabled dark:text-text-disabled-dark italic text-[11px]">NULL</span> : displayValue}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>

                <div className={cls("p-2 px-4 border-t bg-surface-50 dark:bg-surface-900 flex justify-between items-center shrink-0", defaultBorderMixin)}>
                    <div className="flex space-x-4">
                        <div className="flex items-center text-[11px]">
                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">{t("studio_sql_rows")}</span>
                            <span className="font-mono text-text-secondary dark:text-text-secondary-dark">{results.length}</span>
                        </div>
                        <div className="flex items-center text-[11px]">
                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">{t("studio_sql_time")}</span>
                            <span className="font-mono text-text-secondary dark:text-text-secondary-dark">{execTime}ms</span>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center px-2">
                        <Button
                            size="small"
                            variant="text"
                            className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark whitespace-nowrap"
                            onClick={handleExportMarkdown}
                        >
                            {t("studio_sql_copy_markdown")}
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark whitespace-nowrap"
                            onClick={handleExportJSON}
                        >
                            {t("studio_sql_export_json")}
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark whitespace-nowrap"
                            onClick={handleExportCSV}
                        >
                            {t("studio_sql_export_csv")}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("rebase_sql_editor_sidebar_size");
            return saved !== null ? parseFloat(saved) : 20;
        } catch (e) {
            return 20;
        }
    });
    const [editorHeight, setEditorHeight] = useState(() => {
        try {
            const saved = localStorage.getItem("rebase_sql_editor_height");
            return saved !== null ? parseFloat(saved) : 50;
        } catch (e) {
            return 50;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("rebase_sql_editor_sidebar_size", sidebarSize.toString());
        } catch (e) { }
    }, [sidebarSize]);

    useEffect(() => {
        try {
            localStorage.setItem("rebase_sql_editor_height", editorHeight.toString());
        } catch (e) { }
    }, [editorHeight]);

    const activeSnippet = snippets.find(s => s.sql === activeTab.sql);
    const isFavorite = activeSnippet?.isFavorite || false;

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <ResizablePanels
                orientation="horizontal"
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={220}
                firstPanel={
                    <SQLEditorSidebar
                        snippets={snippets}
                        history={history}
                        onSelectSnippet={setSql}
                        onTableClick={setSql}
                        onDeleteSnippet={handleDeleteSnippet}
                        schemas={schemas}
                        isSchemaLoading={isSchemaLoading}
                        schemaError={schemaError}
                        onRetrySchema={fetchSchema}
                    />
                }
                secondPanel={
                    <div className="flex-grow flex flex-col min-w-0 h-full w-full">
                        {/* Toolbar */}
                        <div className={cls("h-[44px] shrink-0 flex items-center justify-between px-4 border-b bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                            <div className="flex items-center flex-grow overflow-hidden mr-4">
                                <div className="flex items-center no-scrollbar overflow-x-auto min-w-0">
                                    <Tabs value={activeTabId} onValueChange={setActiveTabId} variant="invisible">
                                        {tabs.map(tab => (
                                            <Tab key={tab.id} value={tab.id} className="flex items-center justify-between group gap-2">
                                                <span className="truncate">{tab.name}</span>
                                                {tabs.length > 1 && (
                                                    <button
                                                        onClick={(e) => handleCloseTab(tab.id, e)}
                                                        className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </Tab>
                                        ))}
                                    </Tabs>
                                    <IconButton
                                        size="small"
                                        onClick={handleAddTab}
                                        className="ml-1 flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </IconButton>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center justify-end pr-2 gap-1.5">
                                <Tooltip title={t("studio_sql_format_sql")}>
                                    <button onClick={handlePrettify} className="p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    </button>
                                </Tooltip>

                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={handleExplain}
                                    disabled={loading}
                                >
                                    {t("studio_sql_explain")}
                                </Button>

                                <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                                <div className="flex items-center space-x-2 px-2 cursor-pointer" onClick={() => setAutoLimit(!autoLimit)}>
                                    <Typography variant="caption" className="text-[11px] text-text-secondary cursor-pointer select-none">{t("studio_sql_limit_1000")}</Typography>
                                    <input
                                        type="checkbox"
                                        checked={autoLimit}
                                        onChange={(e) => setAutoLimit(e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-3.5 h-3.5 rounded border-surface-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                </div>

                                <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                                <Tooltip title={isFavorite ? t("studio_sql_remove_from_favorites") : t("studio_sql_add_to_favorites")}>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            if (!activeSnippet) {
                                                snackbarController.open({
                                                    type: "info",
                                                    message: t("studio_sql_save_first_to_favorite")
                                                });
                                                return;
                                            }
                                            saveSnippets(snippets.map(s => s.id === activeSnippet.id ? { ...s, isFavorite: !s.isFavorite } : s));
                                        }}
                                    >
                                        <svg className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-text-disabled dark:text-text-disabled-dark hover:text-text-primary'}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    </IconButton>
                                </Tooltip>

                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => setIsSaveDialogOpen(true)}
                                >
                                    {t("studio_sql_save")}
                                </Button>

                                <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                                <Menu
                                    trigger={
                                        <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded border border-transparent mr-2">
                                            <svg className="w-3.5 h-3.5 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                            <span className="max-w-[80px] truncate">{isLoadingConfig ? "..." : (selectedDatabase || t("studio_sql_select_db"))}</span>
                                        </button>
                                    }
                                >
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="px-3 py-1.5 border-b border-surface-200 dark:border-surface-800 mb-1">
                                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-[9px] text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_database")}</Typography>
                                        </div>
                                        {isLoadingConfig ? (
                                            <div className="flex items-center justify-center p-4">
                                                <CircularProgress size="small" />
                                            </div>
                                        ) : connectionConfigError ? (
                                            <div className="px-3 py-2 text-xs text-red-500 dark:text-red-400 max-w-[200px] break-words">
                                                {connectionConfigError}
                                            </div>
                                        ) : (
                                            <>
                                                {availableDatabases.map(db => (
                                                    <MenuItem key={db} dense onClick={() => handleDatabaseChange(db)} className={cls("text-xs", selectedDatabase === db && "text-primary dark:text-primary-dark")}>
                                                        {db}
                                                    </MenuItem>
                                                ))}

                                                <div className="px-3 py-1.5 border-y border-surface-200 dark:border-surface-800 mb-1 mt-1">
                                                    <Typography variant="caption" className="font-bold uppercase tracking-wider text-[9px] text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_role")}</Typography>
                                                </div>
                                                {availableRoles.map(role => (
                                                    <MenuItem key={role} dense onClick={() => handleRoleChange(role)} className={cls("text-xs", selectedRole === role && "text-primary dark:text-primary-dark")}>
                                                        {role}{role === "postgres" ? " " + t("studio_sql_admin") : ""}
                                                    </MenuItem>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </Menu>

                                <Button
                                    onClick={() => handleRun()}
                                    disabled={loading}
                                    size="small"
                                    color="primary"
                                >
                                    {loading ? <CircularProgress size="smallest" className="mr-2" /> : <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                    {t("studio_sql_run")}
                                </Button>
                            </div>
                        </div>

                        <ResizablePanels
                            orientation="vertical"
                            panelSizePercent={editorHeight}
                            onPanelSizeChange={setEditorHeight}
                            minPanelSizePx={100}
                            firstPanel={
                                <div className="h-full w-full relative flex flex-col min-h-0">
                                    <MonacoEditor
                                        value={sql}
                                        onChange={(v) => setSql(v || "")}
                                        onRun={handleRun}
                                        schemas={schemas}
                                    />
                                </div>
                            }
                            secondPanel={
                                <div className="h-full w-full flex flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden min-h-0">
                                    <div className={cls("p-2 px-4 bg-surface-100 dark:bg-surface-900 border-b shrink-0 flex items-center", defaultBorderMixin)}>
                                        <Typography variant="caption" className="font-bold text-text-disabled dark:text-text-disabled-dark uppercase tracking-widest text-[10px]">{t("studio_sql_query_results")}</Typography>
                                    </div>
                                    <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                                        {renderResults()}
                                    </div>
                                </div>
                            }
                        />

                    </div>
                }
            />

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTitle>{t("studio_sql_save_snippet")}</DialogTitle>
                <DialogContent>
                    <div className="py-4 flex flex-col gap-4">
                        <TextField
                            label={t("studio_sql_snippet_name")}
                            autoFocus
                            placeholder={t("studio_sql_snippet_name_placeholder")}
                            value={newSnippetName}
                            onChange={(e) => setNewSnippetName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveSnippet();
                                }
                            }}
                        />
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark block">{t("studio_sql_snippet_saved_local")}</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setIsSaveDialogOpen(false)}>{t("studio_sql_cancel")}</Button>
                    <Button onClick={handleSaveSnippet} color="primary" disabled={!newSnippetName.trim()}>{t("studio_sql_save")}</Button>
                </DialogActions>
            </Dialog>
            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={isConfirmDialogOpen}
                onCancel={() => setIsConfirmDialogOpen(false)}
                title={t("studio_sql_dangerous_operation")}
                body={t("studio_sql_dangerous_operation_body")}
                onAccept={() => {
                    if (pendingAction) pendingAction();
                    setIsConfirmDialogOpen(false);
                }}
            />
        </div>
    );
};
