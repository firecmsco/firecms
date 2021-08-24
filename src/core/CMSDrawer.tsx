import React from "react";
import {
    Box,
    Divider,
    Drawer,
    Link,
    List,
    ListItem,
    ListItemText,
    Theme,
    Typography,
} from "@material-ui/core";
import createStyles from '@material-ui/styles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles';
import { Link as ReactLink } from "react-router-dom";
import { CMSView, EntityCollection } from "../models";
import { computeNavigation } from "./navigation";


const drawerWidth = 280;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth
            // letterSpacing: "1px"
        }
    })
);


interface CMSDrawerProps {
    logo: string | undefined,
    collections: EntityCollection[],
    drawerOpen: boolean,
    closeDrawer: () => any,
    cmsViews: CMSView[] | undefined;
}

interface NavigationEntry {
    url: string;
    name: string;
    group?: string;
}

export function CMSDrawer({
                              logo,
                              collections,
                              closeDrawer,
                              drawerOpen,
                              cmsViews
                          }: CMSDrawerProps) {

    const classes = useStyles();
    const {
        navigationEntries,
        groups
    } = computeNavigation(collections, cmsViews, false);

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    function createNavigationEntry(index: number, group: string, entry: NavigationEntry) {
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

    return <Drawer
        variant="temporary"
        anchor={"left"}
        open={drawerOpen}
        onClose={closeDrawer}
        classes={{
            paper: classes.drawerPaper
        }}
        ModalProps={{
            keepMounted: true
        }}
    >

        {logo &&
        <Link
            key={`breadcrumb-home`}
            color="inherit"
            onClick={closeDrawer}
            component={ReactLink}
            to={"/"}>
            <img className={classes.logo} src={logo} alt={"Logo"}/>
        </Link>}

        <List>

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    <Divider key={`divider_${group}`}/>
                    <Box pt={2} pl={2} pr={2} pb={0.5}>
                        <Typography variant={"caption"} color={"textSecondary"}
                                    className={"weight-500"}>
                            {group.toUpperCase()}
                        </Typography>
                    </Box>
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) => createNavigationEntry(index, group, view))}
                </React.Fragment>
            ))}

            {ungroupedNavigationViews.length > 0 &&
            <Divider key={`divider_ungrouped`}/>}

            {ungroupedNavigationViews.map((view, index) => createNavigationEntry(index, "none", view))}

        </List>

    </Drawer>;
}
