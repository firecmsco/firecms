import React, { useCallback, useMemo } from "react";
import {
    Box,
    Divider,
    Link,
    List,
    ListItem,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { NavLink } from "react-router-dom";
import {
    computeTopNavigation,
    TopNavigationEntry,
    TopNavigationResult
} from "./util/navigation_utils";
import { useNavigation } from "../hooks";
import { FireCMSLogo } from "./components/FireCMSLogo";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 280
        }
    })
);

/**
 * Props used in case you need to override the default drawer
 * @category Core
 */
export interface DrawerProps {
    logo: string | undefined,
    closeDrawer: () => any,
}

/**
 * Default drawer used in the CMS
 * @category Core
 */
export function Drawer({
                           logo,
                           closeDrawer
                       }: DrawerProps) {

    const classes = useStyles();

    const navigationContext = useNavigation();
    if (!navigationContext.navigation)
        return <></>;

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = useMemo(() => computeTopNavigation(navigationContext, true), [navigationContext]);

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    const createNavigationListItem = useCallback((index: number, group: string, entry: TopNavigationEntry) =>
        <ListItem
            // @ts-ignore
            button
            key={`navigation_${index}`}
            component={NavLink}
            onClick={closeDrawer}
            // @ts-ignore
            style={({ isActive }) => ({
                fontWeight: isActive ? '600' : '500',
                background: isActive ? 'rgba(128,128,128,0.1)' : 'inherit',
            })}
            to={entry.url}
        >
            <Typography
                variant={"subtitle2"}
                sx={{
                    fontWeight: 'inherit',
                    py: .5
                }}>
                {entry.name.toUpperCase()}
            </Typography>
        </ListItem>, []);

    let logoComponent;
    if (logo) {
        logoComponent = <img className={classes.logo}
                             src={logo}
                             alt={"Logo"}/>;
    } else {
        logoComponent = <div className={classes.logo}>
            <FireCMSLogo/>
        </div>;
    }

    return <>

        <Link
            key={`breadcrumb-home`}
            color="inherit"
            onClick={closeDrawer}
            component={NavLink}

            to={navigationContext.homeUrl}>
            {logoComponent}
        </Link>

        <List>

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    <Divider key={`divider_${group}`}/>
                    <Box pt={2} pl={2} pr={2} pb={0.5}>
                        <Typography variant={"caption"}
                                    color={"textSecondary"}
                                    className={"weight-500"}>
                            {group.toUpperCase()}
                        </Typography>
                    </Box>
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) => createNavigationListItem(index, group, view))}
                </React.Fragment>
            ))}

            {ungroupedNavigationViews.length > 0 &&
            <Divider key={`divider_ungrouped`}/>}

            {ungroupedNavigationViews.map((view, index) => createNavigationListItem(index, "none", view))}

        </List>

    </>;
}
