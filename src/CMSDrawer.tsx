import React from "react";
import {
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
import "./styles.module.css";
import EntityDetailDialog from "./routes/SideCMSRoute";
import { AdditionalView } from "./CMSAppProps";
import Box from "@material-ui/core/Box/Box";


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

export function CMSDrawer({ logo, navigation, closeDrawer, drawerOpen, additionalViews }: CMSDrawerProps) {

    const classes = useStyles();

    const groups: string[] = Object.values(navigation).map(e => e.group).filter(Boolean) as string[];
    const ungroupedNavigationViews = Object.values(navigation).filter(e => !e.group);

    function createNavigationEntry(index: number, group: string, view: EntityCollectionView) {
        return <ListItem
            button
            key={`navigation_${index}`}
            component={ReactLink}
            to={buildCollectionPath(view.relativePath)}
        >
            <ListItemText
                primary={view.name.toUpperCase()}
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
        <img className={classes.logo} src={logo}/>}

        <Divider/>
        <List>

            {ungroupedNavigationViews.map((view, index) => createNavigationEntry(index, "none", view))}

            {groups.map((group) => <React.Fragment>
                <Divider key={`divider_${group}`}/>
                <Box pt={2} pl={2} pr={2} pb={0.5}>
                    <Typography variant={"caption"}
                                color={"textSecondary"}>
                        {group.toUpperCase()}
                    </Typography>
                </Box>
                {Object.values(navigation).filter(e => e.group === group).map((view, index) => createNavigationEntry(index, group, view))}
            </React.Fragment>)}

            {additionalViews && (
                <React.Fragment>
                    <Divider/>
                    {additionalViews.map(additionalView => (
                        <ListItem
                            button
                            key={`additional-view-${additionalView.path}`}
                            component={ReactLink}
                            to={addInitialSlash(additionalView.path)}
                        >
                            <ListItemText
                                primary={additionalView.name}
                                primaryTypographyProps={{ variant: "subtitle2" }}/>
                        </ListItem>
                    ))}
                </React.Fragment>
            )}
        </List>

    </Drawer>;
}
