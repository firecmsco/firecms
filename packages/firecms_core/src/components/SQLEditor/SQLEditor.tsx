import React, { useState, useEffect, useCallback, useRef } from "react";
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
    MenuItem
} from "@firecms/ui";
import { useDataSource, useSnackbarController } from "../../hooks";
import { MonacoEditor } from "./MonacoEditor";
import { SQLEditorSidebar, Snippet } from "./SQLEditorSidebar";
import { VirtualTable, VirtualTableColumn } from "../VirtualTable";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { ExplainVisualizer } from "./ExplainVisualizer";

export interface TableInfo {
    schemaName: string;
    tableName: string;
    columns: string[];
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

const STORAGE_KEY_TABS = "firecms_sql_tabs";
const STORAGE_KEY_ACTIVE_TAB = "firecms_sql_active_tab";

export const SQLEditor = () => {
    const dataSource = useDataSource();
    const snackbarController = useSnackbarController();

    // Schema state
    const [schemas, setSchemas] = useState<Record<string, TableInfo[]>>({});
    const [isSchemaLoading, setIsSchemaLoading] = useState(true);
    const [schemaError, setSchemaError] = useState<string | null>(null);

    // Connection state
    const [selectedRole, setSelectedRole] = useState("postgres");
    const [selectedDatabase, setSelectedDatabase] = useState("default");

    const fetchSchema = useCallback(async () => {
        if (!dataSource.executeSql) {
            setSchemaError("SQL execution not supported by this data source");
            setIsSchemaLoading(false);
            return;
        }

        setIsSchemaLoading(true);
        setSchemaError(null);
        try {
            console.log("Fetching database schema for SQLEditor...");
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
                if (result && typeof result === "object" && "rows" in result && Array.isArray((result as any).rows)) {
                    processGrouped((result as any).rows);
                } else {
                    setSchemaError(`Unexpected data format: ${typeof result}`);
                }
            } else if (result.length === 0) {
                setSchemaError("No tables found in the database.");
            } else {
                processGrouped(result);
            }

        } catch (e: any) {
            console.error("Schema fetch error:", e);
            setSchemaError("Failed to fetch schema: " + (e.message || String(e)));
        } finally {
            setIsSchemaLoading(false);
        }
    }, [dataSource]);

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    // Tabbed interface state
    const [tabs, setTabs] = useState<Array<{
        id: string,
        name: string,
        sql: string,
        results: any[] | null,
        loading: boolean,
        error: string | null,
        execTime: number | null
    }>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_TABS);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((t: any) => ({
                ...t,
                results: null,
                loading: false,
                error: null,
                execTime: null
            }));
        }
        return [{
            id: "1",
            name: "Query 1",
            sql: "SELECT * FROM ",
            results: null,
            loading: false,
            error: null,
            execTime: null
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
    const setResults = (newResults: any[] | null) => updateActiveTab({ results: newResults });
    const setLoading = (newLoading: boolean) => updateActiveTab({ loading: newLoading });
    const setError = (newError: string | null) => updateActiveTab({ error: newError });

    const [autoLimit, setAutoLimit] = useState(true);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const [columnWidths, setColumnWidths] = useState<Record<string, Record<string, number>>>(() => {
        const saved = localStorage.getItem("firecms_sql_column_widths");
        return saved ? JSON.parse(saved) : {};
    });
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [newSnippetName, setNewSnippetName] = useState("");

    // Load from local storage
    useEffect(() => {
        const savedSnippets = localStorage.getItem("firecms_sql_snippets");
        if (savedSnippets) setSnippets(JSON.parse(savedSnippets));

        const savedHistory = localStorage.getItem("firecms_sql_history");
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
        localStorage.setItem("firecms_sql_snippets", JSON.stringify(newSnippets));
    };

    const saveHistory = (newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem("firecms_sql_history", JSON.stringify(newHistory.slice(-50)));
    };

    const handleDeleteSnippet = (id: string) => {
        saveSnippets(snippets.filter(s => s.id !== id));
    };

    const handleAddTab = () => {
        const newId = Math.random().toString(36).substr(2, 9);

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
            execTime: null
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
            localStorage.setItem("firecms_sql_column_widths", JSON.stringify(newWidths));
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
                const result = await dataSource.executeSql(explainSql);
                updateActiveTab({ results: result, execTime: Math.round(performance.now() - start) });
            }
        } catch (e: any) {
            updateActiveTab({ error: e.message || "An error occurred while explaining the query." });
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
                const result = await dataSource.executeSql(sqlToRun);
                updateActiveTab({ results: result, execTime: Math.round(performance.now() - start) });

                if (history[history.length - 1] !== activeTab.sql) {
                    saveHistory([...history, activeTab.sql]);
                }
            } else {
                updateActiveTab({ error: "SQL execution is not supported by the current data source." });
            }
        } catch (e: any) {
            updateActiveTab({ error: e.message || "An error occurred while executing the query." });
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
            id: Math.random().toString(36).substr(2, 9),
            name: newSnippetName,
            sql: sql,
            createdAt: Date.now()
        };

        saveSnippets([...snippets, newSnippet]);
        setNewSnippetName("");
        setIsSaveDialogOpen(false);
        snackbarController.open({
            type: "success",
            message: `Snippet "${newSnippetName}" saved.`
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
                message: "Results copied as Markdown!"
            });
        }).catch(() => {
            snackbarController.open({
                type: "error",
                message: "Failed to copy Markdown to clipboard."
            });
        });
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <CircularProgress size="medium" />
                        <Typography variant="body2" className="mt-4 text-text-secondary dark:text-text-secondary-dark font-mono tracking-tight animate-pulse">EXECUTING QUERY...</Typography>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-grow p-6 overflow-auto">
                    <Alert color="error">
                        <Typography variant="body2" className="font-mono text-xs whitespace-pre-wrap">{error}</Typography>
                    </Alert>
                </div>
            );
        }

        if (!results) {
            return (
                <div className="flex-grow flex items-center justify-center text-text-disabled dark:text-text-disabled-dark">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        <Typography variant="body2">Run a query to see results</Typography>
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
                            <Typography variant="caption" className="font-bold text-text-secondary mb-4 tracking-wider uppercase">Visual Execution Plan</Typography>
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
                    <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark font-mono border-b border-surface-200 dark:border-surface-800 pb-2 mb-2">SUCCESS</Typography>
                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">Query executed successfully but returned no results.</Typography>
                </div>
            );
        }

        const savedWidths = columnWidths[activeTab.sql] || {};
        const columns: VirtualTableColumn[] = Object.keys(results[0]).map(key => ({
            key,
            title: key,
            width: savedWidths[key] ?? 150,
            sortable: false,
            resizable: true
        }));

        return (
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow">
                    <VirtualTable
                        data={results}
                        columns={columns}
                        rowHeight={32}
                        headerHeight={32}
                        onColumnResizeEnd={handleColumnResize}
                        cellRenderer={({ rowData, column }) => {
                            const value = rowData ? rowData[column.key] : null;
                            const displayValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
                            return (
                                <div className="px-4 py-1.5 h-full flex items-center whitespace-nowrap text-[13px] text-text-primary dark:text-text-primary-dark font-mono">
                                    <div className="truncate" title={displayValue}>
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
                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">Rows:</span>
                            <span className="font-mono text-text-secondary dark:text-text-secondary-dark">{results.length}</span>
                        </div>
                        <div className="flex items-center text-[11px]">
                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">Time:</span>
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
                            Copy Markdown
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark whitespace-nowrap"
                            onClick={handleExportJSON}
                        >
                            Export JSON
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark whitespace-nowrap"
                            onClick={handleExportCSV}
                        >
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const activeSnippet = snippets.find(s => s.sql === activeTab.sql);
    const isFavorite = activeSnippet?.isFavorite || false;

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <SQLEditorSidebar
                snippets={snippets}
                history={history}
                onSelectSnippet={setSql}
                onTableClick={(tableName) => setSql(`SELECT * FROM ${tableName} LIMIT 100;`)}
                onDeleteSnippet={handleDeleteSnippet}
                schemas={schemas}
                isSchemaLoading={isSchemaLoading}
                schemaError={schemaError}
                onRetrySchema={fetchSchema}
            />

            {/* Main Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Toolbar */}
                <div className={cls("h-[44px] shrink-0 flex items-center justify-between px-4 border-b bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                    <div className="flex items-center flex-grow overflow-hidden mr-4">
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
                            className="ml-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </IconButton>
                    </div>
                    <div className="flex shrink-0 items-center justify-end">
                        <Tooltip title="Format SQL">
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
                            Explain
                        </Button>

                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                        <div className="flex items-center space-x-2 px-4 cursor-pointer" onClick={() => setAutoLimit(!autoLimit)}>
                            <Typography variant="caption" className="text-text-secondary cursor-pointer select-none">Limit 1000</Typography>
                            <input
                                type="checkbox"
                                checked={autoLimit}
                                onChange={(e) => setAutoLimit(e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 rounded border-surface-300 text-primary focus:ring-primary cursor-pointer"
                            />
                        </div>

                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                        <Tooltip title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    if (!activeSnippet) {
                                        snackbarController.open({
                                            type: "info",
                                            message: "Please save the snippet first before favoriting."
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
                            Save
                        </Button>

                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

                        <div className="flex items-center space-x-2 pl-3">
                            <Select
                                value={selectedDatabase}
                                onValueChange={setSelectedDatabase as any}
                                size="small"
                                position="popper"
                            >
                                <SelectItem value="default">Database (Default)</SelectItem>
                            </Select>

                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole as any}
                                size="small"
                                position="popper"
                                renderValue={(val) => `Role: ${val}`}
                            >
                                <SelectItem value="postgres">postgres (Admin)</SelectItem>
                                <SelectItem value="authenticated">authenticated</SelectItem>
                                <SelectItem value="anon">anon</SelectItem>
                            </Select>

                            <Button
                                onClick={() => handleRun()}
                                disabled={loading}
                                size="small"
                                color="primary"
                            >
                                {loading ? <CircularProgress size="smallest" className="mr-2" /> : <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                Run
                            </Button>
                        </div>
                    </div>
                </div>     {/* Editor Area */}
                <div className="h-1/2 shrink-0 relative flex flex-col">
                    <MonacoEditor
                        value={sql}
                        onChange={(v) => setSql(v || "")}
                        onRun={handleRun}
                        schemas={schemas}
                    />
                </div>

                {/* Results Area */}
                <div className={cls("flex-grow flex flex-col border-t overflow-hidden", defaultBorderMixin)}>
                    <div className={cls("p-3 px-6 bg-surface-50 dark:bg-surface-900 border-b shrink-0 flex items-center", defaultBorderMixin)}>
                        <Typography variant="caption" className="font-bold text-text-disabled dark:text-text-disabled-dark uppercase tracking-widest text-[10px]">Query Results</Typography>
                    </div>
                    {renderResults()}
                </div>
            </div>

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTitle>Save SQL Snippet</DialogTitle>
                <DialogContent>
                    <div className="py-4 flex flex-col gap-4">
                        <TextField
                            label="Snippet Name"
                            autoFocus
                            placeholder="e.g., Get All Users"
                            value={newSnippetName}
                            onChange={(e) => setNewSnippetName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveSnippet();
                                }
                            }}
                        />
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark block">This will be saved to your local storage.</Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveSnippet} color="primary" disabled={!newSnippetName.trim()}>Save</Button>
                </DialogActions>
            </Dialog>
            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={isConfirmDialogOpen}
                onCancel={() => setIsConfirmDialogOpen(false)}
                title="Dangerous Operation Detected"
                body="The query you are about to run contains potentially destructive operations (DELETE, DROP, TRUNCATE, or UPDATE without WHERE). Are you sure you want to proceed?"
                onAccept={() => {
                    if (pendingAction) pendingAction();
                    setIsConfirmDialogOpen(false);
                }}
            />
        </div >
    );
};
