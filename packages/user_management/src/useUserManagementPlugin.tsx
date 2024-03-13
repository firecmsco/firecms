import { AuthController, FireCMSPlugin } from "@firecms/core";
import { UserManagementProvider } from "./UserManagementProvider";
import { UserManagement } from "./types";

export function useUserManagementPlugin({ userManagement }: {
    userManagement: UserManagement,
}): FireCMSPlugin {
    return {
        name: "User management plugin",
        loading: userManagement.loading,
        provider: {
            Component: UserManagementProvider,
            props: {
                userManagement
            }
        }
    }
}
