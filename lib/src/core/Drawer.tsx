import React, { useCallback } from "react";

import { NavLink } from "react-router-dom";
import {
    Box,
    darken,
    lighten,
    List,
    ListItem,
    SvgIconTypeMap,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { useFireCMSContext, useNavigationContext } from "../hooks";
import {
    CMSAnalyticsEvent,
    TopNavigationEntry,
    TopNavigationResult
} from "../types";
import { getIconForView } from "./util";
import { grey } from "@mui/material/colors";
import TTypography from "../migrated/TTypography";

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
        if (!drawerOpen) return <Box className="h-4"/>;
        return <Box pt={2} pl={2} pr={2} pb={0.5}
                    className="flex flex-row items-center">
            <TTypography variant={"caption"}
                         color={"textSecondary"}
                         className="weight-500 flex-grow">
                {group ? group.toUpperCase() : "Ungrouped views".toUpperCase()}
            </TTypography>

        </Box>;
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
    const icon = <Icon fontSize={"medium"}
                       className={`text-${theme.palette.mode === 'dark' ? 'gray-500' : 'gray-700'}`}/>;
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
