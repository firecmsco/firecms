import React from "react";
import {
    DrawerLogo,
    DrawerNavigationGroup,
    NavigationResult,
    useApp,
    useAuthController,
    useCollapsedGroups,
    useNavigationController
} from "@firecms/core";
import { AddIcon, Button, Tooltip } from "@firecms/ui";
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
        drawerOpen
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

    // Collapsible groups state - using "drawer" namespace for independent state from home page
    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groups, "drawer");

    const buildHeaderActions = (group: string) => {
        const reservedGroup = group && RESERVED_GROUPS.includes(group);
        const canCreateCollections = collectionEditorController.configPermissions({ user }).createCollections && !reservedGroup;

        if (!canCreateCollections) return null;

        return (
            <Tooltip
                asChild={true}
                title={group ? `Create new collection in ${group}` : "Create new collection"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={(e) => {
                        e.stopPropagation();
                        collectionEditorController?.createCollection({
                            initialValues: {
                                group,
                            },
                            parentCollectionIds: [],
                            redirect: true,
                            sourceClick: "drawer_new_collection"
                        });
                    }}>
                    <AddIcon size={"small"} />
                </Button>
            </Tooltip>
        );
    };

    return (

        <>
            <DrawerLogo logo={logo} />

            <div className={"mt-4 flex-grow overflow-scroll no-scrollbar"}
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)",
                }}>

                {groups.map((group) => {
                    const entriesInGroup = Object.values(navigationEntries).filter(e => e.group === group);
                    return (
                        <DrawerNavigationGroup
                            key={`group_${group}`}
                            group={group}
                            entries={entriesInGroup}
                            collapsed={isGroupCollapsed(group)}
                            onToggleCollapsed={() => toggleGroupCollapsed(group)}
                            drawerOpen={drawerOpen}
                            tooltipsOpen={tooltipsOpen}
                            adminMenuOpen={adminMenuOpen}
                            headerActions={buildHeaderActions(group)}
                        />
                    );
                })}

            </div>

            <AdminDrawerMenu
                menuOpen={adminMenuOpen}
                setMenuOpen={setAdminMenuOpen} />
        </>
    );
}


