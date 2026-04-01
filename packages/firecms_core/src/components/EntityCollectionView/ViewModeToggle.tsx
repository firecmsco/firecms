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
import { useTranslation } from "../../hooks/useTranslation";

export type KanbanPropertyOption = {
    key: string;
    label: string;
};

export type ViewModeToggleProps = {
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    /**
     * Which view modes are enabled for this collection.
     * Only these modes will appear in the toggle.
     * Defaults to all three: ["table", "cards", "kanban"].
     */
    enabledViews?: ViewMode[];
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

const ALL_VIEW_MODES: ViewMode[] = ["table", "cards", "kanban"];

export function ViewModeToggle({
    viewMode = "table",
    onViewModeChange,
    enabledViews = ALL_VIEW_MODES,
    size,
    onSizeChanged,
    open,
    onOpenChange,
    kanbanPropertyOptions,
    selectedKanbanProperty,
    onKanbanPropertyChange
}: ViewModeToggleProps) {

    const { t } = useTranslation();

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
        if (viewMode === "kanban") return t("board");
        if (viewMode === "cards") return t("cards");
        return t("list");
    };

    const showSizeSelector = size && onSizeChanged && (viewMode === "table" || viewMode === "cards");
    const showKanbanPropertySelector = viewMode === "kanban" &&
        kanbanPropertyOptions &&
        kanbanPropertyOptions.length > 0 &&
        onKanbanPropertyChange;

    // Build toggle options based on enabledViews
    const viewModeOptions: ToggleButtonOption<ViewMode>[] = useMemo(() => {
        const allOptions: ToggleButtonOption<ViewMode>[] = [
            {
                value: "table",
                label: t("list"),
                icon: <ListIcon size="small" />
            },
            {
                value: "cards",
                label: t("cards"),
                icon: <AppsIcon size="small" />
            },
            {
                value: "kanban",
                label: t("board"),
                icon: <ViewKanbanIcon size="small" />
            }
        ];

        return allOptions.filter(option => enabledViews.includes(option.value));
    }, [enabledViews]);

    // Don't render if only one view is enabled
    if (viewModeOptions.length <= 1 && !showSizeSelector) {
        return null;
    }

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
                {viewModeOptions.length > 1 && (
                    <ToggleButtonGroup
                        value={viewMode}
                        onValueChange={onViewModeChange}
                        options={viewModeOptions}
                    />
                )}

                {/* Size selector */}
                {showSizeSelector && (
                    <div className="flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                            <ViewColumnIcon size="small" />
                            <span>{t("size_label")}</span>
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
                            <span>{t("group_by")}</span>
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
