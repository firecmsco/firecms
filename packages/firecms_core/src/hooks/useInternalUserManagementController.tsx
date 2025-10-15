import { useContext } from "react";
import { InternalUserManagementContext } from "../contexts/InternalUserManagementContext";
import { InternalUserManagement, User } from "@firecms/types";

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
export const useInternalUserManagementController = <USER extends User = User>(): InternalUserManagement<USER> => useContext(InternalUserManagementContext);
