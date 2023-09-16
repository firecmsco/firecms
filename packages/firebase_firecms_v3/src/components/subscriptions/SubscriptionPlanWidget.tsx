import React from "react";
import { Alert, Button } from "firecms";
import { PlansComparisonDialog } from "./PlansComparison";
import { PlanChip } from "./PlanChip";
import { useProjectConfig } from "../../hooks";

export type SubscriptionPlanWidgetProps = {
    message?: React.ReactNode,
    showForPlans?: string[]
}

export function SubscriptionPlanWidget({ message, showForPlans }: SubscriptionPlanWidgetProps) {

    const { subscriptionPlan } = useProjectConfig();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (!subscriptionPlan) return null;
    if (showForPlans && !showForPlans.includes(subscriptionPlan)) return null;

    return <>

        <Alert
            color={"info"}
            className={"my-4"}
            action={<Button
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary"}
                variant={"outlined"}
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}
        >This project is currently in the <PlanChip subscriptionPlan={subscriptionPlan}/> {message}
        </Alert>

        <PlansComparisonDialog open={dialogOpen} onClose={() => setDialogOpen(false)}/>

    </>;
}
