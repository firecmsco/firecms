import { AdminModeControllerContext } from "../contexts/AdminModeController";
import { useContext } from "react";

/**
 * Use this controller to change the admin mode (developer vs editor)
 * @group Hooks and utilities
 */
export interface AdminModeController {
    mode: "content" | "studio" | "settings";
    setMode: (mode: "content" | "studio" | "settings") => void;
}

/**
 * Hook to retrieve the current admin mode ("developer" | "editor"), and `setMode`
 * to change it.
 *
 * Consider that in order to use this hook you need to have a parent
 * `Rebase`
 *
 * @see AdminModeController
 * @group Hooks and utilities
 */
export const useAdminModeController = () => useContext(AdminModeControllerContext);
