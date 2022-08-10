import React, { useCallback } from "react";

import { NavLink } from "react-router-dom";
import {
    Box,
    List,
    ListItem,
    SvgIconTypeMap,
    Tooltip,
    Typography
} from "@mui/material";
import { useNavigationContext } from "../hooks";
import HomeIcon from "@mui/icons-material/Home";
import { TopNavigationResult } from "../models";
import { getIconForView } from "./util";
import { grey } from "@mui/material/colors";

/**
 * Props used in case you need to override the default drawer
 * @category Core
 */
export type DrawerProps<T = {}> = T & {
    logo: string | undefined,
    drawerOpen: boolean,
    closeDrawer: () => any,
}

/**
 * Default drawer used in the CMS
 * @category Core
 */
export function Drawer({
                           drawerOpen,
                           closeDrawer
                       }: DrawerProps) {

    const navigation = useNavigationContext();

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const [tooltipsOpen, setTooltipsOpen] = React.useState(false);

    const handleClose = () => {
        setTooltipsOpen(false);
    };

    const handleOpen = () => {
        setTooltipsOpen(true);
    };

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    const buildNavigationListItem = useCallback((index: number, Icon: React.ComponentType<SvgIconTypeMap["props"]>, url: string, name: string) => {

        const icon = <Icon fontSize={"medium"}
                           sx={theme => ({ color: theme.palette.mode === "dark" ? grey[500] : grey[700] })}/>;
        const listItem = <ListItem
            // @ts-ignore
            button
            key={`navigation_${index}`}
            component={NavLink}
            // onClick={closeDrawer}
            // @ts-ignore
            style={({ isActive }) => ({
                fontWeight: isActive ? "600" : "500",
                background: isActive ? "rgba(128,128,128,0.1)" : "inherit",
                minHeight: "48px",
                borderRadius: "0 16px 16px 0"
            })}
            sx={{
                pl: 3,
                alignItems: "center"
            }}
            to={url}
        >

            {icon}

            <Typography
                variant={"subtitle2"}
                sx={{
                    opacity: drawerOpen ? 1.0 : 0.0,
                    fontWeight: "inherit",
                    ml: 3,
                    p: 0.5
                }}>
                {name.toUpperCase()}
            </Typography>
        </ListItem>;
        if (drawerOpen)
            return listItem;
        else
            return <Tooltip
                open={tooltipsOpen}
                onClose={handleClose}
                onOpen={handleOpen}
                placement="right"
                title={name}>
                {listItem}
            </Tooltip>;
    }, [drawerOpen, tooltipsOpen]);

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <Box sx={{ height: 16}}/>;
        return <Box pt={2} pl={2} pr={2} pb={0.5} sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }}>
            <Typography variant={"caption"}
                        color={"textSecondary"}
                        className={"weight-500"}
                        sx={{ flexGrow: 1 }}>
                {group ? group.toUpperCase() : "Ungrouped views".toUpperCase()}
            </Typography>

        </Box>;
    }, [drawerOpen]);

    return (
        <List>

            {!drawerOpen && buildNavigationListItem(0, HomeIcon, navigation.homeUrl, "Home")}

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    {buildGroupHeader(group)}
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) => buildNavigationListItem(index,
                            getIconForView(view.collection ?? view.view),
                            view.url,
                            view.name))}
                </React.Fragment>
            ))}

            {ungroupedNavigationViews.length > 0 && buildGroupHeader()}

            {ungroupedNavigationViews.map((view, index) => buildNavigationListItem(index,
                getIconForView(view.collection ?? view.view),
                view.url,
                view.name))}

        </List>
    );
}
