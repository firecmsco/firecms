import React from "react";
import {
    Box,
    Divider,
    Link,
    List,
    ListItem,
    ListItemText,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Link as ReactLink } from "react-router-dom";
import {
    computeTopNavigation,
    TopNavigationEntry
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
    } = computeTopNavigation(navigationContext, true);

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    function createNavigationListItem(index: number, group: string, entry: TopNavigationEntry) {
        return <ListItem
            button
            key={`navigation_${index}`}
            component={ReactLink}
            to={entry.url}
        >
            <ListItemText
                primary={entry.name.toUpperCase()}
                primaryTypographyProps={{ variant: "subtitle2" }}
                onClick={closeDrawer}/>
        </ListItem>;
    }

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
            component={ReactLink}
            to={"/"}>
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
