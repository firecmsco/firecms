import React, { useState } from "react";
import {
    Typography,
    cls,
    defaultBorderMixin,
    Tabs,
    Tab,
    IconButton,
    DeleteIcon
} from "@rebasepro/ui";
import { useTranslation } from "@rebasepro/core";
import { SchemaBrowser } from "./SchemaBrowser";
import { TableInfo } from "./SQLEditor";

export interface Snippet {
    id: string;
    name: string;
    sql: string;
    createdAt: number;
    isFavorite?: boolean;
}

interface SQLEditorSidebarProps {
    onSelectSnippet: (sql: string) => void;
    onTableClick: (tableName: string) => void;
    snippets: Snippet[];
    history: string[];
    onDeleteSnippet: (id: string) => void;
    schemas: Record<string, TableInfo[]>;
    isSchemaLoading: boolean;
    schemaError: string | null;
    onRetrySchema: () => void;
}

export const SQLEditorSidebar = ({
    onSelectSnippet,
    onTableClick,
    snippets,
    history,
    onDeleteSnippet,
    schemas,
    isSchemaLoading,
    schemaError,
    onRetrySchema
}: SQLEditorSidebarProps) => {
    const [activeTab, setActiveTab] = useState<"schema" | "snippets" | "history">("schema");
    const { t } = useTranslation();

    return (
        <div className={cls("flex flex-col h-full w-full bg-white dark:bg-surface-950 border-r", defaultBorderMixin)}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "schema" | "snippets" | "history")} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                <Tab value="schema">{t("studio_sql_sidebar_schema")}</Tab>
                <Tab value="snippets">{t("studio_sql_sidebar_snippets")}</Tab>
                <Tab value="history">{t("studio_sql_sidebar_history")}</Tab>
            </Tabs>

            <div className="flex-grow overflow-hidden relative">
                {activeTab === "schema" && (
                    <SchemaBrowser
                        onTableClick={onTableClick}
                        schemas={schemas}
                        isSchemaLoading={isSchemaLoading}
                        schemaError={schemaError}
                        onRetrySchema={onRetrySchema}
                    />
                )}

                {activeTab === "snippets" && (() => {
                    const favorites = snippets.filter(s => s.isFavorite);
                    const others = snippets.filter(s => !s.isFavorite);

                    return (
                        <div className="flex flex-col h-full">
                            <div className={cls("flex items-center justify-between px-3 py-2 border-b bg-surface-50 dark:bg-surface-900 min-h-[48px]", defaultBorderMixin)}>
                                <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_sidebar_snippets")}</Typography>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
                                {snippets.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_sidebar_no_snippets")}</Typography>
                                    </div>
                                ) : (
                                    <>
                                        {favorites.length > 0 && (
                                            <div className="mb-4">
                                                <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark mb-2 px-1 flex items-center">
                                                    <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                                    Favorites
                                                </Typography>
                                                <div className="space-y-2">
                                                    {favorites.map(snippet => (
                                                        <div
                                                            key={snippet.id}
                                                            className={cls("group p-2 rounded border hover:border-surface-400 dark:hover:border-surface-600 bg-white dark:bg-surface-900 transition-all cursor-pointer relative", defaultBorderMixin)}
                                                            onClick={() => onSelectSnippet(snippet.sql)}
                                                        >
                                                            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-[13px] truncate pr-6">{snippet.name}</Typography>
                                                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[10px] block mt-1 truncate">{snippet.sql}</Typography>
                                                            <IconButton
                                                                size="smallest"
                                                                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-text-disabled hover:text-red-500 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteSnippet(snippet.id);
                                                                }}
                                                            >
                                                                <DeleteIcon size="smallest" />
                                                            </IconButton>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {others.length > 0 && (
                                            <div>
                                                {favorites.length > 0 && (
                                                    <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark mb-2 px-1 mt-4">
                                                        Others
                                                    </Typography>
                                                )}
                                                <div className="space-y-2">
                                                    {others.map(snippet => (
                                                        <div
                                                            key={snippet.id}
                                                            className={cls("group p-2 rounded border hover:border-surface-400 dark:hover:border-surface-600 bg-white dark:bg-surface-900 transition-all cursor-pointer relative", defaultBorderMixin)}
                                                            onClick={() => onSelectSnippet(snippet.sql)}
                                                        >
                                                            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-[13px] truncate pr-6">{snippet.name}</Typography>
                                                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark text-[10px] block mt-1 truncate">{snippet.sql}</Typography>
                                                            <IconButton
                                                                size="smallest"
                                                                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-text-disabled hover:text-red-500 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteSnippet(snippet.id);
                                                                }}
                                                            >
                                                                <DeleteIcon size="smallest" />
                                                            </IconButton>
                                                        </div>
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

                {activeTab === "history" && (
                    <div className="flex flex-col h-full">
                        <div className={cls("flex items-center justify-between px-3 py-2 border-b bg-surface-50 dark:bg-surface-900 min-h-[48px]", defaultBorderMixin)}>
                            <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_sidebar_history")}</Typography>
                        </div>
                        <div className="flex-grow overflow-y-auto p-1 space-y-1 no-scrollbar">
                            {history.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">{t("studio_sql_sidebar_no_history")}</Typography>
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
