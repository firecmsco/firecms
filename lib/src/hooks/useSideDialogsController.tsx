import { SideDialogsController } from "../types";
import {
    SideDialogsControllerContext
} from "../core/contexts/SideDialogsControllerContext";
import { useContext } from "react";

/**
 * Hook to retrieve the side dialogs' controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @category Hooks and utilities
 */
export const useSideDialogsController = (): SideDialogsController => useContext(SideDialogsControllerContext);
