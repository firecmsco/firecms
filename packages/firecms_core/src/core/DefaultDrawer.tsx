import React, { useCallback } from "react";

import { useLargeLayout, useNavigationController } from "../hooks";

import { Link, useNavigate } from "react-router-dom";
import { CMSAnalyticsEvent, TopNavigationEntry, TopNavigationResult } from "../types";
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

    const analyticsController = useAnalyticsController();
    const navigation = useNavigationController();

    const tooltipsOpen = drawerHovered && !drawerOpen;
    const largeLayout = useLargeLayout();
    const navigate = useNavigate();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const adminViews = navigationEntries.filter(e => e.type === "admin") ?? [];
    const groupsWithoutAdmin = groups.filter(g => g !== "Admin");

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div className="h-12 w-full"/>;
        return <div
            className="pt-8 pl-6 pr-8 pb-2 flex flex-row items-center">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="font-medium flex-grow line-clamp-1">
                {group ? group.toUpperCase() : "Views".toUpperCase()}
            </Typography>

        </div>;
    }, [drawerOpen]);

    const onClick = (view: TopNavigationEntry) => {
        const eventName: CMSAnalyticsEvent = view.type === "collection"
            ? "drawer_navigate_to_collection"
            : (view.type === "view" ? "drawer_navigate_to_view" : "unmapped_event");
        analyticsController.onAnalyticsEvent?.(eventName, { url: view.url });
        if (!largeLayout)
            closeDrawer();
    };

    return (
        <>
            <div className={cls("flex flex-col h-full relative flex-grow w-full", className)} style={style}>

                <DrawerLogo logo={logo}/>

                <div className={"overflow-scroll no-scrollbar"}>

                    {groupsWithoutAdmin.map((group) => (
                        <React.Fragment
                            key={`drawer_group_${group}`}>
                            {buildGroupHeader(group)}
                            {Object.values(navigationEntries)
                                .filter(e => e.group === group)
                                .map((view, index) =>
                                    <DrawerNavigationItem
                                        key={`navigation_${index}`}
                                        icon={<IconForView collectionOrView={view.collection ?? view.view}/>}
                                        tooltipsOpen={tooltipsOpen}
                                        drawerOpen={drawerOpen}
                                        onClick={() => onClick(view)}
                                        url={view.url}
                                        name={view.name}/>)}
                        </React.Fragment>
                    ))}

                </div>

                {adminViews.length > 0 && <Menu
                    open={adminMenuOpen}
                    onOpenChange={setAdminMenuOpen}
                    trigger={
                        <IconButton
                            shape={"square"}
                            className={"m-4 text-gray-900 dark:text-white w-fit"}>
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
                    {adminViews.map((entry, index) =>
                        <MenuItem
                            onClick={(event) => {
                                event.preventDefault();
                                navigate(entry.path);
                            }}
                            key={`navigation_${index}`}>
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
            padding: drawerOpen ? "32px 144px 0px 24px" : "72px 16px 0px"
        }}
        className={cls("cursor-pointer")}>

        <Tooltip title={"Home"}
                 sideOffset={20}
                 side="right">
            <Link
                to={navigation.basePath}>
                {logo
                    ? <img src={logo}
                           alt="Logo"
                           className={cls("max-w-full max-h-full",
                               drawerOpen ?? "w-[112px] h-[112px]")}/>
                    : <FireCMSLogo/>}

            </Link>
        </Tooltip>
    </div>;
}
