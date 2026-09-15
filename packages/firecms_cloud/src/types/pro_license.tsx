import { ProLicensePriceType, SubscriptionStatus } from "../index";

export type ProLicense = {
    id: string;
    archived: boolean;
    /**
     * Matches the `metadata.type` of the price the license is billed with.
     * Only `per_project_graduated` licenses change their project list through
     * the backend (which keeps the Stripe quantity in step); the legacy types
     * write it to Firestore directly.
     */
    type: ProLicensePriceType;
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
