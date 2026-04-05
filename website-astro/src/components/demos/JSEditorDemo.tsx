import React, { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────
interface JSTab {
    id: string;
    name: string;
    code: string;
}

interface ConsoleEntry {
    type: "log" | "warn" | "error" | "info";
    message: string;
    timestamp: number;
}

interface ExecutionResult {
    value: any;
    console: ConsoleEntry[];
    duration: number;
    error?: string;
}

// ─── Mock Data ───────────────────────────────────────────
const DEFAULT_CODE = `// Available: client (RebaseClient), context
// Press Cmd+Enter (Ctrl+Enter) to run

const result = await client.data
  .collection("posts")
  .find({ limit: 10 });

console.log("Found", result.data.length, "posts");
return result;`;

const MOCK_RESULTS: Record<string, ExecutionResult> = {
    default: {
        value: {
            data: [
                { id: "a1b2c3", values: { title: "Getting Started with Rebase", status: "published", author_id: "usr_1" }},
                { id: "d4e5f6", values: { title: "Schema Migrations Guide", status: "published", author_id: "usr_2" }},
                { id: "g7h8i9", values: { title: "Custom Views Tutorial", status: "draft", author_id: "usr_1" }},
            ],
            pagination: { hasMore: true, cursor: "g7h8i9" }
        },
        console: [
            { type: "log", message: "Found 3 posts", timestamp: Date.now() },
        ],
        duration: 142,
    },
    users: {
        value: [
            { uid: "usr_1", email: "alice@example.com", displayName: "Alice Chen", role: "admin" },
            { uid: "usr_2", email: "bob@example.com", displayName: "Bob Park", role: "editor" },
        ],
        console: [],
        duration: 89,
    },
    error: {
        value: undefined,
        console: [],
        duration: 12,
        error: "ReferenceError: undefinedVariable is not defined",
    },
};

const SNIPPETS = [
    { name: "List all users", code: `const users = await client.admin.listUsers();\nreturn users;` },
    { name: "Count posts", code: `const result = await client.data.collection("posts").find();\nconsole.log("Total:", result.data.length);\nreturn { count: result.data.length };` },
    { name: "Get current session", code: `const session = client.auth.getSession();\nreturn session;` },
];

// ─── Highlighting ────────────────────────────────────────
const JS_KEYWORDS = ["const", "let", "var", "await", "async", "return", "function", "if", "else", "for", "while", "try", "catch", "throw", "new", "import", "export", "from", "class", "extends", "this", "true", "false", "null", "undefined"];

function highlightJS(code: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];
    const lines = code.split("\n");

    lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) tokens.push("\n");
        if (line.trimStart().startsWith("//")) {
            tokens.push(<span key={`${lineIdx}-comment`} className="text-surface-600">{line}</span>);
            return;
        }
        const parts = line.split(/(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|"[^"]*"|'[^']*'|`[^`]*`|\d+(?:\.\d+)?|[^\w\s"'`]|\s+)/g);
        parts.forEach((part, i) => {
            if (!part) return;
            if (JS_KEYWORDS.includes(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-purple-400">{part}</span>);
            } else if (/^["'`]/.test(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-green-400">{part}</span>);
            } else if (/^\d+/.test(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-amber-400">{part}</span>);
            } else if (/^(console|client|context|result|data|admin|auth|collection|find|findById|create|update|delete|listUsers|getSession)$/.test(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-cyan-300">{part}</span>);
            } else {
                tokens.push(<span key={`${lineIdx}-${i}`}>{part}</span>);
            }
        });
    });
    return tokens;
}

// ─── Component ───────────────────────────────────────────
export function JSEditorDemo() {
    const [tabs, setTabs] = useState<JSTab[]>([
        { id: "1", name: "Script 1", code: DEFAULT_CODE },
    ]);
    const [activeTabId, setActiveTabId] = useState("1");
    const [sidebarTab, setSidebarTab] = useState<"collections" | "snippets" | "history">("collections");
    const [result, setResult] = useState<ExecutionResult | null>(MOCK_RESULTS.default);
    const [resultView, setResultView] = useState<"json" | "table" | "console">("json");
    const [isRunning, setIsRunning] = useState(false);

    const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
    const codeLines = activeTab.code.split("\n");

    const handleCodeChange = useCallback((newCode: string) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: newCode } : t));
    }, [activeTabId]);

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setTimeout(() => {
            const code = activeTab.code.toLowerCase();
            if (code.includes("listusers")) setResult(MOCK_RESULTS.users);
            else if (code.includes("undefined")) setResult(MOCK_RESULTS.error);
            else setResult(MOCK_RESULTS.default);
            setIsRunning(false);
            // Auto-detect best view
            if (MOCK_RESULTS.default.value?.data) setResultView("json");
        }, 400 + Math.random() * 300);
    }, [activeTab.code]);

    const addTab = useCallback(() => {
        const id = String(Date.now());
        setTabs(prev => [...prev, { id, name: `Script ${prev.length + 1}`, code: "// New script\n" }]);
        setActiveTabId(id);
    }, []);

    return (
        <div className="flex h-[520px] w-full rounded-xl overflow-hidden ring-1 ring-surface-700 bg-surface-950 shadow-2xl text-surface-300 text-sm">
            {/* ── Sidebar ── */}
            <div className="w-[190px] border-r border-surface-800/40 flex flex-col shrink-0">
                <div className="flex border-b border-surface-800/40 bg-surface-900/60">
                    {(["collections", "snippets", "history"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSidebarTab(tab)}
                            className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-semibold transition-colors ${
                                sidebarTab === tab ? "text-primary border-b-2 border-primary bg-surface-900/40" : "text-surface-500 hover:text-surface-300"
                            }`}
                        >
                            {tab === "collections" ? "SDK" : tab}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                    {sidebarTab === "collections" && (
                        <div className="space-y-0.5">
                            <div className="px-1.5 py-1 text-[10px] font-semibold text-surface-500 tracking-wider">COLLECTIONS</div>
                            {["posts", "users", "comments", "products", "orders"].map(col => (
                                <button
                                    key={col}
                                    onClick={() => handleCodeChange(`const result = await client.data\n  .collection("${col}")\n  .find({ limit: 10 });\n\nreturn result;`)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-surface-400 hover:bg-surface-800/40 w-full text-left transition-colors"
                                >
                                    <div className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-2.5 h-2.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16"/></svg>
                                    </div>
                                    <span className="font-mono text-[11px]">{col}</span>
                                </button>
                            ))}
                            <div className="px-1.5 py-1 mt-2 text-[10px] font-semibold text-surface-500 tracking-wider">ADMIN</div>
                            {["listUsers", "getSession", "getConfig"].map(method => (
                                <button
                                    key={method}
                                    onClick={() => handleCodeChange(`const result = await client.admin.${method}();\nreturn result;`)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-surface-400 hover:bg-surface-800/40 w-full text-left transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <span className="font-mono text-[11px]">{method}()</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {sidebarTab === "snippets" && (
                        <div className="space-y-1">
                            {SNIPPETS.map((snippet, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleCodeChange(snippet.code)}
                                    className="w-full text-left px-2 py-2 rounded hover:bg-surface-800/40 transition-colors"
                                >
                                    <div className="text-[11px] text-surface-300 font-medium">{snippet.name}</div>
                                    <div className="text-[10px] text-surface-600 font-mono truncate mt-0.5">{snippet.code.split("\n")[0]}</div>
                                </button>
                            ))}
                        </div>
                    )}
                    {sidebarTab === "history" && (
                        <div className="p-3 text-center text-surface-600 text-[11px]">
                            <svg className="w-8 h-8 mx-auto opacity-30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Execution history
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Panel ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-1 border-b border-surface-800/40 bg-surface-950">
                    <div className="flex items-center overflow-x-auto min-w-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`group flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors whitespace-nowrap ${
                                    activeTabId === tab.id
                                        ? "border-primary text-primary bg-surface-900/30"
                                        : "border-transparent text-surface-500 hover:text-surface-300"
                                }`}
                            >
                                <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {tab.name}
                            </button>
                        ))}
                        <button onClick={addTab} className="p-2 text-surface-500 hover:text-surface-300 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 pr-2">
                        {/* User avatar */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-800/60 text-[10px] text-surface-400 cursor-pointer">
                            <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center text-[8px] text-indigo-300 font-bold">A</div>
                            <span>Run as Admin</span>
                        </div>
                        <div className="h-4 w-px bg-surface-800 mx-1" />
                        <button className="p-1.5 text-surface-500 hover:text-surface-300 transition-colors" title="Save snippet">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/80 text-white text-[11px] font-semibold transition-all disabled:opacity-50"
                        >
                            {isRunning ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                            Run
                        </button>
                    </div>
                </div>

                {/* Editor + Results */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Editor */}
                    <div className="relative flex min-h-[180px]" style={{ height: "50%" }}>
                        <div className="py-3 px-2 text-right text-[11px] font-mono text-surface-600 leading-[1.6rem] select-none border-r border-surface-800/40 bg-surface-950 shrink-0">
                            {codeLines.map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <div className="flex-1 relative overflow-auto bg-surface-950">
                            <pre className="py-3 px-4 text-[12px] font-mono leading-[1.6rem] whitespace-pre-wrap pointer-events-none absolute inset-0 text-surface-300">
                                {highlightJS(activeTab.code)}
                            </pre>
                            <textarea
                                value={activeTab.code}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                        e.preventDefault();
                                        handleRun();
                                    }
                                }}
                                className="absolute inset-0 py-3 px-4 text-[12px] font-mono leading-[1.6rem] bg-transparent text-transparent caret-primary resize-none outline-none w-full h-full"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <div className="h-1 bg-surface-800/40 cursor-ns-resize hover:bg-primary/30 transition-colors" />

                    {/* Results */}
                    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
                        <div className="p-2 px-4 bg-surface-900/60 border-b border-surface-800/40 flex items-center shrink-0">
                            <span className="font-bold text-surface-500 uppercase tracking-widest text-[10px]">RESULTS</span>
                            {result && (
                                <>
                                    <div className="flex-grow" />
                                    <div className="flex rounded bg-surface-800/60 p-0.5 mr-2">
                                        {["json", "console"].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setResultView(v as any)}
                                                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                                    resultView === v ? "bg-surface-700 text-white" : "text-surface-500 hover:text-surface-300"
                                                }`}
                                            >
                                                {v.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        result.error ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                                    }`}>
                                        {result.error ? "Error" : `${result.duration.toFixed(0)}ms`}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto">
                            {isRunning ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-3 animate-spin text-primary opacity-60" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        <span className="text-surface-500 text-[11px] font-mono animate-pulse">EXECUTING SCRIPT...</span>
                                    </div>
                                </div>
                            ) : result?.error ? (
                                <div className="p-4">
                                    <div className="p-3 rounded-lg border border-red-800/30 bg-red-950/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            <span className="text-sm text-red-300 font-medium">Execution Error</span>
                                        </div>
                                        <pre className="text-[12px] font-mono text-red-400 whitespace-pre-wrap">{result.error}</pre>
                                    </div>
                                </div>
                            ) : result && resultView === "json" ? (
                                <pre className="p-4 text-[12px] font-mono leading-relaxed text-surface-300 whitespace-pre-wrap">
                                    {JSON.stringify(result.value, null, 2)}
                                </pre>
                            ) : result && resultView === "console" ? (
                                <div className="p-2 space-y-1">
                                    {result.console.length === 0 ? (
                                        <div className="text-center text-surface-600 text-[11px] py-6">No console output</div>
                                    ) : result.console.map((entry, i) => (
                                        <div key={i} className={`flex items-start gap-2 px-2 py-1 rounded text-[11px] font-mono ${
                                            entry.type === "error" ? "bg-red-950/20 text-red-400" :
                                            entry.type === "warn" ? "bg-amber-950/20 text-amber-400" :
                                            "text-surface-300"
                                        }`}>
                                            <span className="text-surface-600 text-[10px] shrink-0 mt-px">{entry.type.toUpperCase()}</span>
                                            <span>{entry.message}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-surface-600">
                                    <div className="text-center">
                                        <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        <p className="text-[11px]">Press <kbd className="px-1.5 py-0.5 rounded bg-surface-800 text-[10px] font-mono">⌘ Enter</kbd> to run</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
