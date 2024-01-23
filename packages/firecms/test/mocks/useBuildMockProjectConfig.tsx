import { FireCMSUserProject, ProjectConfig, Role } from "../../src";
import { MOCK_PROJECT_ID } from "./constants";

export function useBuildMockProjectConfig(): ProjectConfig {

    return {
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
