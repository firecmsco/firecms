import { SubscriptionStatus } from "../index";

export type ProLicense = {
    id: string;
    status: SubscriptionStatus;
    licensed_users: number;
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
