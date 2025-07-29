import React, { useCallback } from "react";

import { useLargeLayout, useNavigationController } from "../hooks";

import { Link, useNavigate } from "react-router-dom";
import { CMSAnalyticsEvent, NavigationEntry, NavigationResult } from "../types";
import { IconForView } from "../util";
import { cls, IconButton, Menu, MenuItem, MoreVertIcon, Tooltip, Typography } from "@firecms/ui";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { DrawerNavigationItem } from "./DrawerNavigationItem";
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
    const navigation = useNavigationController();

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

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div className="w-full"/>;
        return <div
            className="pl-6 pr-8 py-4 flex flex-row items-center">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="font-medium grow line-clamp-1">
                {group ? group.toUpperCase() : "Views".toUpperCase()}
            </Typography>

        </div>;
    }, [drawerOpen]);

    const onClick = (view: NavigationEntry) => {
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

                <DrawerLogo logo={logo}/>

                <div className={"mt-4 grow overflow-scroll no-scrollbar"}
                     style={{
                         maskImage: "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)",
                     }}>

                    {groupsWithoutAdmin.map((group) => (
                        <div
                            className={"bg-surface-50 dark:bg-surface-800/30 my-4 rounded-lg ml-3 mr-1"}
                            key={`drawer_group_${group}`}>
                            {buildGroupHeader(group)}
                            {Object.values(navigationEntries)
                                .filter(e => e.group === group)
                                .map((view) =>
                                    <DrawerNavigationItem
                                        key={view.id}
                                        icon={<IconForView collectionOrView={view.collection ?? view.view}
                                                           size={"small"}/>}
                                        tooltipsOpen={tooltipsOpen}
                                        adminMenuOpen={adminMenuOpen}
                                        drawerOpen={drawerOpen}
                                        onClick={() => onClick(view)}
                                        url={view.url}
                                        name={view.name}/>)}
                        </div>
                    ))}

                </div>

                {adminViews.length > 0 && <Menu
                    side={"right"}
                    open={adminMenuOpen}
                    onOpenChange={setAdminMenuOpen}
                    trigger={
                        <IconButton
                            shape={"square"}
                            className={"m-4 text-surface-900 dark:text-white w-fit"}>
                            <Tooltip title={"Admin"}
                                     open={tooltipsOpen}
                                     side={"right"} sideOffset={28}>
                                <MoreVertIcon/>
                            </Tooltip>
                            {drawerOpen && <div
                                className={cls(
                                    drawerOpen ? "opacity-100" : "opacity-0 hidden",
                                    "mx-4 font-inherit text-inherit"
                                )}>
                                ADMIN
                            </div>}
                        </IconButton>}
                >
                    {adminViews.map((entry) =>
                        <MenuItem
                            onClick={(event) => {
                                event.preventDefault();
                                navigate(entry.url); // Consistent use of entry.url for navigation
                            }}
                            key={entry.id}>
                            {<IconForView collectionOrView={entry.view}/>}
                            {entry.name}
                        </MenuItem>)}

                </Menu>}
            </div>

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

    const navigation = useNavigationController();
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
                to={navigation.basePath}>
                {logo
                    ? <img src={logo}
                           alt="Logo"
                           className={cls("max-w-full max-h-full transition-all object-contain",
                               drawerOpen ? "w-[96px] h-[96px]" : "w-[32px] h-[32px]")}/>
                    : <FireCMSLogo/>}

            </Link>
        </Tooltip>
    </div>;
}
