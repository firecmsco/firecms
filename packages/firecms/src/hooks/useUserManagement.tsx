import React, { useContext } from "react";
import { UserManagement } from "./useBuildUserManagement";

export const UserManagementContext = React.createContext({} as UserManagement);

export const useUserManagement = () => useContext<UserManagement>(UserManagementContext);

export function UserManagementProvider({ children, userManagement }: { children: React.ReactNode, userManagement: UserManagement }) {
    return <UserManagementContext.Provider value={userManagement}>
        {children}
    </UserManagementContext.Provider>;
}
