import { FireCMSPlugin } from "@firecms/core";

export function useUserManagementPlugin(): FireCMSPlugin {
    return {
        name: "User management plugin",
    }
}
