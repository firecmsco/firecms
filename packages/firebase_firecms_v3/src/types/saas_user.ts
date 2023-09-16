export type SaasUser = {
    uid: string;
    email: string;
    name: string;
    active: boolean;
    updated_on: Date;
    created_on: Date;
    firebase_uid: string;
}

export type SaasUserProject = SaasUser & {
    roles: string[];
}
