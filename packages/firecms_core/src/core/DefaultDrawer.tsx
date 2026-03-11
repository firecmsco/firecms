import React from "react";

import { useCollapsedGroups, useLargeLayout, useNavigationStateController, useCMSUrlController, useAdminModeController, useEffectiveRoleController } from "../hooks";

import { Link, useNavigate } from "react-router-dom";
import { CMSAnalyticsEvent, NavigationEntry, NavigationResult } from "@firecms/types";
import { cls, Tooltip, IconButton, Typography } from "@firecms/ui";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { DrawerNavigationGroup } from "./DrawerNavigationGroup";
import { FireCMSLogo } from "../components";
import { useApp } from "../app/useApp";

/**
 * Default drawer used in the CMS
 * @group Core
 */
export function DefaultDrawer({
    title,
    logo,
    logoDestination,
    className,
    style,
}: {
    title?: React.ReactNode;
    logo?: string;
    logoDestination?: string;
    className?: string;
    style?: React.CSSProperties;
}) {

    const {
        drawerHovered,
        drawerOpen,
        openDrawer,
        closeDrawer,
        closeHover,
        logo: appLogo
    } = useApp();

    const resolvedLogo = logo ?? appLogo;

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

                <DrawerHeader 
                    logo={resolvedLogo} 
                    title={title} 
                    logoDestination={logoDestination}
                    drawerOpen={drawerOpen} 
                    drawerHovered={drawerHovered} 
                    openDrawer={openDrawer} 
                    closeDrawer={closeDrawer} 
                />

                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={"mt-3 flex-grow overflow-scroll no-scrollbar"}
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
 * This is the header displayed in the drawer
 * It mimics Google Cloud Sidebar behavior with the integrated hamburger toggle.
 */
import { MenuIcon, MenuOpenIcon, CloseIcon } from "@firecms/ui";

export function DrawerHeader({ 
    logo, 
    title,
    logoDestination,
    drawerOpen,
    drawerHovered,
    openDrawer,
    closeDrawer 
}: {
    logo?: string;
    title?: React.ReactNode;
    logoDestination?: string;
    drawerOpen: boolean;
    drawerHovered: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
}) {

    const urlController = useCMSUrlController();
    
    // States:
    // 1. Expanded (drawerOpen) -> Show MenuOpenIcon or CloseIcon, Show Logo, Show Title
    // 2. Collapsed & Hovered (drawerHovered & !drawerOpen) -> Show MenuIcon, Show Logo, Show Title
    // 3. Collapsed (!drawerHovered & !drawerOpen) -> Show MenuIcon, Hide Logo, Hide Title
    
    const isExpanded = drawerOpen;
    const isHovered = drawerHovered && !drawerOpen;
    const isFloating = isHovered;
    const showFullContent = isExpanded || isHovered;

    return (
        <div className="flex flex-row items-center shrink-0 pt-2 px-2 pb-0">
            {/* Hamburger Toggle */}
            <Tooltip 
                title={isExpanded ? "Close menu" : "Open menu"}
                side="right"
                sideOffset={12}
                asChild={true}
                open={isFloating ? false : undefined}
            >
                <div className="shrink-0 flex items-center justify-center w-[56px] h-[48px]">
                    <IconButton
                        color="inherit"
                        aria-label="Toggle menu"
                        onClick={() => isExpanded ? closeDrawer() : openDrawer()}
                    >
                        {isExpanded ? <CloseIcon size="small" /> : <MenuIcon size="small" />}
                    </IconButton>
                </div>
            </Tooltip>

            {/* Logo and Title (Fades in when expanded or hovered) */}
            <div 
                className={cls(
                    "flex flex-row items-center gap-3 ml-2 overflow-hidden transition-all duration-200 ease-in-out",
                    showFullContent ? "opacity-100 w-full" : "opacity-0 w-0"
                )}
            >
                <Link
                    className="flex shrink-0 transition-all w-[32px] h-[32px]"
                    to={logoDestination || urlController.basePath}
                >
                    {logo
                        ? <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        : <FireCMSLogo width="32px" height="32px" />
                    }
                </Link>

                {title && (
                    <Link
                        className="visited:text-inherit dark:visited:text-inherit block truncate"
                        to={logoDestination || urlController.basePath}
                    >
                        {typeof title === "string" 
                            ? <Typography variant="subtitle1" noWrap className="truncate">{title}</Typography>
                            : title
                        }
                    </Link>
                )}
            </div>
        </div>
    );
}
