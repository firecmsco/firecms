import { SubscriptionTier } from "../types";

/**
 * Service for verifying subscription access to Explorer
 */
export class SubscriptionService {
    private subscriptionTier: SubscriptionTier;

    constructor(subscriptionTier: SubscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }

    /**
     * Check if the current subscription has access to Explorer
     * Explorer is available for Cloud Plus, Pro, and Enterprise tiers
     * @returns True if subscription includes Explorer access
     */
    checkAccess(): boolean {
        const allowedTiers: SubscriptionTier[] = ['cloud_plus', 'pro', 'enterprise'];
        return allowedTiers.includes(this.subscriptionTier);
    }

    /**
     * Get the current subscription tier
     */
    getSubscriptionTier(): SubscriptionTier {
        return this.subscriptionTier;
    }

    /**
     * Update the subscription tier
     */
    setSubscriptionTier(tier: SubscriptionTier): void {
        this.subscriptionTier = tier;
    }
}

/**
 * Create a SubscriptionService instance
 */
export function createSubscriptionService(
    subscriptionTier: SubscriptionTier
): SubscriptionService {
    return new SubscriptionService(subscriptionTier);
}
