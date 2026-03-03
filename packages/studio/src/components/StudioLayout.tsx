import React, { useState, useCallback, useEffect } from "react";
import {
    cls,
    defaultBorderMixin,
    Typography,
    Tooltip,
    StorageIcon,
    TerminalIcon,
    SecurityIcon
} from "@firecms/ui";
import { SQLEditor } from "../components/SQLEditor/SQLEditor";
import { RLSEditor } from "../components/RLSEditor/RLSEditor";

const STORAGE_KEY = "firecms_studio_active_view";

export type StudioView = "sql" | "rls" | "schema";

interface StudioNavItem {
    key: StudioView;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const NAV_ITEMS: StudioNavItem[] = [
    {
        key: "sql",
        label: "SQL",
        icon: <TerminalIcon size="small" />,
        description: "Execute SQL queries"
    },
    {
        key: "rls",
        label: "RLS",
        icon: <SecurityIcon size="small" />,
        description: "Row Level Security"
    },
    {
        key: "schema",
        label: "Schema",
        icon: <StorageIcon size="small" />,
        description: "Collection designer"
    }
];

export interface StudioLayoutProps {
    /**
     * Optional: provide a custom schema/collection view.
     * If not provided, the Schema tab will show a placeholder.
     */
    schemaView?: React.ReactNode;

    /**
     * Optional: provide extra nav items to append to the sidebar.
     */
    extraNavItems?: {
        key: string;
        label: string;
        icon: React.ReactNode;
        description: string;
        view: React.ReactNode;
    }[];
}

export function StudioLayout({
    schemaView,
    extraNavItems
}: StudioLayoutProps) {

    const [activeView, setActiveView] = useState<string>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && (["sql", "rls", "schema"].includes(saved) || extraNavItems?.find(i => i.key === saved))) {
                return saved;
            }
        } catch (_) { }
        return "sql";
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, activeView);
        } catch (_) { }
    }, [activeView]);

    const allNavItems: { key: string; label: string; icon: React.ReactNode; description: string }[] = [
        ...NAV_ITEMS,
        ...(extraNavItems?.map(e => ({ key: e.key, label: e.label, icon: e.icon, description: e.description })) || [])
    ];

    const renderContent = useCallback(() => {
        switch (activeView) {
            case "sql":
                return <SQLEditor />;
            case "rls":
                return <RLSEditor />;
            case "schema":
                return schemaView || (
                    <div className="flex items-center justify-center h-full text-text-disabled dark:text-text-disabled-dark">
                        <Typography variant="body2">Schema editor not configured</Typography>
                    </div>
                );
            default: {
                const extra = extraNavItems?.find(i => i.key === activeView);
                if (extra) return extra.view;
                return null;
            }
        }
    }, [activeView, schemaView, extraNavItems]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-white dark:bg-surface-950">
            {/* Sidebar rail */}
            <div
                className={cls(
                    "flex flex-col items-center py-2 px-1 gap-1 shrink-0 border-r bg-surface-50 dark:bg-surface-900",
                    defaultBorderMixin
                )}
                style={{ width: 56 }}
            >
                {allNavItems.map(item => {
                    const isActive = activeView === item.key;
                    return (
                        <Tooltip key={item.key} title={item.description} side="right">
                            <button
                                onClick={() => setActiveView(item.key)}
                                className={cls(
                                    "flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                                        : "text-text-secondary dark:text-text-secondary-dark hover:bg-surface-200 dark:hover:bg-surface-800"
                                )}
                            >
                                {item.icon}
                                <span className="text-[9px] mt-0.5 leading-none">{item.label}</span>
                            </button>
                        </Tooltip>
                    );
                })}
            </div>

            {/* Main content */}
            <div className="flex-grow min-w-0 h-full">
                {renderContent()}
            </div>
        </div>
    );
}
