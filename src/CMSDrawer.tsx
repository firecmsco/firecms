import React from "react";
import {
    Box,
    createStyles,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
    Typography
} from "@material-ui/core";
import { Link as ReactLink } from "react-router-dom";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import { EntityCollectionView } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes/navigation";
import { AdditionalView } from "./CMSAppProps";


const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth,
            letterSpacing: "1px"
        }
    })
);


interface CMSDrawerProps {
    logo: string | undefined,
    navigation: EntityCollectionView[],
    drawerOpen: boolean,
    closeDrawer: () => any,
    additionalViews: AdditionalView[] | undefined;
}

interface NavigationEntry {
    url: string;
    name: string;
    group?: string;
}

export function CMSDrawer({ logo, navigation, closeDrawer, drawerOpen, additionalViews }: CMSDrawerProps) {

    const classes = useStyles();

    const navigationEntries: NavigationEntry[] = [
        ...navigation.map(view => ({
            url: buildCollectionPath(view.relativePath),
            name: view.name,
            group: view.group
        })),
        ...(additionalViews ?? []).map(additionalView => ({
            url: addInitialSlash(additionalView.path),
            name: additionalView.name,
            group: additionalView.group
        }))
    ];

    const groups: string[] = Array.from(new Set(
        Object.values(navigationEntries).map(e => e.group).filter(Boolean) as string[]
    ).values());
    const ungroupedNavigationViews: NavigationEntry[] = Object.values(navigationEntries).filter(e => !e.group);

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
        <img className={classes.logo} src={logo} alt={"Logo"}/>}

        <Divider/>
        <List>

            {ungroupedNavigationViews.map((view, index) => createNavigationEntry(index, "none", view))}

            {groups.map((group) => (
                <React.Fragment
                    key={`drawer_group_${group}`}>
                    <Divider key={`divider_${group}`}/>
                    <Box pt={2} pl={2} pr={2} pb={0.5}>
                        <Typography variant={"caption"}
                                    color={"textSecondary"}>
                            {group.toUpperCase()}
                        </Typography>
                    </Box>
                    {Object.values(navigationEntries)
                        .filter(e => e.group === group)
                        .map((view, index) => createNavigationEntry(index, group, view))}
                </React.Fragment>
            ))}

        </List>

    </Drawer>;
}
