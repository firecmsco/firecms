import React, { useState, useCallback, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────
interface SchemaColumn {
    name: string;
    type: string;
    isPK?: boolean;
}
interface SchemaTable {
    name: string;
    columns: SchemaColumn[];
}
interface SchemaInfo {
    name: string;
    tables: SchemaTable[];
}

interface SQLTab {
    id: string;
    name: string;
    sql: string;
}

interface QueryResult {
    columns: string[];
    rows: Record<string, string | number | null>[];
    rowCount: number;
    execTime: number;
}

// ─── Mock data ───────────────────────────────────────────
const MOCK_SCHEMAS: SchemaInfo[] = [
    {
        name: "public",
        tables: [
            {
                name: "users",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                    { name: "email", type: "text" },
                    { name: "display_name", type: "text" },
                    { name: "role", type: "text" },
                    { name: "created_at", type: "timestamptz" },
                ],
            },
            {
                name: "posts",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                    { name: "title", type: "text" },
                    { name: "status", type: "text" },
                    { name: "author_id", type: "uuid" },
                    { name: "created_at", type: "timestamptz" },
                    { name: "content", type: "text" },
                ],
            },
            {
                name: "comments",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                    { name: "post_id", type: "uuid" },
                    { name: "user_id", type: "uuid" },
                    { name: "body", type: "text" },
                    { name: "created_at", type: "timestamptz" },
                ],
            },
            {
                name: "products",
                columns: [
                    { name: "id", type: "serial", isPK: true },
                    { name: "name", type: "text" },
                    { name: "price", type: "numeric" },
                    { name: "category", type: "text" },
                    { name: "stock", type: "integer" },
                ],
            },
            {
                name: "orders",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                    { name: "customer_id", type: "uuid" },
                    { name: "total", type: "numeric" },
                    { name: "status", type: "text" },
                    { name: "created_at", type: "timestamptz" },
                ],
            },
        ],
    },
    {
        name: "auth",
        tables: [
            {
                name: "sessions",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                    { name: "user_id", type: "uuid" },
                    { name: "token", type: "text" },
                    { name: "expires_at", type: "timestamptz" },
                ],
            },
        ],
    },
];

const MOCK_RESULTS: Record<string, QueryResult> = {
    default: {
        columns: ["title", "status", "author", "comments"],
        rows: [
            { title: "Getting Started with Rebase", status: "published", author: "Alice Chen", comments: 24 },
            { title: "Schema Migrations Guide", status: "published", author: "Bob Park", comments: 18 },
            { title: "Custom Views Tutorial", status: "draft", author: "Alice Chen", comments: 7 },
            { title: "RLS Best Practices", status: "published", author: "Eve Müller", comments: 31 },
            { title: "REST API Deep Dive", status: "draft", author: "Bob Park", comments: 3 },
        ],
        rowCount: 5,
        execTime: 12,
    },
    users: {
        columns: ["id", "email", "display_name", "role", "created_at"],
        rows: [
            { id: "a1b2c3d4", email: "alice@example.com", display_name: "Alice Chen", role: "admin", created_at: "2025-01-15" },
            { id: "e5f6g7h8", email: "bob@example.com", display_name: "Bob Park", role: "editor", created_at: "2025-02-20" },
            { id: "i9j0k1l2", email: "eve@example.com", display_name: "Eve Müller", role: "viewer", created_at: "2025-03-10" },
        ],
        rowCount: 3,
        execTime: 8,
    },
    products: {
        columns: ["id", "name", "price", "category", "stock"],
        rows: [
            { id: 1, name: "Ergonomic Keyboard", price: 129.99, category: "peripherals", stock: 42 },
            { id: 2, name: "USB-C Hub", price: 59.99, category: "peripherals", stock: 128 },
            { id: 3, name: "Monitor Stand", price: 89.00, category: "accessories", stock: 15 },
            { id: 4, name: "Webcam Pro", price: 179.99, category: "peripherals", stock: 0 },
        ],
        rowCount: 4,
        execTime: 5,
    },
};

const DEFAULT_SQL = `SELECT
  p.title,
  p.status,
  u.display_name AS author,
  COUNT(c.id) AS comments
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, u.id
LIMIT 5;`;

