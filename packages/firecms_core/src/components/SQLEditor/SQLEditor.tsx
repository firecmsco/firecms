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
    Tooltip
} from "@firecms/ui";
import { useDataSource, useSnackbarController } from "../../hooks";
import { MonacoEditor } from "./MonacoEditor";
import { SQLEditorSidebar, Snippet } from "./SQLEditorSidebar";

export const SQLEditor = () => {
    const dataSource = useDataSource();
    const snackbarController = useSnackbarController();

    const [sql, setSql] = useState<string>("SELECT * FROM ");
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [execTime, setExecTime] = useState<number | null>(null);

    // UI state
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

    const saveSnippets = (newSnippets: Snippet[]) => {
        setSnippets(newSnippets);
        localStorage.setItem("firecms_sql_snippets", JSON.stringify(newSnippets));
    };

    const saveHistory = (newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem("firecms_sql_history", JSON.stringify(newHistory.slice(-50)));
    };

    const handleRun = useCallback(async () => {
        if (!sql.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);
        const start = performance.now();

        try {
            if (dataSource.executeSql) {
                const result = await dataSource.executeSql(sql);
                setResults(result);
                setExecTime(Math.round(performance.now() - start));

                // Add to history if not already most recent
                if (history[history.length - 1] !== sql) {
                    saveHistory([...history, sql]);
                }
            } else {
                setError("SQL execution is not supported by the current data source.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while executing the query.");
        } finally {
            setLoading(false);
        }
    }, [sql, dataSource.executeSql, history]);

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

    const handleDeleteSnippet = (id: string) => {
        saveSnippets(snippets.filter(s => s.id !== id));
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
                    <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-md">
                        <Typography color="error" className="font-mono text-sm whitespace-pre-wrap">{error}</Typography>
                    </div>
                </div>
            );
        }

        if (!results) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center max-w-sm px-6">
                        <svg className="w-12 h-12 mx-auto text-surface-400 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark font-medium">Ready to execute.</Typography>
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark mt-2 block italic">Press Cmd + Enter to run your query</Typography>
                    </div>
                </div>
            );
        }

        if (results.length === 0) {
            return (
                <div className="flex-grow p-6 flex flex-col items-center justify-center">
                    <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark font-mono border-b border-surface-200 dark:border-surface-800 pb-2 mb-2">SUCCESS</Typography>
                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">Query executed successfully but returned no results.</Typography>
                </div>
            );
        }

        const columns = Object.keys(results[0]);

        return (
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-auto no-scrollbar">
                    <table className="min-w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-surface-950">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-2 text-left text-[11px] font-bold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider border-b border-r border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                            {results.map((row, i) => (
                                <tr key={i} className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                                    {columns.map((col) => {
                                        const value = row[col];
                                        const displayValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
                                        return (
                                            <td key={col} className="px-4 py-1.5 whitespace-nowrap text-[13px] text-text-primary dark:text-text-primary-dark font-mono border-r border-surface-200/50 dark:border-surface-800/50">
                                                <div className="max-w-[300px] truncate" title={displayValue}>
                                                    {displayValue === "" ? <span className="text-text-disabled dark:text-text-disabled-dark italic text-[11px]">NULL</span> : displayValue}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-2 px-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 flex justify-between items-center shrink-0">
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
                    <Button
                        size="small"
                        variant="text"
                        className="text-[10px] uppercase font-bold text-text-secondary dark:text-text-secondary-dark"
                        onClick={handleExportCSV}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            {/* Sidebar */}
            <SQLEditorSidebar
                snippets={snippets}
                history={history}
                onSelectSnippet={setSql}
                onTableClick={(tableName) => setSql(`SELECT * FROM ${tableName} LIMIT 100;`)}
                onDeleteSnippet={handleDeleteSnippet}
            />

            {/* Main Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
                    <div className="flex items-center">
                        <Typography variant="subtitle2" className="mr-2">SQL Editor</Typography>
                        <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-2"></div>
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark font-mono text-[11px] ml-2">New Query.sql</Typography>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="text"
                            onClick={() => setIsSaveDialogOpen(true)}
                        >
                            Save Snippet
                        </Button>
                        <Button
                            onClick={handleRun}
                            disabled={loading}
                            color="primary"
                        >
                            {loading ? <CircularProgress size="smallest" className="mr-2" /> : <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                            Run
                        </Button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="h-1/2 shrink-0 relative flex flex-col">
                    <MonacoEditor
                        value={sql}
                        onChange={(v) => setSql(v || "")}
                        onRun={handleRun}
                    />
                </div>

                {/* Results Area */}
                <div className="flex-grow flex flex-col border-t border-surface-200 dark:border-surface-800 overflow-hidden">
                    <div className="p-3 px-6 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 shrink-0 flex items-center">
                        <Typography variant="caption" className="font-bold text-text-disabled dark:text-text-disabled-dark uppercase tracking-widest text-[10px]">Query Results</Typography>
                    </div>
                    {renderResults()}
                </div>
            </div>

            {/* Save Dialog */}
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent>
                    <DialogTitle>Save SQL Snippet</DialogTitle>
                    <div className="py-4 space-y-4">
                        <TextField
                            label="Snippet Name"
                            autoFocus
                            placeholder="e.g., Get All Users"
                            value={newSnippetName}
                            onChange={(e) => setNewSnippetName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSaveSnippet();
                            }}
                        />
                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark block">This will be saved to your local storage.</Typography>
                    </div>
                    <DialogActions>
                        <Button variant="text" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                        <Button color="primary" onClick={handleSaveSnippet} disabled={!newSnippetName.trim()}>Save Snippet</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </div >
    );
};
