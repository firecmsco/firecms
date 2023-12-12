import { ProjectConfig, Role, FireCMSUserProject } from "../../src";
import { MOCK_PROJECT_ID } from "./constants";

export function useBuildMockProjectConfig(): ProjectConfig {

    return {
        canEditRoles: false,
        canExport: false,
        canUploadLogo: false,
        configLoading: false,
        deleteRole(role: Role): Promise<void> {
            throw new Error("Function not implemented.");
        },
        deleteUser(user: FireCMSUserProject): Promise<void> {
            throw new Error("Function not implemented.");
        },
        loading: false,
        projectId: MOCK_PROJECT_ID,
        roles: [],
        saveRole(role: Role): Promise<void> {
            throw new Error("Function not implemented.");
        },
        saveUser(user: FireCMSUserProject): Promise<FireCMSUserProject> {
            throw new Error("Function not implemented.");
        },
        updateProjectName(name: string): Promise<void> {
            throw new Error("Function not implemented.");
        },
        uploadLogo(file: any): Promise<void> {
            throw new Error("Function not implemented.");
        },
        users: [],
        usersLimit: 3
    };
}
