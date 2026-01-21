import React, { useMemo } from "react";
import { CollectionSize, ViewMode } from "../../types";
import {
    AppsIcon,
    Button,
    ListIcon,
    Popover,
    Select,
    SelectItem,
    ToggleButtonGroup,
    ToggleButtonOption,
    ViewColumnIcon,
    ViewKanbanIcon
} from "@firecms/ui";

export type KanbanPropertyOption = {
    key: string;
    label: string;
};

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
    /**
     * Available properties that can be used for kanban columns (enum properties)
     */
    kanbanPropertyOptions?: KanbanPropertyOption[];
    /**
     * Currently selected property for kanban columns
     */
    selectedKanbanProperty?: string;
    /**
     * Callback when the kanban column property changes
     */
    onKanbanPropertyChange?: (property: string) => void;
}

export function ViewModeToggle({
    viewMode = "table",
    onViewModeChange,
    kanbanEnabled = false,
    hasKanbanConfigPlugin = false,
    size,
    onSizeChanged,
    open,
    onOpenChange,
    kanbanPropertyOptions,
    selectedKanbanProperty,
    onKanbanPropertyChange
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
    const showKanbanPropertySelector = viewMode === "kanban" &&
        kanbanPropertyOptions &&
        kanbanPropertyOptions.length > 0 &&
        onKanbanPropertyChange;

    // Build toggle options dynamically based on kanban availability
    const viewModeOptions: ToggleButtonOption<ViewMode>[] = useMemo(() => {
        const options: ToggleButtonOption<ViewMode>[] = [
            {
                value: "table",
                label: "List",
                icon: <ListIcon size="small" />
            },
            {
                value: "cards",
                label: "Cards",
                icon: <AppsIcon size="small" />
            }
        ];

        if (showKanban) {
            options.push({
                value: "kanban",
                label: "Board",
                icon: <ViewKanbanIcon size="small" />,
                disabled: !kanbanEnabled && !hasKanbanConfigPlugin
            });
        }

        return options;
    }, [showKanban, kanbanEnabled, hasKanbanConfigPlugin]);

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
                {/* View mode toggle using ToggleButtonGroup */}
                <ToggleButtonGroup
                    value={viewMode}
                    onValueChange={onViewModeChange}
                    options={viewModeOptions}
                />

                {/* Size selector */}
                {showSizeSelector && (
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
                )}

                {/* Kanban column property selector */}
                {showKanbanPropertySelector && (
                    <div className="flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                            <ViewKanbanIcon size="small" />
                            <span>Group by</span>
                        </div>
                        <Select
                            value={selectedKanbanProperty}
                            size="small"
                            className="w-32"
                            onValueChange={(v) => onKanbanPropertyChange?.(v)}
                            renderValue={(v) => {
                                const option = kanbanPropertyOptions?.find(o => o.key === v);
                                return <span className="font-medium truncate">{option?.label ?? v}</span>;
                            }}
                        >
                            {kanbanPropertyOptions?.map((option) => (
                                <SelectItem key={option.key} value={option.key}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                )}
            </div>
        </Popover>
    );
}

