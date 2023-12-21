import React, { useCallback } from "react";
import {
    AddIcon,
    Button,
    cn,
    DrawerNavigationItem,
    DrawerProps,
    getIconForView,
    IconButton,
    Menu,
    MenuItem,
    MoreVertIcon,
    Tooltip,
    TopNavigationResult,
    Typography,
    useAuthController,
    useNavigationController
} from "@firecms/core";
import { useCollectionEditorController } from "@firecms/collection_editor";
import { useNavigate } from "react-router-dom";
import { ADMIN_VIEWS, RESERVED_GROUPS } from "../utils";

/**
 * Default drawer used in the CMS
 * @group Core
 */
export function FireCMSDrawer({
                               hovered,
                               drawerOpen,
                               closeDrawer
                           }: DrawerProps) {

    const navigate = useNavigate();

    const navigation = useNavigationController();
    const collectionEditorController = useCollectionEditorController();
    const { user } = useAuthController();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    const tooltipsOpen = hovered && !drawerOpen && !adminMenuOpen;

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = navigation.topLevelNavigation;

    const ungroupedNavigationViews = Object.values(navigationEntries).filter(e => !e.group);

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div style={{ height: 16 }}/>;
        const reservedGroup = group && RESERVED_GROUPS.includes(group);
        const canCreateCollections = collectionEditorController.configPermissions({ user }).createCollections && !reservedGroup;
        return <div className="flex flex-row items-center pt-8 pl-8 pr-0 pb-2">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="flex-grow font-medium">
                {group ? group.toUpperCase() : "Views".toUpperCase()}
            </Typography>
            {canCreateCollections && <Tooltip
                title={group ? `Create new collection in ${group}` : "Create new collection"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        collectionEditorController?.createCollection({
                            initialValues: {
                                group,
                            },
                            parentPathSegments: [],
                            redirect: true
                        });
                    }}>
                    <AddIcon size={"small"}/>
                </Button>
            </Tooltip>}
        </div>;
    }, [collectionEditorController, drawerOpen]);

    return (

        <>
            <div className={"flex-grow overflow-scroll no-scrollbar"}>

                {groups.map((group) => (
                    <React.Fragment
                        key={`drawer_group_${group}`}>
                        {buildGroupHeader(group)}
                        {Object.values(navigationEntries)
                            .filter(e => e.group === group)
                            .map((view, index) => <DrawerNavigationItem
                                key={`navigation_${index}`}
                                icon={getIconForView(view.collection ?? view.view)}
                                tooltipsOpen={tooltipsOpen}
                                drawerOpen={drawerOpen}
                                url={view.url}
                                name={view.name}/>)}
                    </React.Fragment>
                ))}

                {ungroupedNavigationViews.length > 0 && <>
                    {buildGroupHeader()}
                </>}

                {ungroupedNavigationViews.map((view, index) => <DrawerNavigationItem
                    key={`navigation_${index}`}
                    icon={getIconForView(view.collection ?? view.view)}
                    tooltipsOpen={tooltipsOpen}
                    drawerOpen={drawerOpen}
                    url={view.url}
                    name={view.name}/>)}

                {/*<Divider/>*/}
                {/*{buildGroupHeader("Admin")}*/}

            </div>

            <Menu
                open={adminMenuOpen}
                onOpenChange={setAdminMenuOpen}
                trigger={
                    <IconButton
                        shape={"square"}
                        className={"m-4 text-gray-900 dark:text-white w-fit"}>
                        <Tooltip title={"Admin"}
                                 open={tooltipsOpen}
                                 side={"right"} sideOffset={28}>
                            <MoreVertIcon/>
                        </Tooltip>
                        {drawerOpen && <div
                            className={cn(
                                drawerOpen ? "opacity-100" : "opacity-0 hidden",
                                "mx-4 font-inherit text-inherit"
                            )}>
                            ADMIN
                        </div>}
                    </IconButton>}
            >
                {ADMIN_VIEWS.map((view, index) =>
                    <MenuItem
                        onClick={(event) => {
                            event.preventDefault();
                            navigate(view.path);
                        }}
                        key={`navigation_${index}`}>
                        {getIconForView(view)}
                        {view.name}
                    </MenuItem>)}

            </Menu>
        </>
    );
}
