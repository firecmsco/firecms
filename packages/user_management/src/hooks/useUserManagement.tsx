import { useContext } from "react";
import { UserManagementContext } from "../UserManagementProvider";
import { User } from "@firecms/core";
import { UserManagement } from "../types";
export const useUserManagement = <USER extends User>() => useContext<UserManagement<USER>>(UserManagementContext);
