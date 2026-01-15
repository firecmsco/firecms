import { Role } from "@firecms/core";

export type FireCMSCloudUser = {
    uid: string; // This is the uid in the client app
    saas_uid: string; // This is the uid in FireCMS Cloud
    email: string | null;
    displayName: string | null;
    photoURL: string| null;
    providerId: string;
    isAnonymous: boolean;
    active?: boolean;
    updated_on?: Date;
    created_on?: Date;
}

export type FireCMSCloudUserWithRoles = FireCMSCloudUser & {
    roles: Role[];
}
