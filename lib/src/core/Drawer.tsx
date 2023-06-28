import React, { useCallback } from "react";

import { useLargeLayout } from "../hooks/useLargeLayout";

import { NavLink } from "react-router-dom";
import { SvgIconTypeMap, Tooltip } from "@mui/material";
import { useFireCMSContext, useNavigationContext } from "../hooks";
import { CMSAnalyticsEvent, TopNavigationEntry, TopNavigationResult } from "../types";
import { getIconForView } from "./util";
import Typography from "../components/Typography";
import clsx from "clsx";

/**
 * Props used in case you need to override the default drawer
 * @category Core
 */
export type DrawerProps<T = {}> = T & {
    hovered: boolean,
    drawerOpen: boolean,
    closeDrawer: () => any,
}

/**
 * Default drawer used in the CMS
 * @category Core
 */
export function Drawer({
                           hovered,
                           drawerOpen,
                           closeDrawer
                       }: DrawerProps) {

    const context = useFireCMSContext();
    const navigation = useNavigationContext();

    const tooltipsOpen = hovered && !drawerOpen;
    const largeLayout = useLargeLayout();

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div className="h-4"/>;
        return <div
            className="pt-8 pl-6 pr-8 pb-2 flex flex-row items-center">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="weight-500 flex-grow">
                {group ? group.toUpperCase() : "Ungrouped views".toUpperCase()}
            </Typography>

        </div>;
    }, [drawerOpen]);

    const onClick = (view: TopNavigationEntry) => {
        const eventName: CMSAnalyticsEvent = view.type === "collection"
            ? "drawer_navigate_to_collection"
            : (view.type === "view" ? "drawer_navigate_to_view" : "unmapped_event");
        context.onAnalyticsEvent?.(eventName, { url: view.url });
        if (!largeLayout)
            closeDrawer();
    };

    return (
        <>

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    {buildGroupHeader(group)}
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) =>
                            <DrawerNavigationItem
                                key={`navigation_${index}`}
                                Icon={getIconForView(view.collection ?? view.view)}
                                tooltipsOpen={tooltipsOpen}
                                drawerOpen={drawerOpen}
                                onClick={() => onClick(view)}
                                url={view.url}
                                name={view.name}/>)}
                </React.Fragment>
            ))}

            {ungroupedNavigationViews.length > 0 && buildGroupHeader()}

            {ungroupedNavigationViews.map((view, index) => {

                return <DrawerNavigationItem
                    key={`navigation_${index}`}
                    Icon={getIconForView(view.collection ?? view.view)}
                    tooltipsOpen={tooltipsOpen}
                    onClick={() => onClick(view)}
                    drawerOpen={drawerOpen}
                    url={view.url}
                    name={view.name}/>;
            })}

        </>
    );
}

export function DrawerNavigationItem({
                                         name,
                                         Icon,
                                         drawerOpen,
                                         tooltipsOpen,
                                         url,
                                         onClick
                                     }: {
    Icon: React.ComponentType<SvgIconTypeMap["props"]>,
    name: string,
    tooltipsOpen: boolean,
    drawerOpen: boolean,
    url: string,
    onClick?: () => void,
}) {

    const icon = <div
        className={"text-gray-600 dark:text-gray-500"}>
        <Icon fontSize={"medium"}/>
    </div>;

    const listItem = <NavLink
        onClick={onClick}
        className={({ isActive }: any) => clsx("rounded-r-xl truncate",
            "hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75 text-gray-800 dark:text-gray-200",
            "flex flex-row items-center w-full mr-8",
            drawerOpen ? "pl-8 h-12" : "pl-6 h-11",
            "font-medium text-sm",
            isActive ? "bg-gray-100 dark:bg-gray-800" : ""
        )}
        to={url}
    >

        {icon}

        <div
            // variant={"inherit"}
            className={clsx(
                drawerOpen ? "opacity-100" : "opacity-0 hidden",
                "ml-4 font-inherit text-inherit"
            )}>
            {name.toUpperCase()}
        </div>
    </NavLink>;

    return listItem;
    if (drawerOpen)
        return listItem;
    else
        return <Tooltip
            open={tooltipsOpen}
            placement="right"
            title={name}>
            {listItem}
        </Tooltip>;
}
