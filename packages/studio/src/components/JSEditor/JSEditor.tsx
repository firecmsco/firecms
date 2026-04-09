import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Highlight, themes } from "prism-react-renderer";
import {
    Button,
    Typography,
    CircularProgress,
    cls,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    TextField,
    Tooltip,
    defaultBorderMixin,
    ResizablePanels,
    Chip,
    Menu,
    MenuItem,
    Tabs,
    Tab,
    TerminalIcon,
    CloseIcon,
    AddIcon,
    SaveIcon,
    DownloadIcon,
    PlayArrowIcon,
    MoreVertIcon,
    EditIcon,
    VirtualTable,
    VirtualTableColumn,
    CellRendererParams,
} from "@rebasepro/ui";
import { useUrlController, useCollectionRegistryController, useSideEntityController } from "@rebasepro/cms";
import { useRebaseContext, useSnackbarController, useApiConfig, useTranslation, useModeController, ErrorView, UserSelectPopover, SelectableUser, IconForView } from "@rebasepro/core";
import { EntityCollection } from "@rebasepro/types";
import { createRebaseClient } from "@rebasepro/client";
import { JSMonacoEditor } from "./JSMonacoEditor";
import { JSEditorSidebar, JSSnippet } from "./JSEditorSidebar";

// ─── Types ───────────────────────────────────────────────────────────

interface ConsoleEntry {
    type: "log" | "warn" | "error" | "info";
    args: any[];
    timestamp: number;
}

interface ExecutionResult {
    value: any;
    console: ConsoleEntry[];
    duration: number;
    error?: string;
    timestamp: number;
}

interface EditorTab {
    id: string;
    name: string;
    code: string;
}

// SelectedUser is now SelectableUser from @rebasepro/core

// ─── Constants ───────────────────────────────────────────────────────

const STORAGE_PREFIX = "rebase_js_";
const MAX_HISTORY = 50;

const DEFAULT_CODE = `// Available: client (RebaseClient)
// Press Cmd+Enter (Ctrl+Enter) to run
//
// Examples:
//   const result = await client.data.collection("your_collection").find({ limit: 10 });
//   const users = await client.admin.listUsers();
//   const session = client.auth.getSession();

const result = await client.data.collection("your_collection").find({ limit: 10 });
return result;
`;

// ─── Helpers ─────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage<T>(key: string, value: T) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch { /* quota */ }
}

function formatJSON(value: any): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

// ─── Helpers: Collection matching for JS results ────────────────────

interface MatchedJSCollection {
    collectionSlug: string;
    collection: EntityCollection;
    pkColumn: string;
}

/**
 * Slugs may be camelCase or kebab-case while table/slug data may also be snake_case.
 * Normalise to lowercase with underscores for comparison.
 */
function normaliseSlug(slug: string): string {
    return slug
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();
}

/**
 * Given the raw SDK result, try to detect which collections are present.
 * JS SDK results typically come back as `{ data: [{ id, values }] }` or plain arrays.
 * The heuristic: if the executed code contains `collection("<slug>")` or `client.data.<slug>`,
 * and the result has rows with an "id" column, we match those slugs.
 */
function detectCollectionsInResult(
    code: string,
    resultValue: any,
    collections: EntityCollection[]
): MatchedJSCollection[] {
    if (!resultValue || !collections?.length) return [];

    // Extract collection slugs mentioned in the code
    const mentionedSlugs = new Set<string>();

    // Match: collection("slug") or collection('slug')
    const collectionCallRegex = /\.collection\(["']([^"']+)["']\)/g;
    let m: RegExpExecArray | null;
    while ((m = collectionCallRegex.exec(code)) !== null) {
        mentionedSlugs.add(m[1]);
    }

    // Match: client.data.<slug>. (dot-access pattern)
    const dotAccessRegex = /client\.data\.([a-zA-Z_][a-zA-Z0-9_]*)\./g;
    while ((m = dotAccessRegex.exec(code)) !== null) {
        if (!["collection", "find", "findById", "create", "update", "delete"].includes(m[1])) {
            mentionedSlugs.add(m[1]);
        }
    }

    if (mentionedSlugs.size === 0) return [];

    // Check if result has rows with an "id" field
    let rows: any[] = [];
    if (resultValue?.data && Array.isArray(resultValue.data)) {
        rows = resultValue.data;
    } else if (Array.isArray(resultValue)) {
        rows = resultValue;
    }

    const hasId = rows.length > 0 && rows.some(r => r?.id != null);
    if (!hasId) return [];

    const matched: MatchedJSCollection[] = [];
    for (const slug of mentionedSlugs) {
        const normalised = normaliseSlug(slug);
        const col = collections.find(c => {
            const dbPath = c.dbPath || normaliseSlug(c.slug);
            return c.slug === slug || dbPath === normalised || normaliseSlug(c.slug) === normalised;
        });
        if (col) {
            matched.push({
                collectionSlug: col.slug,
                collection: col,
                pkColumn: "id",
            });
        }
    }

    return matched;
}

