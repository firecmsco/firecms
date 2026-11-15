import { useContext } from "react";
import { UserManagement } from "../types/index.js";
import { UserManagementContext } from "../UserManagementProvider.js";
import { User } from "@firecms/core";
export const useUserManagement = <USER extends User>() => useContext<UserManagement<USER>>(UserManagementContext);
