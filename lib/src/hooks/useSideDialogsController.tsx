import { SideDialogsController } from "../types";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Hook to retrieve the side dialogs' controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @category Hooks and utilities
 */
export function useSideDialogsController(): SideDialogsController {
    const context = useFireCMSContext();
    return context.sideDialogsController;
}
