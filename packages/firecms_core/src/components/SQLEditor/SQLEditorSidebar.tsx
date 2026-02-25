import React, { useState } from "react";
import {
    Typography,
    cls,
    IconButton
} from "@firecms/ui";
import { SchemaBrowser } from "./SchemaBrowser";

export interface Snippet {
    id: string;
    name: string;
    sql: string;
    createdAt: number;
}

interface SQLEditorSidebarProps {
    onSelectSnippet: (sql: string) => void;
    onTableClick: (tableName: string) => void;
    snippets: Snippet[];
    history: string[];
    onDeleteSnippet: (id: string) => void;
}

export const SQLEditorSidebar = ({
    onSelectSnippet,
    onTableClick,
    snippets,
    history,
    onDeleteSnippet
}: SQLEditorSidebarProps) => {
    const [activeTab, setActiveTab] = useState<"schema" | "snippets" | "history">("schema");

    return (
        <div className="flex flex-col h-full bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 w-[260px] flex-shrink-0">
            <div className="flex border-b border-surface-200 dark:border-surface-800">
                <button
                    onClick={() => setActiveTab("schema")}
                    className={cls("flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors",
                        activeTab === "schema" ? "text-primary border-b-2 border-primary bg-surface-50 dark:bg-surface-900" : "text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface-100 dark:hover:bg-surface-900")}
                >
                    Schema
                </button>
                <button
                    onClick={() => setActiveTab("snippets")}
                    className={cls("flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors",
                        activeTab === "snippets" ? "text-primary border-b-2 border-primary bg-surface-50 dark:bg-surface-900" : "text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface-100 dark:hover:bg-surface-900")}
                >
                    Snippets
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cls("flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors",
                        activeTab === "history" ? "text-primary border-b-2 border-primary bg-surface-50 dark:bg-surface-900" : "text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface-100 dark:hover:bg-surface-900")}
                >
                    History
                </button>
            </div>

            <div className="flex-grow overflow-hidden relative">
                {activeTab === "schema" && (
                    <SchemaBrowser onTableClick={onTableClick} />
                )}

                {activeTab === "snippets" && (
                    <div className="flex flex-col h-full">
                        <div className="p-3 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-900">
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">Saved Snippets</Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
                            {snippets.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">No saved snippets yet.</Typography>
                                </div>
                            ) : (
                                snippets.map(snippet => (
                                    <div
                                        key={snippet.id}
                                        className="group p-2 rounded border border-surface-200 dark:border-surface-800 hover:border-surface-400 dark:hover:border-surface-600 bg-white dark:bg-surface-900 transition-all cursor-pointer relative"
                                        onClick={() => onSelectSnippet(snippet.sql)}
                                    >
                                        <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-[13px] truncate pr-6">{snippet.name}</Typography>
                                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[10px] block mt-1 truncate">{snippet.sql}</Typography>
                                        <button
                                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-text-disabled hover:text-red-500 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteSnippet(snippet.id);
                                            }}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="flex flex-col h-full">
                        <div className="p-3 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-900">
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">Execution History</Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-1 space-y-1 no-scrollbar">
                            {history.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">No history available.</Typography>
                                </div>
                            ) : (
                                [...history].reverse().map((sql, i) => (
                                    <div
                                        key={i}
                                        className="p-2 py-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer group transition-colors flex items-start"
                                        onClick={() => onSelectSnippet(sql)}
                                    >
                                        <svg className="w-3 h-3 mt-1 mr-2 text-text-disabled dark:text-text-disabled-dark group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark group-hover:text-text-primary dark:group-hover:text-text-primary-dark text-[11px] line-clamp-2 leading-tight flex-grow">{sql}</Typography>
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
