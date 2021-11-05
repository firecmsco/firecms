import { AuthController, SideEntityController } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Hook to retrieve the AuthContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSAppProvider`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export function useSideEntityController(): SideEntityController {
    const context = useFireCMSContext();
    return context.sideEntityController;
}
