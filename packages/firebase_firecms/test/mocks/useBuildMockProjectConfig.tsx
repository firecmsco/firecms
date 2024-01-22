import { MOCK_PROJECT_ID } from "./constants";
import { ProjectConfig } from "firecms";

export function useBuildMockProjectConfig(): ProjectConfig {

    return {
        canUseLocalTextSearch: false,
        localTextSearchEnabled: false,
        updateLocalTextSearchEnabled(allow: boolean): Promise<void> {
            return Promise.resolve(undefined);
        },
        canEditRoles: false,
        canExport: false,
        canUploadLogo: false,
        configLoading: false,
        projectId: MOCK_PROJECT_ID,
        updateProjectName(name: string): Promise<void> {
            throw new Error("Function not implemented.");
        },
        uploadLogo(file: any): Promise<void> {
            throw new Error("Function not implemented.");
        },
        usersLimit: 3
    };
}
