import { useMemo } from "react";
import { createSubscriptionService } from "../services/subscriptionService";
import { SubscriptionTier } from "../types";

interface UseSubscriptionCheckProps {
    subscriptionTier: SubscriptionTier;
}

/**
 * Hook to verify subscription access to Explorer
 */
export function useSubscriptionCheck({ subscriptionTier }: UseSubscriptionCheckProps) {
    const subscriptionService = useMemo(
        () => createSubscriptionService(subscriptionTier),
        [subscriptionTier]
    );

    const hasAccess = useMemo(
        () => subscriptionService.checkAccess(),
        [subscriptionService]
    );

    return {
        hasAccess,
        subscriptionTier
    };
}
