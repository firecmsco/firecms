import React, { useCallback } from "react";

import { NavLink } from "react-router-dom";
import { darken, lighten, List, ListItem, SvgIconTypeMap, Tooltip, useTheme } from "@mui/material";
import { useFireCMSContext, useNavigationContext } from "../hooks";
import { CMSAnalyticsEvent, TopNavigationEntry, TopNavigationResult } from "../types";
import { getIconForView } from "./util";
import TTypography from "../components/TTypography";

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
                    className="pt-8 pl-8 pr-8 pb-2 flex flex-row items-center">
            <TTypography variant={"caption"}
                         color={"secondary"}
                         className="weight-500 flex-grow">
                {group ? group.toUpperCase() : "Ungrouped views".toUpperCase()}
            </TTypography>

        </div>;
    }, [drawerOpen]);

    const onClick = (view: TopNavigationEntry) => {
        const eventName: CMSAnalyticsEvent = view.type === "collection"
            ? "drawer_navigate_to_collection"
            : (view.type === "view" ? "drawer_navigate_to_view" : "unmapped_event");
        context.onAnalyticsEvent?.(eventName, { url: view.url });
    };

    return (
        <List>

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

        </List>
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

    const theme = useTheme();
    const icon = <div
        className={"text-gray-700 dark:text-gray-500"}>
        <Icon fontSize={"medium"}/>
    </div>;
    const listItem = <ListItem
        // @ts-ignore
        button
        component={NavLink}
        onClick={onClick}
        // @ts-ignore
        style={({ isActive }) => ({
            fontWeight: isActive ? "600" : "500",
            background: isActive
                ? (theme.palette.mode === "light"
                    ? darken(theme.palette.background.default, 0.1)
                    : lighten(theme.palette.background.default, 0.08))
                : "inherit",
            minHeight: "48px",
            borderRadius: "0 16px 16px 0"
        })}
        className="pl-12 items-center"
        to={url}
    >

        {icon}

        <TTypography
            variant={"subtitle2"}
            className={`${
                drawerOpen ? "opacity-100" : "opacity-0"
            } font-inherit ml-3 p-1`}>
            {name.toUpperCase()}
        </TTypography>
    </ListItem>;

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
