import React from "react";

import { useCollapsedGroups, useLargeLayout, useNavigationStateController, useCMSUrlController, useAdminModeController, useEffectiveRoleController } from "../hooks";

import { Link, useNavigate } from "react-router-dom";
import { CMSAnalyticsEvent, NavigationEntry, NavigationResult } from "@firecms/types";
import { cls, Tooltip } from "@firecms/ui";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { DrawerNavigationGroup } from "./DrawerNavigationGroup";
import { FireCMSLogo } from "../components";
import { useApp } from "../app/useApp";

/**
 * Default drawer used in the CMS
 * @group Core
 */
export function DefaultDrawer({
    className,
    style,
}: {
    className?: string
    style?: React.CSSProperties,
}) {

    const {
        drawerHovered,
        drawerOpen,
        closeDrawer,
        logo
    } = useApp();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    const analyticsController = useAnalyticsController();
    const navigationState = useNavigationStateController();

    const tooltipsOpen = drawerHovered && !drawerOpen && !adminMenuOpen;
    const largeLayout = useLargeLayout();
    const navigate = useNavigate();
    const adminModeController = useAdminModeController();
    const effectiveRoleController = useEffectiveRoleController();

    if (!navigationState.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: NavigationResult = navigationState.topLevelNavigation;

    const adminViews = navigationEntries.filter(e => e.type === "admin") ?? [];

    let groupsToRender = groups;
    if (adminModeController.mode === "studio") {
        groupsToRender = groups.filter(g => g === "Database" || g === "Schema" || g === "Admin");
    } else {
        groupsToRender = groups.filter(g => g !== "Database" && g !== "Schema");
    }

    // Collapsible groups state - using "drawer" namespace for independent state from home page
    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groupsToRender, "drawer");

    const onItemClick = (view: NavigationEntry) => {
        const eventName: CMSAnalyticsEvent = view.type === "collection"
            ? "drawer_navigate_to_collection"
            : (view.type === "view" ? "drawer_navigate_to_view" : "unmapped_event");
        analyticsController.onAnalyticsEvent?.(eventName, { url: view.url });
        if (!largeLayout)
            closeDrawer();
    };

    return (
        <>
            <div className={cls("flex flex-col h-full relative grow w-full", className)} style={style}>

                <DrawerLogo logo={logo} />

                <div className={"mt-4 flex-grow overflow-scroll no-scrollbar"}
                    style={{
                        maskImage: "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)",
                    }}>

                    {groupsToRender.map((group) => {
                        const entriesInGroup = Object.values(navigationEntries).filter(e => e.group === group);
                        return (
                            <DrawerNavigationGroup
                                key={`drawer_group_${group}`}
                                group={group}
                                entries={entriesInGroup}
                                collapsed={isGroupCollapsed(group)}
                                onToggleCollapsed={() => toggleGroupCollapsed(group)}
                                drawerOpen={drawerOpen}
                                tooltipsOpen={tooltipsOpen}
                                adminMenuOpen={adminMenuOpen}
                                onItemClick={onItemClick}
                            />
                        );
                    })}

                </div>
            </div >

        </>
    );
}

/**
 * This is the logo displayed in the drawer
 * It expands when the drawer is open.
 *
 * @param logo
 
 */
export function DrawerLogo({ logo }: {
    logo?: string;
}) {

    const urlController = useCMSUrlController();
    const { drawerOpen } = useApp();
    return <div
        style={{
            transition: "padding 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
            padding: drawerOpen ? "32px 144px 0px 24px" : "72px 12px 0px 12px"
        }}
        className={cls("cursor-pointer rounded-xs ml-3 mr-1")}>

        <Tooltip title={"Home"}
            sideOffset={20}
            side="right">
            <Link
                className={"block"}
                to={urlController.basePath}>
                {logo
                    ? <img src={logo}
                        alt="Logo"
                        className={cls("max-w-full max-h-full transition-all object-contain",
                            drawerOpen ? "w-[96px] h-[96px]" : "w-[32px] h-[32px]")} />
                    : <FireCMSLogo />}

            </Link>
        </Tooltip>
    </div>;
}
