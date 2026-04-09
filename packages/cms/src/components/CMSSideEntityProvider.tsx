import React from "react";
import { useBuildSideEntityController } from "../hooks/useBuildSideEntityController";
import {
    useCollectionRegistryController,
    useCMSUrlController,
    useAuthController,
    SideEntityControllerContext,
} from "@rebasepro/core";
import { useNavigationStateController, useSideDialogsController } from "@rebasepro/core";

/**
 * Provider that builds the SideEntityController and makes it available
 * via the SideEntityControllerContext from @rebasepro/core.
 *
 * After the CMS extraction refactor, `useBuildSideEntityController` lives
 * in the CMS package while the context it feeds into lives in core.
 * This provider bridges the two: place it inside the `<Rebase>` tree and
 * above any component that calls `useSideEntityController()`.
 *
 * @example
 * ```tsx
 * <Rebase ...>
 *   {({ loading }) => (
 *     <CMSSideEntityProvider>
 *       <RebaseRoutes>
 *         ...
 *       </RebaseRoutes>
 *     </CMSSideEntityProvider>
 *   )}
 * </Rebase>
 * ```
 *
 * @group Components
 */
export function CMSSideEntityProvider({ children }: { children: React.ReactNode }) {
    const collectionRegistryController = useCollectionRegistryController();
    const cmsUrlController = useCMSUrlController();
    const navigationStateController = useNavigationStateController();
    const sideDialogsController = useSideDialogsController();
    const authController = useAuthController();

    const sideEntityController = useBuildSideEntityController(
        collectionRegistryController,
        cmsUrlController,
        navigationStateController,
        sideDialogsController,
        authController,
    );

    return (
        <SideEntityControllerContext.Provider value={sideEntityController}>
            {children}
        </SideEntityControllerContext.Provider>
    );
}
