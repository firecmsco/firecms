import { useContext } from "react";
import { DialogsController } from "../types/dialogs_controller";
import { DialogsControllerContext } from "../contexts/DialogsProvider";

/**
 * Use this hook to open a dialog imperatively.
 * Alternatively, you can use dialogs declaratively using the `Dialog` component.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @group Hooks and utilities
 */
export const useDialogsController = (): DialogsController => useContext(DialogsControllerContext);
