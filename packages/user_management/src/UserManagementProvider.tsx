import React, { PropsWithChildren } from "react";
import { UserManagement, UserWithRoles } from "./types";

export const UserManagementContext = React.createContext<UserManagement<any>>({} as any);

export interface UserManagementProviderProps<U extends UserWithRoles = UserWithRoles> {
    userManagement: UserManagement<U>
}

export function UserManagementProvider<U extends UserWithRoles = UserWithRoles>({
                                           children,
                                           userManagement
                                       }: PropsWithChildren<UserManagementProviderProps<U>>) {
    return (
        <UserManagementContext.Provider value={userManagement}>
            {children}
        </UserManagementContext.Provider>
    );
};
