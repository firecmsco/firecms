import React from "react";
import {
    DrawerLogo,
    DrawerNavigationGroup,
    DrawerToggle,
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
    const drawerVisuallyOpen = drawerOpen || drawerHovered;

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = React.useState(false);
    const handleScroll = () => {
        if (scrollRef.current) {
            setScrolled(scrollRef.current.scrollTop > 0);
        }
    };

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in Drawer");

    const {
        navigationEntries,
        groups
    }: NavigationResult = navigation.topLevelNavigation;

    // Collapsible groups state - using "drawer" namespace for independent state from home page
    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groups, "drawer");

    const buildHeaderActions = (group: string | null) => {
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
                                group: group ?? undefined,
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

        <div role="navigation" aria-label="Main navigation" className={"flex flex-col h-full relative grow w-full"}>
            <DrawerLogo logo={logo} />

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={"flex-grow min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-2"}
                style={{
                    maskImage: scrolled
                        ? "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)"
                        : "linear-gradient(to bottom, black 0, black calc(100% - 20px), transparent 100%)"
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
                            drawerOpen={drawerVisuallyOpen}
                            tooltipsOpen={tooltipsOpen}
                            adminMenuOpen={adminMenuOpen}
                            headerActions={buildHeaderActions(group)}
                        />
                    );
                })}

            </div>

            <div className={"shrink-0"}>
                <AdminDrawerMenu
                    menuOpen={adminMenuOpen}
                    setMenuOpen={setAdminMenuOpen} />
            </div>

            <DrawerToggle />
        </div>
    );
}


