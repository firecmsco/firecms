import React from "react";
import { useBuildSideEntityController } from "../hooks/useBuildSideEntityController";
import { useBuildSideDialogsController } from "../hooks/useBuildSideDialogsController";
import { SideEntityControllerContext } from "../hooks/useSideEntityController";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { useCollectionRegistryController, useUrlController } from "../index";
import { useNavigationStateController } from "../index";
import { useAuthController, useBridgeRegistration } from "@rebasepro/core";

/**
 * Provider that builds the SideEntityController and makes it available
 * via the SideEntityControllerContext from @rebasepro/core.
 *
 * After the CMS extraction refactor, `useBuildSideEntityController` lives
 * in the CMS package while the context it feeds into lives in core.
 * This provider bridges the two: place it inside the `<Rebase>` tree and
 * above any component that calls `useSideEntityController()`.
 *
 * Also auto-registers the side entity controller and breadcrumbs into the
 * self-assembling Studio bridge (when a StudioBridgeRegistryProvider is
 * mounted above in the tree).
 *
 * @example
 * ```tsx
 * <Rebase ...>
 *   {({ loading }) => (
 *     <SideEntityProvider>
 *       <RebaseRoutes>
 *         ...
 *       </RebaseRoutes>
 *     </SideEntityProvider>
 *   )}
 * </Rebase>
 * ```
 *
 * @group Components
 */
export function SideEntityProvider({ children }: { children: React.ReactNode }) {
    const collectionRegistryController = useCollectionRegistryController();
    const urlController = useUrlController();
    const navigationStateController = useNavigationStateController();
    const sideDialogsController = useBuildSideDialogsController();
    const authController = useAuthController();

    const sideEntityController = useBuildSideEntityController(
        collectionRegistryController,
        urlController,
        navigationStateController,
        sideDialogsController,
        authController,
    );

    return (
        <BreadcrumbsProvider>
            <SideDialogsControllerContext.Provider value={sideDialogsController}>
                <SideEntityControllerContext.Provider value={sideEntityController}>
                    <BridgeAutoRegistrar sideEntityController={sideEntityController} />
                    {children}
                </SideEntityControllerContext.Provider>
            </SideDialogsControllerContext.Provider>
        </BreadcrumbsProvider>
    );
}

/**
 * Internal component that auto-registers side entity and breadcrumbs
 * into the Studio bridge. Must be a child of BreadcrumbsProvider.
 */
function BridgeAutoRegistrar({ sideEntityController }: { sideEntityController: any }) {
    const breadcrumbs = useBreadcrumbsController();
    useBridgeRegistration("sideEntityController", sideEntityController);
    useBridgeRegistration("breadcrumbs", breadcrumbs);
    return null;
}
