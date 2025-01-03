import { SubscriptionStatus } from "../index";

export type ProLicense = {
    id: string;
    archived: boolean;
    type: "per_project" | "per_user";
    status: SubscriptionStatus;
    licensed_users: number;
    licensed_projects: number;
    firebase_project_ids: string[];
    api_key: string;
    created_by: string;
    created_at: Date;
    metadata?: {
        openai?: {
            encrypted_key: string;
            end_key_string: string;
        };
    }
}
