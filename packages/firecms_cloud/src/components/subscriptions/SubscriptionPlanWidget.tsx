import React from "react";
import { Alert, Button, LoadingButton } from "@firecms/ui";
import { PaywallDialog } from "./Paywall";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { useProjectSubscriptions } from "../../hooks/useProjectSubscriptions";
import { Subscription } from "../../types";
import { useOpenStripePortal } from "./useOpenStripePortal";

export type SubscriptionPlanWidgetProps = {}

export function SubscriptionPlanWidget({ }: SubscriptionPlanWidgetProps) {

    const {
        projectId,
        subscriptionPlan,
        subscriptionData,
        isTrialOver,
        trialValidUntil,
        isGCPMarketplace,
    } = useProjectConfig();

    const { subscriptions: projectSubscriptions } = useProjectSubscriptions(projectId);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    // GCP Marketplace projects don't use Stripe billing — skip all alerts
    if (isGCPMarketplace) return null;

    if (subscriptionData?.subscription_status === "past_due") {
        const pastDueSubscriptions = (projectSubscriptions ?? []).filter(s => s.status === "past_due");
        if (pastDueSubscriptions.length === 0) return null;

        return <PastDueAlert subscription={pastDueSubscriptions[0]} projectId={projectId} />;
    }

    const weAreOnTheLastTwoWeeks = trialValidUntil && trialValidUntil.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;
    if (!subscriptionPlan || subscriptionPlan !== "free") return null;
    if (!weAreOnTheLastTwoWeeks)
        return null;

    return <div className={"my-2 flex flex-col gap-2"}>

        <Alert
            color={"info"}
            action={<Button
                variant="text"
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}>
            {isTrialOver && <>Your trial has ended. Please upgrade to continue using FireCMS Cloud</>}
            {!isTrialOver && <>Your trial is active until {trialValidUntil?.toDateString()}</>}
        </Alert>

        <PaywallDialog
            trialOver={isTrialOver}
            open={dialogOpen} onClose={() => setDialogOpen(false)} />

    </div>;
}

function PastDueAlert({ subscription, projectId }: { subscription: Subscription, projectId: string }) {

    const projectsApi = useFireCMSBackend().projectsApi;

    // Fetched when clicked: each link is a Stripe portal session.
    const {
        openPortal,
        opening
    } = useOpenStripePortal();

    return <Alert
        color={"error"}
        outerClassName={"my-4"}
        action={<LoadingButton
            loading={Boolean(opening)}
            onClick={() => openPortal("payment_method", () => projectsApi.getStripeUpdateLinkForPaymentMethod(subscription.id, projectId))}
            className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
        >
            Update
        </LoadingButton>}>
        <div>Your subscription is past due. Please update your payment method to avoid service disruption</div>
    </Alert>;
}
