import React, { useState } from "react";
import {
    Typography,
    cls,
    defaultBorderMixin,
    Tabs,
    Tab,
    Tooltip,
    IconButton,
} from "@rebasepro/ui";

export interface JSSnippet {
    id: string;
    name: string;
    code: string;
    createdAt: number;
    isFavorite?: boolean;
}

interface CollectionInfo {
    slug: string;
    properties: string[];
}

interface JSEditorSidebarProps {
    collections: CollectionInfo[];
    snippets: JSSnippet[];
    history: string[];
    onSelectSnippet: (code: string) => void;
    onDeleteSnippet: (id: string) => void;
    onInsertCode: (code: string) => void;
}

const QUICK_REFERENCE: { label: string; code: string; description: string }[] = [
    {
        label: "Find all",
        code: `const result = await client.data.collection("COLLECTION").find({ limit: 20 });\nreturn result;`,
        description: "Fetch records with pagination"
    },
    {
        label: "Find by ID",
        code: `const item = await client.data.collection("COLLECTION").findById("ID");\nreturn item;`,
        description: "Fetch a single record"
    },
    {
        label: "Create",
        code: `const created = await client.data.collection("COLLECTION").create({\n  // your fields here\n});\nreturn created;`,
        description: "Insert a new record"
    },
    {
        label: "Update",
        code: `const updated = await client.data.collection("COLLECTION").update("ID", {\n  // fields to update\n});\nreturn updated;`,
        description: "Update an existing record"
    },
    {
        label: "Delete",
        code: `await client.data.collection("COLLECTION").delete("ID");\nreturn { success: true };`,
        description: "Delete a record"
    },
    {
        label: "Fluent query",
        code: `const result = await client.data.collection("COLLECTION")\n  .where("field", ">", value)\n  .orderBy("field", "desc")\n  .limit(10)\n  .find();\nreturn result;`,
        description: "Chained query builder"
    },
    {
        label: "Auth: Current session",
        code: `const session = client.auth.getSession();\nreturn session;`,
        description: "Get current auth session"
    },
    {
        label: "Admin: List users",
        code: `const { users } = await client.admin.listUsers();\nreturn users;`,
        description: "List all registered users"
    },
    {
        label: "Custom endpoint",
        code: `const result = await client.call("/my-endpoint", { key: "value" });\nreturn result;`,
        description: "Call a custom API endpoint"
    }
];

