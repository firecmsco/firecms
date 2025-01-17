import React, { useEffect } from "react";
import { Alert, Button, CircularProgress } from "@firecms/ui";
import { PaywallDialog } from "./Paywall";
import { useFireCMSBackend, useProjectConfig, useSubscriptionsForUserController } from "../../hooks";
import { Subscription } from "../../types";

export type SubscriptionPlanWidgetProps = {}

export function SubscriptionPlanWidget({}: SubscriptionPlanWidgetProps) {

    const {
        projectId,
        subscriptionPlan,
        subscriptionData,
        isTrialOver,
        trialValidUntil
    } = useProjectConfig();

    const subscriptionsController = useSubscriptionsForUserController();
    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (subscriptionData?.subscription_status === "past_due") {
        const pastDueSubscriptions = (subscriptionsController.activeSubscriptions ?? []).filter(s => s.status === "past_due" && s.metadata.projectId === projectId);
        if (pastDueSubscriptions.length === 0) return null;

        return <PastDueAlert subscription={pastDueSubscriptions[0]}/>;
    }

    if (!subscriptionPlan || subscriptionPlan !== "free") return null;

    return <div className={"my-2 flex flex-col gap-2"}>

        <Alert
            color={"info"}
            action={<Button
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}>
            {isTrialOver && <div>Your trial has ended. Please upgrade to continue using FireCMS Cloud</div>}
            {!isTrialOver && <div>Your trial is active until {trialValidUntil?.toDateString()}</div>}
        </Alert>

        <PaywallDialog
            trialOver={isTrialOver}
            open={dialogOpen} onClose={() => setDialogOpen(false)}/>

    </div>;
}

function PastDueAlert({ subscription }: { subscription: Subscription }) {

    const projectsApi = useFireCMSBackend().projectsApi;

    const [url, setUrl] = React.useState<string | null>(null);
    useEffect(() => {
        projectsApi.getStripeUpdateLinkForPaymentMethod(subscription.id)
            .then(setUrl)
            .catch(console.error);
    }, []);

    return <Alert
        color={"error"}
        className={"my-4"}
        action={url
            ? <Button
                component={"a"}
                href={url}
                target={"_blank"}
                rel="noopener noreferrer"
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}>
                Update
            </Button>
            : <CircularProgress size={"smallest"}/>}>
        <div>Your subscription is past due. Please update your payment method to avoid service disruption</div>
    </Alert>;
}