// ─── Helpers ─────────────────────────────────────────────
const SQL_KEYWORDS = ["SELECT", "FROM", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "WHERE", "GROUP", "BY", "ORDER", "LIMIT", "AS", "AND", "OR", "NOT", "IN", "IS", "NULL", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "TABLE", "INTO", "VALUES", "SET", "HAVING", "DISTINCT", "UNION", "ALL", "EXPLAIN", "ANALYZE"];
const SQL_FUNCTIONS = ["COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "NULLIF", "NOW", "CURRENT_TIMESTAMP"];

function highlightSQL(sql: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];
    const lines = sql.split("\n");

    lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) tokens.push("\n");
        // Simple tokenizer
        const parts = line.split(/(\b[A-Za-z_][A-Za-z0-9_]*\b|'[^']*'|"[^"]*"|\d+(?:\.\d+)?|[^\w\s'"]|\s+)/g);
        parts.forEach((part, i) => {
            if (!part) return;
            const upper = part.toUpperCase();
            if (SQL_KEYWORDS.includes(upper)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-purple-400">{part}</span>);
            } else if (SQL_FUNCTIONS.includes(upper)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-amber-400">{part}</span>);
            } else if (/^'[^']*'$/.test(part) || /^"[^"]*"$/.test(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-green-400">{part}</span>);
            } else if (/^\d+(?:\.\d+)?$/.test(part)) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-amber-400">{part}</span>);
            } else if (/^[a-z_][a-z0-9_]*$/i.test(part) && part.includes("_")) {
                tokens.push(<span key={`${lineIdx}-${i}`} className="text-blue-300">{part}</span>);
            } else {
                tokens.push(<span key={`${lineIdx}-${i}`}>{part}</span>);
            }
        });
    });
    return tokens;
}

