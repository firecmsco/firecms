import { useContext } from "react";
import { UserManagement } from "@firecms/types";
import { UserManagementContext } from "../UserManagementProvider";
import { User } from "@firecms/core";
export const useUserManagement = <USER extends User>() => useContext<UserManagement<USER>>(UserManagementContext);
