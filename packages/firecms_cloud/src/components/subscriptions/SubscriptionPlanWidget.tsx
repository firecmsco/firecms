import React from "react";
import { Alert, Button } from "@firecms/ui";
import { PlansComparisonDialog } from "./PlansComparison";
import { PlanChip } from "./PlanChip";
import { useProjectConfig, useSubscriptionsForUserController } from "../../hooks";

export type SubscriptionPlanWidgetProps = {
    message?: React.ReactNode,
    showForPlans?: string[],
    includeCTA?: boolean
}

export function SubscriptionPlanWidget({
                                           message,
                                           showForPlans,
                                           includeCTA = true
                                       }: SubscriptionPlanWidgetProps) {

    const {
        projectId,
        subscriptionPlan,
        subscriptionData
    } = useProjectConfig();
    const subscriptionsController = useSubscriptionsForUserController();
    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (subscriptionData?.subscription_status === "past_due") {
        const pastDueSubscriptions = (subscriptionsController.activeSubscriptions ?? []).filter(s => s.status === "past_due" && s.metadata.projectId === projectId);
        if (pastDueSubscriptions.length === 0) return null;

        return <Alert
            color={"error"}
            className={"my-4"}
            action={includeCTA && <Button
                component={"a"}
                href={pastDueSubscriptions[0].stripeLink}
                target={"_blank"}
                rel="noopener noreferrer"
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}>
                Update
            </Button>}>
            <div>Your subscription is past due. Please update your payment method to avoid service disruption</div>
            <div>{message}</div>
        </Alert>;
    }

    if (!subscriptionPlan) return null;
    if (showForPlans && !showForPlans.includes(subscriptionPlan)) return null;

    return <>

        <Alert
            color={"info"}
            className={"my-4"}
            action={includeCTA && <Button
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}>
            <div>This project is currently in the <PlanChip
                subscriptionPlan={subscriptionPlan}/> {!message && "Try out all the PLUS features for free!"}</div>
            <div>{message}</div>
        </Alert>

        <PlansComparisonDialog open={dialogOpen} onClose={() => setDialogOpen(false)}/>

    </>;
}
