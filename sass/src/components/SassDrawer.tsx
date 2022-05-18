import React, { useCallback } from "react";

import { NavLink } from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    Link,
    List,
    ListItem,
    Tooltip,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {
    DrawerProps,
    FireCMSLogo,
    getIconForView,
    TopNavigationEntry,
    TopNavigationResult,
    useNavigationContext
} from "@camberi/firecms";
import {
    useCollectionEditorController
} from "../useCollectionEditorController";

/**
 * Props used in case you need to override the default drawer
 * @category Core
 */
export type SassDrawerProps = DrawerProps<{}>;

/**
 * Default drawer used in the CMS
 * @category Core
 */
export function SassDrawer({
                           logo,
                           closeDrawer
                       }: SassDrawerProps) {

    const navigation = useNavigationContext();
    const collectionEditorController = useCollectionEditorController();

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    const buildNavigationListItem = useCallback((index: number, group: string, entry: TopNavigationEntry) => {

        const CollectionIcon = getIconForView(entry.collection ?? entry.view);
        return <ListItem
            // @ts-ignore
            button
            key={`navigation_${index}`}
            component={NavLink}
            onClick={closeDrawer}
            // @ts-ignore
            style={({ isActive }) => ({
                fontWeight: isActive ? "600" : "500",
                background: isActive ? "rgba(128,128,128,0.1)" : "inherit"
            })}
            sx={{
                alignItems: "center"
            }}
            to={entry.url}
        >

            <CollectionIcon fontSize={"small"} color={"disabled"}/>

            <Typography
                variant={"subtitle2"}
                sx={{
                    fontWeight: "inherit",
                    ml: 1,
                    p: 0.5
                }}>
                {entry.name.toUpperCase()}
            </Typography>
        </ListItem>;
    }, [closeDrawer]);

    const buildGroupHeader = useCallback((group?: string) => {
        const canCreateCollections = collectionEditorController.configPermissions.createCollections;
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
            {canCreateCollections && <Tooltip
                title={group ? `Create new collection in ${group}` : "Create new collection"}>
                <Button
                    size={"small"}
                    onClick={() => {
                        collectionEditorController?.openNewCollectionDialog({ group });
                        closeDrawer();
                    }}>
                    <AddIcon fontSize={"small"}/>
                </Button>
            </Tooltip>}
        </Box>;
    }, [closeDrawer, navigation]);

    let logoComponent;
    if (logo) {
        logoComponent = <img
            style={{
                maxWidth: "100%",
                maxHeight: "100%"
            }}
            src={logo}
            alt={"Logo"}/>;
    } else {
        logoComponent = <FireCMSLogo/>;
    }

    return (
        <div>
            <Link
                key={"breadcrumb-home"}
                color="inherit"
                onClick={closeDrawer}
                component={NavLink}

                to={navigation.homeUrl}>
                <Box sx={{
                    padding: 4,
                    maxWidth: 280
                }}>
                    {logoComponent}
                </Box>

            </Link>
            <List>

                {groups.map((group) => (
                    <React.Fragment
                        key={`drawer_group_${group}`}>
                        <Divider key={`divider_${group}`}/>
                        {buildGroupHeader(group)}
                        {Object.values(navigationEntries)
                            .filter(e => e.group === group)
                            .map((view, index) => buildNavigationListItem(index, group, view))}
                    </React.Fragment>
                ))}

                {ungroupedNavigationViews.length > 0 && <>
                    <Divider/>
                    {buildGroupHeader()}
                </>}

                {ungroupedNavigationViews.map((view, index) => buildNavigationListItem(index, "none", view))}

            </List>
        </div>
    );
}
