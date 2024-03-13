import { useContext } from "react";
import { UserManagement } from "../types/user_management";
import { UserManagementContext } from "../UserManagementProvider";

export const useUserManagement = () => useContext<UserManagement>(UserManagementContext);
