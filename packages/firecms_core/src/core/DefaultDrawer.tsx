import React from "react";

import {
    useCollapsedGroups,
    useLargeLayout,
    useNavigationController,
    useTranslation
} from "../hooks";

import { Link, useNavigate } from "react-router-dom";
import { CMSAnalyticsEvent, NavigationEntry, NavigationResult } from "../types";
import { IconForView } from "../util";
import {
    cls,
    KeyboardDoubleArrowLeftIcon,
    KeyboardDoubleArrowRightIcon,
    Menu,
    MenuItem,
    MoreVertIcon,
    Tooltip,
    Typography
} from "@firecms/ui";
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

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = React.useState(false);
    const handleScroll = () => {
        if (scrollRef.current) {
            setScrolled(scrollRef.current.scrollTop > 0);
        }
    };

    const analyticsController = useAnalyticsController();
    const navigation = useNavigationController();
    const { t } = useTranslation();

    const tooltipsOpen = drawerHovered && !drawerOpen && !adminMenuOpen;
    const largeLayout = useLargeLayout();
    const navigate = useNavigate();

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: NavigationResult = navigation.topLevelNavigation;

    const adminViews = navigationEntries.filter(e => e.type === "admin") ?? [];
    const groupsWithoutAdmin = groups.filter(g => g !== "Admin");

    // Collapsible groups state - using "drawer" namespace for independent state from home page
    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groupsWithoutAdmin, "drawer");

    const drawerVisuallyOpen = drawerOpen || drawerHovered;

    const onItemClick = (view: NavigationEntry) => {
        const eventName: CMSAnalyticsEvent = view.type === "collection"
            ? "drawer_navigate_to_collection"
            : (view.type === "view" ? "drawer_navigate_to_view" : "unmapped_event");
        analyticsController.onAnalyticsEvent?.(eventName, { url: view.url });
        if (!largeLayout)
            closeDrawer();
    };

    return (
        <div role="navigation" aria-label="Main navigation"
             className={cls("flex flex-col h-full relative grow w-full", className)} style={style}>

            <DrawerLogo logo={logo} />

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={"flex-grow min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-2"}
                style={{
                    maskImage: scrolled
                        ? "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)"
                        : "linear-gradient(to bottom, black 0, black calc(100% - 20px), transparent 100%)"
                }}>

                {groupsWithoutAdmin.map((group) => {
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

            {adminViews.length > 0 && <div className={"shrink-0 px-4"}>
                <Menu
                    side={"right"}
                    open={adminMenuOpen}
                    onOpenChange={setAdminMenuOpen}
                    trigger={
                        <div
                            className={cls(
                                "flex flex-row items-center rounded-lg cursor-pointer w-full",
                                "hover:bg-surface-accent-100 dark:hover:bg-surface-800 transition-colors duration-150 h-[30px]"
                            )}>
                            <div
                                className={"shrink-0 flex items-center justify-center w-[44px] h-[30px] text-surface-500 dark:text-surface-400"}>
                                <Tooltip title={"Admin"}
                                         open={tooltipsOpen}
                                         side={"right"} sideOffset={28}>
                                    <MoreVertIcon size={"small"} />
                                </Tooltip>
                            </div>
                            {drawerVisuallyOpen && <div
                                className={cls(
                                    "font-semibold text-[11px] uppercase tracking-wider text-surface-400"
                                )}>
                                {t("admin")}
                            </div>}
                        </div>}
                >
                    {adminViews.map((entry) =>
                        <MenuItem
                            onClick={(event) => {
                                event.preventDefault();
                                navigate(entry.url);
                            }}
                            key={entry.id}>
                            {<IconForView collectionOrView={entry.view} />}
                            {t(entry.name)}
                        </MenuItem>)}

                </Menu>
            </div>}

            <DrawerToggle />
        </div>
    );
}

/**
 * Collapse/expand toggle rendered at the bottom of the drawer.
 * Uses double-chevron icons to indicate direction. Reads the drawer state
 * from {@link useApp} so it can be dropped into any drawer.
 *
 * @group Core
 */
export function DrawerToggle() {
    const {
        drawerOpen,
        drawerHovered,
        openDrawer,
        closeDrawer
    } = useApp();
    const isExpanded = drawerOpen;
    const isHovered = drawerHovered && !drawerOpen;
    const showFullContent = isExpanded || isHovered;

    return (
        <div className="shrink-0 mt-auto px-4 pt-0.5 pb-2">
            <Tooltip
                title={isExpanded ? "Collapse" : "Expand"}
                side="right"
                sideOffset={12}
                open={isHovered ? false : undefined}
            >
                <div
                    className={cls(
                        "flex flex-row items-center rounded-lg cursor-pointer",
                        "hover:bg-surface-accent-100 dark:hover:bg-surface-800",
                        "transition-colors duration-150 h-[30px]"
                    )}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    onClick={() => isExpanded ? closeDrawer() : openDrawer()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            isExpanded ? closeDrawer() : openDrawer();
                        }
                    }}
                >
                    <div className="shrink-0 flex items-center justify-center w-[44px] h-[30px] text-surface-500 dark:text-surface-400">
                        {isExpanded
                            ? <KeyboardDoubleArrowLeftIcon size={"small"} />
                            : <KeyboardDoubleArrowRightIcon size={"small"} />}
                    </div>
                    <div className={cls(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        showFullContent ? "opacity-100 w-auto" : "opacity-0 w-0"
                    )}>
                        <Typography
                            variant="body2"
                            className="text-surface-500 dark:text-surface-400 select-none whitespace-nowrap"
                        >
                            {isExpanded ? "Collapse" : "Expand"}
                        </Typography>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
}

/**
 * This is the logo displayed in the drawer.
 * A compact logo aligned to the left of the drawer header.
 *
 * @param logo
 */
export function DrawerLogo({ logo }: {
    logo?: string;
}) {

    const navigation = useNavigationController();
    return <div className="flex flex-row items-center shrink-0 pt-4 pb-0 px-2">
        <Tooltip title={"Home"}
                 sideOffset={20}
                 side="right">
            <Link
                className={"shrink-0 flex items-center justify-center w-[56px] h-[40px]"}
                to={navigation.basePath}>
                {logo
                    ? <img src={logo}
                           alt="Logo"
                           className={"w-[28px] h-[28px] object-contain"} />
                    : <FireCMSLogo width={"28px"} height={"28px"} />}
            </Link>
        </Tooltip>
    </div>;
}