export const JSEditorSidebar = ({
    collections,
    snippets,
    history,
    onSelectSnippet,
    onDeleteSnippet,
    onInsertCode,
}: JSEditorSidebarProps) => {
    const [activeTab, setActiveTab] = useState<"collections" | "snippets" | "history" | "reference">("collections");

    return (
        <div className={cls("flex flex-col h-full w-full bg-white dark:bg-surface-950 border-r", defaultBorderMixin)}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                <Tab value="collections">
                    <Tooltip title="Browse collections">
                        <span className="text-xs">Collections</span>
                    </Tooltip>
                </Tab>
                <Tab value="reference">
                    <Tooltip title="SDK quick reference">
                        <span className="text-xs">Reference</span>
                    </Tooltip>
                </Tab>
                <Tab value="snippets">
                    <span className="text-xs">Snippets</span>
                </Tab>
                <Tab value="history">
                    <span className="text-xs">History</span>
                </Tab>
            </Tabs>

            <div className="flex-grow overflow-hidden relative">
                {/* Collections browser */}
                {activeTab === "collections" && (
                    <div className="flex flex-col h-full">
                        <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                                Collections
                            </Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-1 space-y-1 no-scrollbar">
                            {collections.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">
                                        No collections found
                                    </Typography>
                                </div>
                            ) : (
                                collections.map(col => (
                                    <CollectionItem
                                        key={col.slug}
                                        collection={col}
                                        onInsertCode={onInsertCode}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Quick reference */}
                {activeTab === "reference" && (
                    <div className="flex flex-col h-full">
                        <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                                SDK Reference
                            </Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
                            {QUICK_REFERENCE.map((ref, i) => (
                                <div
                                    key={i}
                                    className={cls(
                                        "group p-2.5 rounded-lg border hover:border-primary/40 dark:hover:border-primary/40",
                                        "bg-white dark:bg-surface-900 transition-all cursor-pointer",
                                        defaultBorderMixin
                                    )}
                                    onClick={() => onInsertCode(ref.code)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-semibold text-[13px]">
                                            {ref.label}
                                        </Typography>
                                        <svg className="w-3.5 h-3.5 text-text-disabled group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-[10px] leading-tight">
                                        {ref.description}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Snippets */}
                {activeTab === "snippets" && (() => {
                    const favorites = snippets.filter(s => s.isFavorite);
                    const others = snippets.filter(s => !s.isFavorite);

                    return (
                        <div className="flex flex-col h-full">
                            <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">Snippets</Typography>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
                                {snippets.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">
                                            No saved snippets yet. Use the save button to store reusable code.
                                        </Typography>
                                    </div>
                                ) : (
                                    <>
                                        {favorites.length > 0 && (
                                            <div className="mb-3">
                                                <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark mb-2 px-1 flex items-center">
                                                    <svg className="w-3 h-3 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    Favorites
                                                </Typography>
                                                <div className="space-y-2">
                                                    {favorites.map(snippet => (
                                                        <SnippetItem key={snippet.id} snippet={snippet} onSelect={onSelectSnippet} onDelete={onDeleteSnippet} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {others.length > 0 && (
                                            <div>
                                                {favorites.length > 0 && (
                                                    <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark mb-2 px-1">
                                                        Others
                                                    </Typography>
                                                )}
                                                <div className="space-y-2">
                                                    {others.map(snippet => (
                                                        <SnippetItem key={snippet.id} snippet={snippet} onSelect={onSelectSnippet} onDelete={onDeleteSnippet} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* History */}
                {activeTab === "history" && (
                    <div className="flex flex-col h-full">
                        <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">History</Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-1 space-y-1 no-scrollbar">
                            {history.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">
                                        No execution history yet
                                    </Typography>
                                </div>
                            ) : (
                                [...history].reverse().map((code, i) => (
                                    <div
                                        key={i}
                                        className="p-2 py-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer group transition-colors flex items-start"
                                        onClick={() => onSelectSnippet(code)}
                                    >
                                        <svg className="w-3 h-3 mt-1 mr-2 text-text-disabled dark:text-text-disabled-dark group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark group-hover:text-text-primary dark:group-hover:text-text-primary-dark text-[11px] line-clamp-2 leading-tight flex-grow font-mono">
                                            {code.length > 120 ? code.substring(0, 120) + "…" : code}
                                        </Typography>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────

function CollectionItem({ collection, onInsertCode }: { collection: CollectionInfo; onInsertCode: (code: string) => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <div
                className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors group relative"
                onClick={() => setExpanded(!expanded)}
            >
                <svg
                    className={cls("w-3 h-3 mr-1 transition-transform", expanded && "rotate-90")}
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
                <svg className="w-3.5 h-3.5 mr-1 shrink-0 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark text-xs truncate flex-1 min-w-0">
                    {collection.slug}
                </Typography>
                <Tooltip title="Insert find() snippet">
                    <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-text-disabled hover:text-primary transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onInsertCode(`const result = await client.data.${collection.slug}.find({ limit: 20 });\nreturn result;`);
                        }}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </Tooltip>
            </div>
            {expanded && collection.properties.length > 0 && (
                <div className={cls("ml-5 mt-1 space-y-0.5 border-l", defaultBorderMixin)}>
                    {collection.properties.map(prop => (
                        <div
                            key={prop}
                            className="flex items-center p-1 pl-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-r cursor-pointer transition-colors group/prop relative min-h-[28px]"
                            onClick={() => onInsertCode(`"${prop}"`)}
                        >
                            <svg className="w-3 h-3 mr-1.5 text-text-disabled dark:text-text-disabled-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4.5v15m6-15v15m-10.5-1.5h15c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125h-15c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125Z" /></svg>
                            <Typography variant="caption" className="text-text-primary dark:text-text-primary-dark text-[11px] truncate flex-grow font-mono">{prop}</Typography>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SnippetItem({ snippet, onSelect, onDelete }: { snippet: JSSnippet; onSelect: (code: string) => void; onDelete: (id: string) => void }) {
    return (
        <div
            className={cls("group p-2 rounded border hover:border-surface-400 dark:hover:border-surface-600 bg-white dark:bg-surface-900 transition-all cursor-pointer relative", defaultBorderMixin)}
            onClick={() => onSelect(snippet.code)}
        >
            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-[13px] truncate pr-6">
                {snippet.name}
            </Typography>
            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[10px] block mt-1 truncate font-mono">
                {snippet.code}
            </Typography>
            <button
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-text-disabled hover:text-red-500 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(snippet.id);
                }}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    );
}
