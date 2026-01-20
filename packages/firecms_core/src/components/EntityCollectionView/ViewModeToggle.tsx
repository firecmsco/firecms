import React from "react";
import { ViewMode } from "../../types";
import {
    AppsIcon,
    Button,
    ListIcon,
    Menu,
    MenuItem,
    Tooltip,
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
}

export function ViewModeToggle({
    viewMode = "table",
    onViewModeChange,
    kanbanEnabled = false,
    hasKanbanConfigPlugin = false
}: ViewModeToggleProps) {
    const [menuOpen, setMenuOpen] = React.useState(false);

    if (!onViewModeChange) {
        return null;
    }

    // Get icon for current view mode
    const getViewModeIcon = () => {
        if (viewMode === "kanban") return <ViewKanbanIcon size="small" />;
        if (viewMode === "cards") return <AppsIcon size="small" />;
        return <ListIcon size="small" />;
    };

    return (
        <Tooltip title="Change view mode" open={menuOpen ? false : undefined}>
            <Menu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                trigger={
                    <Button size="small">
                        {getViewModeIcon()}
                    </Button>
                }
            >
                <MenuItem
                    dense={true}
                    onClick={() => onViewModeChange("table")}
                >
                    <ListIcon size="smallest" className="mr-1" />
                    Table view
                </MenuItem>
                <MenuItem
                    dense={true}
                    onClick={() => onViewModeChange("cards")}
                >
                    <AppsIcon size="smallest" className="mr-1" />
                    Card view
                </MenuItem>
                <MenuItem
                    dense={true}
                    disabled={!hasKanbanConfigPlugin && !kanbanEnabled}
                    onClick={() => {
                        if (kanbanEnabled || hasKanbanConfigPlugin) {
                            onViewModeChange("kanban");
                        }
                    }}
                >
                    <ViewKanbanIcon size="smallest" className="mr-1" />
                    Kanban view
                </MenuItem>
            </Menu>
        </Tooltip>
    );
}
