import { useContext } from "react";
import { InternalUserManagement, NavigationController } from "../types";
import { NavigationContext } from "../contexts/NavigationContext";
import { InternalUserManagementContext } from "../contexts/InternalUserManagementContext";

/**
 * Use this hook to get the internal user management of the app.
 * Note that this is different from the user management plugin controller.
 * This controller will be eventually replaced by the one provided
 * by the user management plugin.
 *
 * Use at your own risk!
 *
 * @group Hooks and utilities
 */
export const useInternalUserManagementController = (): InternalUserManagement => useContext(InternalUserManagementContext);
