import { Role } from "@firecms/core";

export type FireCMSCloudUser = {
    uid: string; // This is the uid in FireCMS Cloud
    email: string;
    displayName: string;
    photoURL: string;
    providerId: string;
    isAnonymous: false;
    active: boolean;
    updated_on: Date;
    created_on: Date;
    firebase_uid: string; // This is the uid in the client app
}

export type FireCMSCloudUserWithRoles = FireCMSCloudUser & {
    roles: Role[];
}