// ─── Main Component ─────────────────────────────────────────────────

export function JSEditor() {
    // Contexts
    const rebaseContext = useRebaseContext();
    const apiConfig = useApiConfig();
    const snackbar = useSnackbarController();
    const collectionRegistry = useCollectionRegistryController();
    const sideEntityController = useSideEntityController();
    const { t } = useTranslation();

    // User management for the "Run as" picker
    const userManagement = rebaseContext.userManagement;
    const currentUser = rebaseContext.authController?.user;

    // State
    const [tabs, setTabs] = useState<EditorTab[]>(() =>
        loadFromStorage("tabs", [{ id: "1", name: "Script 1", code: DEFAULT_CODE }])
    );
    const [activeTabId, setActiveTabId] = useState<string>(() =>
        loadFromStorage("activeTab", "1")
    );
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [snippets, setSnippets] = useState<JSSnippet[]>(() =>
        loadFromStorage("snippets", [])
    );
    const [history, setHistory] = useState<string[]>(() =>
        loadFromStorage("history", [])
    );
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [snippetName, setSnippetName] = useState("");
    const [resultView, setResultView] = useState<"json" | "table" | "console">("json");

    // "Run as" user state — null means "self" (current admin)
    const [selectedUser, setSelectedUser] = useState<SelectableUser | null>(null);

    const [sidebarSize, setSidebarSize] = useState<number>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_PREFIX + "sidebar_size");
            return stored ? Number(stored) : 18;
        } catch { return 18; }
    });
    const [editorHeight, setEditorHeight] = useState<number>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_PREFIX + "editor_height");
            return stored ? Number(stored) : 55;
        } catch { return 55; }
    });

    // Derived
    const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

    // Collection info for the sidebar and Monaco
    const collectionInfos = useMemo(() => {
        const collections = collectionRegistry?.collections ?? [];
        return collections.map(col => ({
            slug: col.slug,
            name: col.name,
            properties: Object.keys(col.properties ?? {}),
        }));
    }, [collectionRegistry?.collections]);

    const collectionSlugs = useMemo(() => collectionInfos.map(c => c.slug), [collectionInfos]);

    // Users list for the picker — mapped to SelectableUser shape
    const users = useMemo((): SelectableUser[] => {
        const managed = (userManagement?.users ?? []).map(u => ({
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            roles: u.roles,
        }));
        // Ensure the current user is in the list
        if (currentUser && !managed.some(u => u.uid === currentUser.uid)) {
            managed.unshift({
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                roles: currentUser.roles,
            });
        }
        return managed;
    }, [userManagement?.users, currentUser]);

    // Current user as SelectableUser for the popover
    const currentSelectableUser = useMemo((): SelectableUser | null => {
        if (!currentUser) return null;
        return {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            roles: currentUser.roles,
        };
    }, [currentUser]);

    // ─── Persistence ─────────────────────────────────────────────

    useEffect(() => { saveToStorage("tabs", tabs); }, [tabs]);
    useEffect(() => { saveToStorage("activeTab", activeTabId); }, [activeTabId]);
    useEffect(() => { saveToStorage("snippets", snippets); }, [snippets]);
    useEffect(() => { saveToStorage("history", history); }, [history]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_PREFIX + "sidebar_size", sidebarSize.toString()); } catch { }
    }, [sidebarSize]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_PREFIX + "editor_height", editorHeight.toString()); } catch { }
    }, [editorHeight]);

    // ─── Tab management ──────────────────────────────────────────

    const updateActiveCode = useCallback((code: string | undefined) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: code ?? "" } : t));
    }, [activeTabId]);

    const addTab = useCallback(() => {
        const id = String(Date.now());
        const newTab: EditorTab = { id, name: `Script ${tabs.length + 1}`, code: DEFAULT_CODE };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(id);
    }, [tabs.length]);

    const closeTab = useCallback((tabId: string) => {
        setTabs(prev => {
            const filtered = prev.filter(t => t.id !== tabId);
            if (filtered.length === 0) {
                const fresh = { id: String(Date.now()), name: "Script 1", code: DEFAULT_CODE };
                setActiveTabId(fresh.id);
                return [fresh];
            }
            if (activeTabId === tabId) {
                setActiveTabId(filtered[filtered.length - 1].id);
            }
            return filtered;
        });
    }, [activeTabId]);

    // ─── Create an authenticated client for execution ────────────

    const buildClient = useCallback(async () => {
        const apiUrl = apiConfig?.apiUrl;
        const getAuthToken = apiConfig?.getAuthToken;

        if (!apiUrl) {
            throw new Error("API URL not configured. Make sure apiUrl is set.");
        }

        // Get the current auth token
        let token: string | undefined;
        if (getAuthToken) {
            token = (await getAuthToken()) ?? undefined;
        }

        if (!token) {
            throw new Error("No auth token available. Please sign in first.");
        }

        // Create a fresh client with the token
        const client = createRebaseClient({
            baseUrl: apiUrl,
            token,
        });

        return client;
    }, [apiConfig]);

    // ─── Execution engine ────────────────────────────────────────

    const executeCode = useCallback(async (codeOverride?: string) => {
        const code = codeOverride ?? activeTab?.code ?? "";
        if (!code.trim()) return;

        setIsRunning(true);
        setResult(null);

        // Add to history
        setHistory(prev => {
            const deduped = prev.filter(h => h !== code);
            return [...deduped, code].slice(-MAX_HISTORY);
        });

        const consoleEntries: ConsoleEntry[] = [];
        const startTime = performance.now();

        // Capture console methods
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
        };

        const captureConsole = (type: ConsoleEntry["type"]) => (...args: any[]) => {
            consoleEntries.push({ type, args, timestamp: Date.now() });
            originalConsole[type](...args);
        };

        try {
            console.log = captureConsole("log");
            console.warn = captureConsole("warn");
            console.error = captureConsole("error");
            console.info = captureConsole("info");

            // Build an authenticated client
            const client = await buildClient();

            // Build context object with useful info about selected user
            const context = {
                user: selectedUser ?? (currentUser ? {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    roles: currentUser.roles,
                } : null),
                collections: collectionInfos,
            };

            // Create async function with `client` and `context` injected
            // eslint-disable-next-line no-new-func
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const fn = new AsyncFunction("client", "context", code);

            const value = await fn(client, context);
            const duration = performance.now() - startTime;

            setResult({
                value,
                console: consoleEntries,
                duration,
                timestamp: Date.now(),
            });

            // Auto-detect best view
            if (value?.data && Array.isArray(value.data)) {
                setResultView("table");
            } else if (consoleEntries.length > 0 && value === undefined) {
                setResultView("console");
            } else {
                setResultView("json");
            }
        } catch (err: any) {
            const duration = performance.now() - startTime;
            setResult({
                value: undefined,
                console: consoleEntries,
                duration,
                error: err?.message || String(err),
                timestamp: Date.now(),
            });
            setResultView("json");
        } finally {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.info = originalConsole.info;
            setIsRunning(false);
        }
    }, [activeTab?.code, buildClient, selectedUser, currentUser, collectionInfos]);

    // ─── Snippet management ──────────────────────────────────────

    const saveSnippet = useCallback(() => {
        if (!snippetName.trim() || !activeTab?.code.trim()) return;
        const snippet: JSSnippet = {
            id: String(Date.now()),
            name: snippetName.trim(),
            code: activeTab.code,
            createdAt: Date.now(),
        };
        setSnippets(prev => [snippet, ...prev]);
        setShowSaveDialog(false);
        setSnippetName("");
        snackbar.open({ type: "success", message: "Snippet saved" });
    }, [snippetName, activeTab?.code, snackbar]);

    const deleteSnippet = useCallback((id: string) => {
        setSnippets(prev => prev.filter(s => s.id !== id));
    }, []);

    // ─── Export ──────────────────────────────────────────────────

    const exportResult = useCallback(() => {
        if (!result?.value) return;
        const blob = new Blob([formatJSON(result.value)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rebase-result-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [result]);

    // ─── Table columns for array data ────────────────────────────

    const tableData = useMemo(() => {
        if (!result?.value) return { columns: [] as VirtualTableColumn[], data: [] as Record<string, unknown>[] };

        let rows: any[] = [];
        if (result.value?.data && Array.isArray(result.value.data)) {
            rows = result.value.data.map((entity: any) => ({
                id: entity.id,
                ...entity.values,
                ...(entity.values ? {} : entity),
            }));
        } else if (Array.isArray(result.value)) {
            rows = result.value;
        }

        if (rows.length === 0) return { columns: [] as VirtualTableColumn[], data: [] as Record<string, unknown>[] };

        const keys = new Set<string>();
        rows.slice(0, 20).forEach(row => {
            if (row && typeof row === "object") {
                Object.keys(row).forEach(k => keys.add(k));
            }
        });

        const columns: VirtualTableColumn[] = Array.from(keys).map(key => ({
            key,
            title: key,
            width: key === "id" ? 100 : 200,
        }));

        return { columns, data: rows };
    }, [result]);

    // ─── Matched collections for entity actions ──────────────────

    const matchedCollections = useMemo(() => {
        if (!result?.value || result.error) return [];
        return detectCollectionsInResult(
            activeTab?.code ?? "",
            result.value,
            collectionRegistry?.collections ?? []
        );
    }, [result, activeTab?.code, collectionRegistry?.collections]);

    const getRowEntityActions = useCallback((rowData: any): { collection: MatchedJSCollection; entityId: string | number }[] => {
        if (!rowData || matchedCollections.length === 0) return [];
        return matchedCollections
            .filter(mc => rowData[mc.pkColumn] != null)
            .map(mc => ({
                collection: mc,
                entityId: rowData[mc.pkColumn],
            }));
    }, [matchedCollections]);

    // ─── Export handlers ─────────────────────────────────────────

    const handleExportCSV = useCallback(() => {
        if (tableData.data.length === 0) return;
        const headers = tableData.columns.map(c => c.key).join(",");
        const rows = tableData.data.map(row =>
            tableData.columns.map(c => {
                const val = row[c.key];
                const str = val === null || val === undefined ? "" : String(val);
                return str.includes(",") ? `"${str}"` : str;
            }).join(",")
        );
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `js_results_${new Date().toISOString().slice(0, 19)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [tableData]);

    const handleExportMarkdown = useCallback(() => {
        if (tableData.data.length === 0) return;
        const headers = tableData.columns.map(c => c.key);
        const headerRow = `| ${headers.join(" | ")} |`;
        const dividerRow = `| ${headers.map(() => "---").join(" | ")} |`;
        const dataRows = tableData.data.map(row =>
            `| ${headers.map(h => {
                const val = row[h];
                if (val === null || val === undefined) return "";
                return String(val).replace(/\|/g, "\\|").replace(/\n/g, " ");
            }).join(" | ")} |`
        );
        const markdown = [headerRow, dividerRow, ...dataRows].join("\n");
        navigator.clipboard.writeText(markdown).then(() => {
            snackbar.open({ type: "success", message: t("studio_sql_markdown_copied") });
        }).catch(() => {
            snackbar.open({ type: "error", message: t("studio_sql_markdown_copy_failed") });
        });
    }, [tableData, snackbar, t]);

    // ─── Render ──────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full w-full">
            {/* Main content */}
            <div className="flex-grow overflow-hidden">
                <ResizablePanels
                    orientation="horizontal"
                    panelSizePercent={sidebarSize}
                    onPanelSizeChange={setSidebarSize}
                    minPanelSizePx={200}
                    firstPanel={
                        <JSEditorSidebar
                            collections={collectionInfos}
                            snippets={snippets}
                            history={history}
                            onSelectSnippet={(code) => updateActiveCode(code)}
                            onDeleteSnippet={deleteSnippet}
                            onInsertCode={(code) => updateActiveCode(code)}
                        />
                    }
                    secondPanel={
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Toolbar: matching SQL Editor layout */}
                            <div className={cls("flex items-center justify-between pr-2 border-b bg-white dark:bg-surface-950", defaultBorderMixin)}>
                                <div className="flex items-center flex-grow overflow-hidden mr-4">
                                    <div className="flex items-center no-scrollbar overflow-x-auto min-w-0">
                                        <Tabs value={activeTabId} onValueChange={setActiveTabId} variant="boxy" className="w-[unset] flex-shrink-0" innerClassName="bg-white dark:bg-surface-950">
                                            {tabs.map(tab => (
                                                <Tab key={tab.id} value={tab.id} className="flex items-center justify-between group max-w-[200px]">
                                                    <TerminalIcon size="smallest" className="text-amber-500 mr-1.5 flex-shrink-0" />
                                                    <span className="truncate">{tab.name}</span>
                                                    {tabs.length > 1 && (
                                                        <IconButton
                                                            size="smallest"
                                                            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                                            className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                                        >
                                                            <CloseIcon size="smallest" />
                                                        </IconButton>
                                                    )}
                                                </Tab>
                                            ))}
                                        </Tabs>
                                        <IconButton
                                            size="small"
                                            onClick={addTab}
                                            className="ml-2 flex-shrink-0"
                                        >
                                            <AddIcon size="small" />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center justify-end gap-1.5">
                                    {/* "Run as" user picker */}
                                    <UserSelectPopover
                                        selectedUser={selectedUser}
                                        onUserSelected={setSelectedUser}
                                        users={users}
                                        loading={userManagement?.loading}
                                        currentUser={currentSelectableUser}
                                        className="mr-2"
                                    />

                                    <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1" />

                                    <Tooltip title="Save as snippet">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSnippetName("");
                                                setShowSaveDialog(true);
                                            }}
                                            disabled={!activeTab?.code.trim()}
                                        >
                                            <SaveIcon size="small" />
                                        </IconButton>
                                    </Tooltip>

                                    {result?.value && (
                                        <Tooltip title="Export result as JSON">
                                            <IconButton size="small" onClick={exportResult}>
                                                <DownloadIcon size="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    <Button
                                        size="small"
                                        color="primary"
                                        disabled={isRunning || !activeTab?.code.trim()}
                                        onClick={() => executeCode()}
                                    >
                                        {isRunning ? <CircularProgress size="smallest" className="mr-2" /> : <PlayArrowIcon size="small" className="mr-2" />}
                                        Run
                                    </Button>
                                </div>
                            </div>

                            {/* Editor + Results split */}
                            <div className="flex-grow overflow-hidden">
                                <ResizablePanels
                                    orientation="vertical"
                                    panelSizePercent={editorHeight}
                                    onPanelSizeChange={setEditorHeight}
                                    minPanelSizePx={100}
                                    firstPanel={
                                        <div className="h-full w-full overflow-hidden">
                                            <JSMonacoEditor
                                                value={activeTab?.code ?? ""}
                                                onChange={updateActiveCode}
                                                onRun={(selectedText) => executeCode(selectedText)}
                                                collectionSlugs={collectionSlugs}
                                                collections={collectionInfos}
                                                autoFocus
                                            />
                                        </div>
                                    }
                                    secondPanel={
                                        <div className="h-full w-full flex flex-col bg-surface-50 dark:bg-surface-950 overflow-hidden min-h-0">
                                            {/* Result header — matches SQL editor */}
                                            <div className={cls("p-2 px-4 bg-surface-100 dark:bg-surface-900 border-b shrink-0 flex items-center", defaultBorderMixin)}>
                                                <Typography variant="caption" className="font-bold text-text-disabled dark:text-text-disabled-dark uppercase tracking-widest text-[10px]">
                                                    {t("studio_sql_query_results")}
                                                </Typography>

                                                {result && (
                                                    <>
                                                        <div className="flex-grow" />

                                                        <Tabs value={resultView} onValueChange={(val) => setResultView(val as "json" | "table" | "console")} variant="pill" className="w-[unset] mr-2">
                                                            <Tab value="json">JSON</Tab>
                                                            {tableData.data.length > 0 && <Tab value="table">Table</Tab>}
                                                            {result.console.length > 0 && <Tab value="console">Console ({result.console.length})</Tab>}
                                                        </Tabs>

                                                        <Chip size="smallest" colorScheme={result.error ? "redDarker" : "greenDarker"}>
                                                            {result.error ? "Error" : `${result.duration.toFixed(0)}ms`}
                                                        </Chip>
                                                    </>
                                                )}
                                            </div>

                                            {/* Result content */}
                                            <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                                                {isRunning && (
                                                    <div className="flex-grow flex items-center justify-center">
                                                        <div className="text-center">
                                                            <CircularProgress size="medium" />
                                                            <Typography variant="body2" className="mt-4 text-text-secondary dark:text-text-secondary-dark font-mono tracking-tight animate-pulse">
                                                                EXECUTING SCRIPT...
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isRunning && !result && (
                                                    <div className="flex-grow flex items-center justify-center text-text-disabled dark:text-text-disabled-dark">
                                                        <div className="text-center">
                                                            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <Typography variant="body2">Write JavaScript and press <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-[11px] font-mono">⌘ Enter</kbd> to run</Typography>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isRunning && result?.error && (
                                                    <div className="flex-grow flex items-center justify-center p-6 overflow-auto">
                                                        <ErrorView
                                                            title="Execution Error"
                                                            error={result.error}
                                                        />
                                                    </div>
                                                )}

                                                {!isRunning && result && !result.error && resultView === "json" && (
                                                    <pre className="flex-grow overflow-auto p-4 text-[13px] font-mono leading-relaxed text-text-primary dark:text-text-primary-dark whitespace-pre-wrap break-words">
                                                        {result.value === undefined ? (
                                                            <span className="text-text-disabled italic">undefined (no return value)</span>
                                                        ) : (
                                                            <JSONHighlight value={result.value} />
                                                        )}
                                                    </pre>
                                                )}

                                                {!isRunning && result && !result.error && resultView === "table" && tableData.data.length > 0 && (
                                                    <div className="flex-grow flex flex-col overflow-hidden min-h-0">
                                                        {/* Collection badges bar — matching SQL editor */}
                                                        {matchedCollections.length > 0 && (
                                                            <div className={cls("px-4 py-1.5 border-b flex items-center gap-2 shrink-0 bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                                                <Tooltip title={t("studio_sql_cms_collections_tooltip")}>
                                                                    <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-widest text-text-disabled dark:text-text-disabled-dark mr-1 shrink-0 cursor-help">{t("studio_sql_cms")}</Typography>
                                                                </Tooltip>
                                                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                                                    {matchedCollections.map(mc => (
                                                                        <Tooltip key={mc.collectionSlug} title={`${mc.collection.name} (${mc.collectionSlug})`}>
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
                                                        <div className="flex-grow relative h-full min-h-0 min-w-0">
                                                            <VirtualTable
                                                                data={tableData.data}
                                                                columns={
                                                                    matchedCollections.length > 0
                                                                        ? [{ key: "__entity_action__", title: "", width: 36, sortable: false, resizable: false }, ...tableData.columns]
                                                                        : tableData.columns
                                                                }
                                                                rowHeight={32}
                                                                headerHeight={32}
                                                                cellRenderer={({ rowData, column, rowIndex }: CellRendererParams<Record<string, unknown>>) => {
                                                                    // Entity action column
                                                                    if (column.key === "__entity_action__") {
                                                                        const rowActions = getRowEntityActions(rowData);
                                                                        if (rowActions.length === 0) return <div className="h-full w-full" />;
                                                                        if (rowActions.length === 1) {
                                                                            const ra = rowActions[0];
                                                                            return (
                                                                                <div className="h-full flex items-center justify-center">
                                                                                    <Tooltip title={t("studio_sql_edit_entity", { name: ra.collection.collection.name, id: String(ra.entityId) })}>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                sideEntityController.open({
                                                                                                    path: ra.collection.collectionSlug,
                                                                                                    entityId: ra.entityId,
                                                                                                    collection: ra.collection.collection,
                                                                                                    updateUrl: false
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            <EditIcon size="small" />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        // Multiple matched collections
                                                                        return (
                                                                            <div className="h-full flex items-center justify-center">
                                                                                <Menu
                                                                                    trigger={
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                        >
                                                                                            <MoreVertIcon size="small" />
                                                                                        </IconButton>
                                                                                    }
                                                                                >
                                                                                    {rowActions.map(ra => (
                                                                                        <MenuItem
                                                                                            key={ra.collection.collectionSlug}
                                                                                            dense
                                                                                            onClick={() => {
                                                                                                sideEntityController.open({
                                                                                                    path: ra.collection.collectionSlug,
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
                                                                    if (!rowData) return null;
                                                                    const val = rowData[column.key];
                                                                    const displayValue = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "");
                                                                    return (
                                                                        <div className="px-4 py-1.5 h-full flex items-center whitespace-nowrap text-[13px] text-text-primary dark:text-text-primary-dark font-mono">
                                                                            <div className="truncate flex-grow" title={displayValue}>
                                                                                {displayValue === "" ? <span className="text-text-disabled dark:text-text-disabled-dark italic text-[11px]">NULL</span> : displayValue}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {!isRunning && result && resultView === "console" && (
                                                    <div className="flex-grow overflow-auto p-2 space-y-1 font-mono text-[12px]">
                                                        {result.console.length === 0 ? (
                                                            <Typography variant="caption" className="text-text-disabled p-2">No console output</Typography>
                                                        ) : (
                                                            result.console.map((entry, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cls(
                                                                        "px-2 py-1 rounded flex items-start gap-2",
                                                                        entry.type === "error" && "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
                                                                        entry.type === "warn" && "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
                                                                        entry.type === "log" && "text-text-primary dark:text-text-primary-dark",
                                                                        entry.type === "info" && "text-blue-700 dark:text-blue-400",
                                                                    )}
                                                                >
                                                                    <span className="text-[10px] opacity-50 flex-shrink-0 mt-0.5">
                                                                        {entry.type === "error" ? "❌" : entry.type === "warn" ? "⚠️" : entry.type === "info" ? "ℹ️" : "›"}
                                                                    </span>
                                                                    <span className="whitespace-pre-wrap break-words">
                                                                        {entry.args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        )}

                                                        {result.value !== undefined && (
                                                            <div className={cls("px-2 py-1 mt-2 border-t pt-2", defaultBorderMixin)}>
                                                                <Typography variant="caption" className="text-text-disabled text-[10px] uppercase tracking-wider mb-1 block">Return Value</Typography>
                                                                <pre className="text-text-primary dark:text-text-primary-dark whitespace-pre-wrap break-words text-[12px]">
                                                                    {formatJSON(result.value)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer bar — matching SQL editor */}
                                            {!isRunning && result && !result.error && resultView === "table" && tableData.data.length > 0 && (
                                                <div className={cls("p-2 px-4 border-t bg-surface-50 dark:bg-surface-900 flex justify-between items-center shrink-0", defaultBorderMixin)}>
                                                    <div className="flex space-x-4">
                                                        <div className="flex items-center text-[11px]">
                                                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">{t("studio_sql_rows")}</span>
                                                            <span className="font-mono text-text-secondary dark:text-text-secondary-dark">{tableData.data.length}</span>
                                                        </div>
                                                        <div className="flex items-center text-[11px]">
                                                            <span className="font-bold text-text-disabled dark:text-text-disabled-dark mr-2 uppercase tracking-tighter">{t("studio_sql_time")}</span>
                                                            <span className="font-mono text-text-secondary dark:text-text-secondary-dark">{result.duration.toFixed(0)}ms</span>
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
                                                            onClick={exportResult}
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
                                            )}
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Save snippet dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTitle>Save Snippet</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Snippet name"
                        value={snippetName}
                        onChange={(e) => setSnippetName(e.target.value)}
                        placeholder="e.g. List all products"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") saveSnippet();
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                    <Button variant="filled" color="primary" onClick={saveSnippet} disabled={!snippetName.trim()}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

// ─── JSON Syntax Highlighting ────────────────────────────────────────

function JSONHighlight({ value }: { value: any }) {
    const json = formatJSON(value);
    const { mode } = useModeController();

    return (
        <Highlight
            theme={mode === "dark" ? themes.vsDark : themes.github}
            code={json}
            language="json"
        >
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <span style={{ ...style, backgroundColor: "transparent" }}>
                    {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                            ))}
                        </div>
                    ))}
                </span>
            )}
        </Highlight>
    );
}
