import React, { useCallback } from "react";
import {
    DrawerLogo,
    DrawerNavigationItem,
    IconForView,
    NavigationResult,
    useApp,
    useAuthController,
    useNavigationController
} from "@firecms/core";
import { AddIcon, Button, Tooltip, Typography, } from "@firecms/ui";
import { useCollectionEditorController } from "@firecms/collection_editor";
import { RESERVED_GROUPS } from "../utils";
import { AdminDrawerMenu } from "./AdminDrawerMenu";

/**
 * Default drawer used in FireCMS Cloud
 * @group Core
 */
export function FireCMSCloudDrawer() {

    const { logo } = useApp();

    const {
        drawerHovered,
        drawerOpen,
        closeDrawer
    } = useApp();

    const navigation = useNavigationController();
    const collectionEditorController = useCollectionEditorController();
    const { user } = useAuthController();

    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    const tooltipsOpen = drawerHovered && !drawerOpen && !adminMenuOpen;

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: NavigationResult = navigation.topLevelNavigation;

    const buildGroupHeader = useCallback((group?: string) => {
        if (!drawerOpen) return <div className="w-full"/>;
        const reservedGroup = group && RESERVED_GROUPS.includes(group);
        const canCreateCollections = collectionEditorController.configPermissions({ user }).createCollections && !reservedGroup;
        return <div className="pl-6 pr-4 pt-2 pb-2 flex flex-row items-center">
            <Typography variant={"caption"}
                        color={"secondary"}
                        className="grow font-medium">
                {group ? group.toUpperCase() : "Views".toUpperCase()}
            </Typography>
            {canCreateCollections && <Tooltip
                asChild={true}
                title={group ? `Create new collection in ${group}` : "Create new collection"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        collectionEditorController?.createCollection({
                            initialValues: {
                                group,
                            },
                            parentCollectionIds: [],
                            redirect: true,
                            sourceClick: "drawer_new_collection"
                        });
                    }}>
                    <AddIcon size={"small"}/>
                </Button>
            </Tooltip>}
        </div>;
    }, [collectionEditorController, drawerOpen]);

    return (

        <>
            <DrawerLogo logo={logo}/>

            <div className={"mt-4 grow overflow-scroll no-scrollbar"}
                 style={{
                     maskImage: "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)",
                 }}>

                {groups.map((group) => (
                    <div
                        key={`group_${group}`}
                        className={"bg-surface-50 dark:bg-surface-800/30 dark:bg-surface-800/30 my-4 rounded-lg rounded-lg ml-3 mr-1"}>
                        {buildGroupHeader(group)}
                        {Object.values(navigationEntries)
                            .filter(e => e.group === group)
                            .map((view, index) => <DrawerNavigationItem
                                key={`navigation_${index}`}
                                adminMenuOpen={adminMenuOpen}
                                icon={<IconForView collectionOrView={view.collection ?? view.view} size={"small"}/>}
                                tooltipsOpen={tooltipsOpen}
                                drawerOpen={drawerOpen}
                                url={view.url}
                                name={view.name}/>)}
                    </div>
                ))}

            </div>

            <AdminDrawerMenu
                menuOpen={adminMenuOpen}
                setMenuOpen={setAdminMenuOpen}/>
        </>
    );
}
