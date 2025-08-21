import { SideDialogsController } from "@firecms/types";
import { SideDialogsControllerContext } from "../contexts/SideDialogsControllerContext";
import { useContext } from "react";

/**
 * Hook to retrieve the side dialogs' controller.
 *
 * This hook allows you to open and close side dialogs. This is the mechanism
 * used when open a side entity dialog, or when selecting a reference.
 *
 * If you want to open a side entity dialog, you can use the {@link useSideEntityController}
 * hook.
 *
 * If you want to select a reference, you can use the {@link useReferenceDialog}
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @group Hooks and utilities
 */
export const useSideDialogsController = (): SideDialogsController => useContext(SideDialogsControllerContext);
