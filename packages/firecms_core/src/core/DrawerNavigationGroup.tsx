import React from "react";
import { cls, ExpandMoreIcon, Typography } from "@rebase/ui";
import { NavigationEntry } from "@rebase/types";
import { IconForView } from "../util";
import { DrawerNavigationItem } from "./DrawerNavigationItem";

export interface DrawerNavigationGroupProps {
    /**
     * Group name to display in header
     */
    group: string;
    /**
     * Navigation entries in this group
     */
    entries: NavigationEntry[];
    /**
     * Whether the group is collapsed
     */
    collapsed: boolean;
    /**
     * Callback when collapse state should toggle
     */
    onToggleCollapsed: () => void;
    /**
     * Whether the drawer is in open (expanded) state
     */
    drawerOpen: boolean;
    /**
     * Whether tooltips should be shown (drawer closed + hovered)
     */
    tooltipsOpen: boolean;
    /**
     * Whether admin menu is open (used to control tooltip visibility)
     */
    adminMenuOpen?: boolean;
    /**
     * Optional actions to render in the group header (e.g., "Add collection" button)
     */
    headerActions?: React.ReactNode;
    /**
     * Optional callback when a navigation item is clicked
     */
    onItemClick?: (entry: NavigationEntry) => void;
}

/**
 * Shared drawer navigation group component used by both DefaultDrawer and RebaseCloudDrawer.
 * Renders a collapsible group with header and navigation items.
 */
export function DrawerNavigationGroup({
    group,
    entries,
    collapsed,
    onToggleCollapsed,
    drawerOpen,
    tooltipsOpen,
    adminMenuOpen,
    headerActions,
    onItemClick
}: DrawerNavigationGroupProps) {
    return (
        <div
            className={"my-2 mx-2 flex flex-col"}
            key={`drawer_group_${group}`}
        >
            {/* Group Header */}
            <div
                className={cls("pl-4 pr-2 py-1 flex flex-row items-center transition-colors",
                    drawerOpen ? "cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-t-lg bg-surface-50 dark:bg-surface-800/30" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={drawerOpen ? onToggleCollapsed : undefined}
            >
                <ExpandMoreIcon
                    size={"smallest"}
                    className={cls(
                        "text-surface-500 dark:text-surface-400 transition-transform duration-200 mr-1",
                        collapsed ? "-rotate-90" : "rotate-0"
                    )}
                />
                <Typography
                    variant={"caption"}
                    color={"secondary"}
                    className="font-medium flex-grow line-clamp-1"
                >
                    {(group || "Views").toUpperCase()}
                </Typography>
                {headerActions && (
                    <div onClick={(e) => e.stopPropagation()}>
                        {headerActions}
                    </div>
                )}
            </div>

            {/* Collapsible Content */}
            <div
                className={cls(
                    "overflow-hidden transition-all duration-200 ease-in-out bg-surface-50 dark:bg-surface-800/30",
                    drawerOpen ? "rounded-b-lg" : "rounded-lg",
                    collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
                )}
            >
                {entries.map((entry) => (
                    <DrawerNavigationItem
                        key={entry.id}
                        icon={<IconForView collectionOrView={entry.collection ?? entry.view} size={18} />}
                        tooltipsOpen={!collapsed && tooltipsOpen}
                        adminMenuOpen={adminMenuOpen}
                        drawerOpen={drawerOpen}
                        onClick={() => onItemClick?.(entry)}
                        url={entry.url}
                        name={entry.name}
                    />
                ))}
            </div>
        </div>
    );
}
