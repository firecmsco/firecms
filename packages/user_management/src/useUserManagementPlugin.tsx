import { FireCMSPlugin } from "@firecms/core";
import { UserManagementProvider } from "./UserManagementProvider";
import { UserManagement } from "./types";

export function useUserManagementPlugin({ userManagement }: {
    userManagement: UserManagement,
}): FireCMSPlugin {
    return {
        key: "user_management",
        loading: userManagement.loading,
        provider: {
            Component: UserManagementProvider,
            props: {
                userManagement
            }
        }
    }
}
