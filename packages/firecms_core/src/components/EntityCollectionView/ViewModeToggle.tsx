import React from "react";
import { CollectionSize, ViewMode } from "../../types";
import {
    AppsIcon,
    Button,
    cls,
    ListIcon,
    Popover,
    Select,
    SelectItem,
    ViewColumnIcon,
    ViewKanbanIcon
} from "@firecms/ui";

export type ViewModeToggleProps = {
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    /**
     * Whether Kanban view mode is available for this collection.
     * Should be true when collection.kanban is set with a valid enum property.
     */
    kanbanEnabled?: boolean;
    /**
     * Whether a plugin exists that can configure Kanban (e.g., collection editor).
     * When true, Kanban option is always shown (enabled or not based on kanbanEnabled).
     * When false, Kanban option is shown but disabled.
     */
    hasKanbanConfigPlugin?: boolean;
    /**
     * Current size for card/table views
     */
    size?: CollectionSize;
    /**
     * Callback when size changes
     */
    onSizeChanged?: (size: CollectionSize) => void;
    /**
     * Controlled open state for the popover
     */
    open?: boolean;
    /**
     * Callback when popover open state changes
     */
    onOpenChange?: (open: boolean) => void;
}

export function ViewModeToggle({
    viewMode = "table",
    onViewModeChange,
    kanbanEnabled = false,
    hasKanbanConfigPlugin = false,
    size,
    onSizeChanged,
    open,
    onOpenChange
}: ViewModeToggleProps) {

    if (!onViewModeChange) {
        return null;
    }

    // Get icon for current view mode
    const getViewModeIcon = () => {
        if (viewMode === "kanban") return <ViewKanbanIcon size="small" />;
        if (viewMode === "cards") return <AppsIcon size="small" />;
        return <ListIcon size="small" />;
    };

    const getViewModeName = () => {
        if (viewMode === "kanban") return "Board";
        if (viewMode === "cards") return "Cards";
        return "List";
    };

    const showKanban = kanbanEnabled || hasKanbanConfigPlugin;
    const showSizeSelector = size && onSizeChanged && (viewMode === "table" || viewMode === "cards");

    return (
        <Popover
            open={open}
            onOpenChange={onOpenChange}
            modal={true}
            trigger={
                <Button size="small">
                    {getViewModeIcon()}
                    <span className="ml-1 text-sm">{getViewModeName()}</span>
                </Button>
            }
        >
            <div className="p-3 flex flex-col gap-3 min-w-[240px]">
                {/* View mode toggle buttons */}
                <div className="flex flex-row bg-surface-200 dark:bg-surface-800 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => onViewModeChange("table")}
                        className={cls(
                            "flex-1 flex flex-col items-center gap-1 py-2 px-8 rounded-md transition-colors",
                            viewMode === "table"
                                ? "bg-white dark:bg-surface-950 shadow-sm text-primary dark:text-primary-300"
                                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
                        )}
                    >
                        <ListIcon size="small" />
                        <span className="text-xs font-medium">List</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange("cards")}
                        className={cls(
                            "flex-1 flex flex-col items-center gap-1 py-2 px-8 rounded-md transition-colors",
                            viewMode === "cards"
                                ? "bg-white dark:bg-surface-950 shadow-sm text-primary dark:text-primary-300"
                                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
                        )}
                    >
                        <AppsIcon size="small" />
                        <span className="text-xs font-medium">Cards</span>
                    </button>
                    {showKanban && (
                        <button
                            onClick={() => {
                                if (kanbanEnabled || hasKanbanConfigPlugin) {
                                    onViewModeChange("kanban");
                                }
                            }}
                            disabled={!kanbanEnabled && !hasKanbanConfigPlugin}
                            className={cls(
                                "flex-1 flex flex-col items-center gap-1 py-2 px-8 rounded-md transition-colors",
                                viewMode === "kanban"
                                    ? "bg-white dark:bg-surface-950 shadow-sm text-primary dark:text-primary-300"
                                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700",
                                !kanbanEnabled && !hasKanbanConfigPlugin && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ViewKanbanIcon size="small" />
                            <span className="text-xs font-medium">Board</span>
                        </button>
                    )}
                </div>

                {/* Size selector */}
                {
                    showSizeSelector && (
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                                <ViewColumnIcon size="small" />
                                <span>Size</span>
                            </div>
                            <Select
                                value={size}
                                size="small"
                                className="w-20"
                                onValueChange={(v) => onSizeChanged?.(v as CollectionSize)}
                                renderValue={(v) => <span className="font-medium">{v.toUpperCase()}</span>}
                            >
                                {["xs", "s", "m", "l", "xl"].map((s) => (
                                    <SelectItem key={s} value={s} className="font-medium text-center">
                                        {s.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    )
                }
            </div >
        </Popover >
    );
}
