import { FireCMSUserProject } from "./firecms_user";
import { Role } from "./roles";

export type UserManagement = {
    loading: boolean;

    users: FireCMSUserProject[];
    saveUser: (user: FireCMSUserProject) => Promise<FireCMSUserProject>;
    deleteUser: (user: FireCMSUserProject) => Promise<void>;

    roles: Role[];
    saveRole: (role: Role) => Promise<void>;
    deleteRole: (role: Role) => Promise<void>;

    usersLimit: number | null;
    canEditRoles: boolean;

    loggedUser: FireCMSUserProject | null;

};