// ─── Component ───────────────────────────────────────────
export function SQLEditorDemo() {
    const [tabs, setTabs] = useState<SQLTab[]>([
        { id: "1", name: "Query 1", sql: DEFAULT_SQL },
    ]);
    const [activeTabId, setActiveTabId] = useState("1");
    const [sidebarTab, setSidebarTab] = useState<"schema" | "snippets" | "history">("schema");
    const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set(["public"]));
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(["posts"]));
    const [result, setResult] = useState<QueryResult | null>(MOCK_RESULTS.default);
    const [isRunning, setIsRunning] = useState(false);
    const [autoLimit, setAutoLimit] = useState(true);
    const [selectedDb, setSelectedDb] = useState("rebase_main");
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setTimeout(() => {
            const sql = activeTab.sql.toLowerCase();
            if (sql.includes("users")) setResult(MOCK_RESULTS.users);
            else if (sql.includes("products")) setResult(MOCK_RESULTS.products);
            else setResult(MOCK_RESULTS.default);
            setIsRunning(false);
        }, 600 + Math.random() * 400);
    }, [activeTab.sql]);

    const handleSQLChange = useCallback((newSql: string) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, sql: newSql } : t));
    }, [activeTabId]);

    const addTab = useCallback(() => {
        const id = String(Date.now());
        setTabs(prev => [...prev, { id, name: `Query ${prev.length + 1}`, sql: "SELECT * FROM " }]);
        setActiveTabId(id);
    }, []);

    const closeTab = useCallback((tabId: string) => {
        setTabs(prev => {
            const filtered = prev.filter(t => t.id !== tabId);
            if (filtered.length === 0) return [{ id: "1", name: "Query 1", sql: DEFAULT_SQL }];
            if (activeTabId === tabId) setActiveTabId(filtered[filtered.length - 1].id);
            return filtered;
        });
    }, [activeTabId]);

    const sqlLines = activeTab.sql.split("\n");

    const toggleSchema = (name: string) => {
        setExpandedSchemas(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const toggleTable = (name: string) => {
        setExpandedTables(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    return (
        <div className="flex h-[560px] w-full rounded-xl overflow-hidden ring-1 ring-surface-700 bg-surface-950 shadow-2xl text-surface-300 text-sm">
            {/* ── Sidebar ── */}
            <div className="w-[200px] border-r border-surface-800/40 flex flex-col shrink-0">
                {/* Sidebar tabs */}
                <div className="flex border-b border-surface-800/40 bg-surface-900/60">
                    {(["schema", "snippets", "history"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSidebarTab(tab)}
                            className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                                sidebarTab === tab ? "text-primary border-b-2 border-primary bg-surface-900/40" : "text-surface-500 hover:text-surface-300"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Sidebar content */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                    {sidebarTab === "schema" && MOCK_SCHEMAS.map(schema => (
                        <div key={schema.name}>
                            <button
                                onClick={() => toggleSchema(schema.name)}
                                className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold text-surface-500 tracking-wider w-full text-left hover:text-surface-300 transition-colors"
                            >
                                <span>{expandedSchemas.has(schema.name) ? "▾" : "▸"}</span>
                                {schema.name}
                            </button>
                            {expandedSchemas.has(schema.name) && schema.tables.map(table => (
                                <div key={table.name}>
                                    <button
                                        onClick={() => toggleTable(table.name)}
                                        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-surface-400 hover:bg-surface-800/40 cursor-pointer w-full text-left transition-colors"
                                    >
                                        <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" /></svg>
                                        <span className="truncate flex-1 font-mono text-[11px]">{table.name}</span>
                                        <span className="text-[10px] opacity-40">{table.columns.length}</span>
                                    </button>
                                    {expandedTables.has(table.name) && (
                                        <div className="ml-5 border-l border-surface-800/40 pl-2 space-y-0.5 py-0.5">
                                            {table.columns.map(col => (
                                                <div
                                                    key={col.name}
                                                    className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] text-surface-500 hover:text-surface-300 hover:bg-surface-800/30 cursor-pointer transition-colors"
                                                    onClick={() => handleSQLChange(activeTab.sql + col.name)}
                                                >
                                                    {col.isPK ? (
                                                        <svg className="w-2.5 h-2.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                                                    ) : (
                                                        <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] text-surface-600">·</span>
                                                    )}
                                                    <span className="font-mono">{col.name}</span>
                                                    <span className="ml-auto text-surface-600 font-mono text-[9px]">{col.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}

                    {sidebarTab === "snippets" && (
                        <div className="p-3 text-center text-surface-600 text-[11px]">
                            <div className="mb-2">
                                <svg className="w-8 h-8 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                            </div>
                            Saved snippets appear here
                        </div>
                    )}

                    {sidebarTab === "history" && (
                        <div className="p-3 text-center text-surface-600 text-[11px]">
                            <div className="mb-2">
                                <svg className="w-8 h-8 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            Query history appears here
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Panel ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-1 border-b border-surface-800/40 bg-surface-950">
                    {/* Tabs */}
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
                                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {tab.name}
                                {tabs.length > 1 && (
                                    <span
                                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 ml-0.5 transition-opacity cursor-pointer"
                                    >×</span>
                                )}
                            </button>
                        ))}
                        <button onClick={addTab} className="p-2 text-surface-500 hover:text-surface-300 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>

                    {/* Right toolbar */}
                    <div className="flex shrink-0 items-center gap-1.5 pr-2">
                        <button className="p-1.5 text-surface-500 hover:text-surface-300 transition-colors" title="Format SQL">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16"/></svg>
                        </button>
                        <button className="px-2 py-1 text-[10px] text-surface-500 hover:text-surface-300 transition-colors">EXPLAIN</button>
                        <div className="h-4 w-px bg-surface-800 mx-1" />
                        <label className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setAutoLimit(!autoLimit)}>
                            <span className="text-[10px] text-surface-500">LIMIT 1000</span>
                            <div className={`w-3.5 h-3.5 rounded border ${autoLimit ? "bg-primary border-primary" : "border-surface-600"} flex items-center justify-center transition-colors`}>
                                {autoLimit && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                            </div>
                        </label>
                        <div className="h-4 w-px bg-surface-800 mx-1" />

                        {/* DB Selector */}
                        <div className="px-2 py-1 rounded bg-surface-800/60 text-[10px] text-surface-400 font-mono flex items-center gap-1 cursor-pointer">
                            <svg className="w-3 h-3 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
                            {selectedDb}
                        </div>

                        {/* Run button */}
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/80 text-white text-[11px] font-semibold transition-all disabled:opacity-50 ml-1"
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

                {/* Editor + Results split */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Editor area */}
                    <div className="relative flex min-h-[200px]" style={{ height: "50%" }}>
                        {/* Line numbers */}
                        <div className="py-3 px-2 text-right text-[11px] font-mono text-surface-600 leading-[1.6rem] select-none border-r border-surface-800/40 bg-surface-950 shrink-0">
                            {sqlLines.map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        {/* Code display + hidden textarea */}
                        <div className="flex-1 relative overflow-auto bg-surface-950">
                            <pre className="py-3 px-4 text-[12px] font-mono leading-[1.6rem] whitespace-pre-wrap pointer-events-none absolute inset-0 text-surface-300">
                                {highlightSQL(activeTab.sql)}
                            </pre>
                            <textarea
                                ref={editorRef}
                                value={activeTab.sql}
                                onChange={(e) => handleSQLChange(e.target.value)}
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

                    {/* Resize handle */}
                    <div className="h-1 bg-surface-800/40 cursor-ns-resize hover:bg-primary/30 transition-colors" />

                    {/* Results panel */}
                    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
                        {/* Results header */}
                        <div className="p-2 px-4 bg-surface-900/60 border-b border-surface-800/40 flex items-center shrink-0">
                            <span className="font-bold text-surface-500 uppercase tracking-widest text-[10px]">QUERY RESULTS</span>
                        </div>

                        {/* Results content */}
                        <div className="flex-1 overflow-auto min-h-0">
                            {isRunning ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-3 animate-spin text-primary opacity-60" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        <span className="text-surface-500 text-[11px] font-mono animate-pulse">EXECUTING...</span>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="flex flex-col h-full">
                                    {/* Execution info */}
                                    <div className="flex items-center justify-between px-4 py-1.5 bg-surface-900/40 border-b border-surface-800/40 text-[10px] shrink-0">
                                        <span className="text-green-400 font-medium">✓ {result.rowCount} rows · {result.execTime}ms</span>
                                        <span className="text-surface-500 font-mono">public.posts</span>
                                    </div>
                                    {/* Table header */}
                                    <div className="flex text-[10px] font-semibold text-surface-500 tracking-wider uppercase border-b border-surface-700/40 bg-surface-900/30 shrink-0">
                                        {result.columns.map(col => (
                                            <div key={col} className="px-3 py-2 flex-1 min-w-[80px]">{col}</div>
                                        ))}
                                    </div>
                                    {/* Table body */}
                                    <div className="flex-1 overflow-auto">
                                        {result.rows.map((row, i) => (
                                            <div key={i} className="flex text-xs border-b border-surface-800/40 hover:bg-surface-800/20 transition-colors">
                                                {result.columns.map(col => (
                                                    <div key={col} className="px-3 py-2 flex-1 min-w-[80px] truncate text-surface-300 font-mono text-[11px]">
                                                        {col === "status" ? (
                                                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${
                                                                row[col] === "published" ? "bg-green-950 text-green-300" :
                                                                row[col] === "draft" ? "bg-amber-950 text-amber-300" :
                                                                "bg-surface-800 text-surface-400"
                                                            }`}>{String(row[col])}</span>
                                                        ) : (
                                                            String(row[col] ?? "")
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Footer */}
                                    <div className="p-2 px-4 border-t border-surface-800/40 bg-surface-900/40 flex justify-between items-center shrink-0">
                                        <div className="flex space-x-4">
                                            <div className="flex items-center text-[10px]">
                                                <span className="font-bold text-surface-600 mr-2 uppercase tracking-tighter">ROWS</span>
                                                <span className="font-mono text-surface-400">{result.rowCount}</span>
                                            </div>
                                            <div className="flex items-center text-[10px]">
                                                <span className="font-bold text-surface-600 mr-2 uppercase tracking-tighter">TIME</span>
                                                <span className="font-mono text-surface-400">{result.execTime}ms</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-[10px] text-surface-500 hover:text-surface-300 uppercase font-bold transition-colors">Copy MD</button>
                                            <button className="text-[10px] text-surface-500 hover:text-surface-300 uppercase font-bold transition-colors">Export JSON</button>
                                            <button className="text-[10px] text-surface-500 hover:text-surface-300 uppercase font-bold transition-colors">Export CSV</button>
                                        </div>
                                    </div>
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
