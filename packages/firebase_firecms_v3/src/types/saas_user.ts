export interface SaasUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    providerId: string;
    isAnonymous: false;
    name: string;
    active: boolean;
    updated_on: Date;
    created_on: Date;
    firebase_uid: string;
}

export type SaasUserProject = SaasUser & {
    roles: string[];
}
