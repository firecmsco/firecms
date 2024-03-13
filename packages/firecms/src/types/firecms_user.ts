import { Role } from "@firecms/user_management";

export type FireCMSCloudUser = {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    providerId: string;
    isAnonymous: false;
    active: boolean;
    updated_on: Date;
    created_on: Date;
    firebase_uid: string;
}

export type FireCMSCloudUserWithRoles = FireCMSCloudUser & {
    roles: Role[];
}
