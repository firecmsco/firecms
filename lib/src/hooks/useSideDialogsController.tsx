import { AuthController, SideEntityController } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";
import { SideDialogsController } from "../core/SideDialogs";

/**
 * Hook to retrieve the side dialogs controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export function useSideDialogsController(): SideDialogsController {
    const context = useFireCMSContext();
    return context.sideDialogsController;
}
