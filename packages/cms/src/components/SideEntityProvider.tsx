import React from "react";
import { useBuildSideEntityController } from "../hooks/useBuildSideEntityController";
import { useBuildSideDialogsController } from "../hooks/useBuildSideDialogsController";
import { SideEntityControllerContext } from "../hooks/useSideEntityController";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { useCollectionRegistryController, useUrlController } from "../index";
import { useNavigationStateController } from "../index";
import { useAuthController } from "@rebasepro/core";

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
        <SideDialogsControllerContext.Provider value={sideDialogsController}>
            <SideEntityControllerContext.Provider value={sideEntityController}>
                {children}
            </SideEntityControllerContext.Provider>
        </SideDialogsControllerContext.Provider>
    );
}
