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
        closeHover,
        logo
    } = useApp();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = React.useState(false);

    const handleScroll = () => {
        if (scrollRef.current) {
            setScrolled(scrollRef.current.scrollTop > 0);
        }
    };

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
        if (!largeLayout) {
            closeDrawer();
        } else if (!drawerOpen) {
            closeHover();
        }
    };

    const isStudioDark = adminModeController.mode === "studio";
    const drawerVisuallyOpen = drawerOpen || drawerHovered;

    return (
        <>
            <div className={cls("flex flex-col h-full relative grow w-full", isStudioDark ? "dark:bg-surface-950" : "", className)} style={style}>

                <DrawerLogo logo={logo} />

                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={"mt-[72px] flex-grow overflow-scroll no-scrollbar"}
                    style={{
                        maskImage: scrolled 
                            ? "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)"
                            : "linear-gradient(to bottom, black 0, black calc(100% - 20px), transparent 100%)",
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
                                drawerOpen={drawerVisuallyOpen}
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
    return <div
        className={cls("cursor-pointer rounded-xs flex w-[72px] justify-center pt-5")}>

        <Tooltip title={"Home"}
            sideOffset={20}
            side="right">
            <Link
                className={cls("block transition-all w-[32px] h-[32px]")}
                to={urlController.basePath}>
                {logo
                    ? <img src={logo}
                        alt="Logo"
                        className={cls("w-full h-full object-contain")} />
                    : <FireCMSLogo />}

            </Link>
        </Tooltip>
    </div>;
}
