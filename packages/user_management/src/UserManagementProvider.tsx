import React, { PropsWithChildren } from "react";
import { UserManagement } from "./types";
import { User } from "@firecms/core";

export const UserManagementContext = React.createContext<UserManagement<any>>({} as any);

export interface UserManagementProviderProps<U extends User = User> {
    userManagement: UserManagement<U>
}

export function UserManagementProvider<U extends User = User>({
                                           children,
                                           userManagement
                                       }: PropsWithChildren<UserManagementProviderProps<U>>) {
    return (
        <UserManagementContext.Provider value={userManagement}>
            {children}
        </UserManagementContext.Provider>
    );
};
