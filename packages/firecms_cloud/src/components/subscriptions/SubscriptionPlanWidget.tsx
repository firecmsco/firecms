import React, { useEffect } from "react";
import { Alert, Button, CircularProgress, Typography } from "@firecms/ui";
import { PlansComparisonDialog } from "./PlansComparison";
import { PlanChip } from "./PlanChip";
import { useFireCMSBackend, useProjectConfig, useSubscriptionsForUserController } from "../../hooks";
import { Subscription } from "../../types";
import { useUserManagement } from "@firecms/user_management";

export type SubscriptionPlanWidgetProps = {
    message?: React.ReactNode,
    showForPlans?: string[],
    includeCTA?: boolean,
    includeTooManyUsersAlert?: boolean
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

export function SubscriptionPlanWidget({
                                           message,
                                           showForPlans,
                                           includeCTA = true,
                                           includeTooManyUsersAlert = false
                                       }: SubscriptionPlanWidgetProps) {

    const {
        projectId,
        subscriptionPlan,
        subscriptionData
    } = useProjectConfig();

    const {
        users,
        usersLimit
    } = useUserManagement();

    const tooManyUsers = usersLimit !== undefined && users && users.length > usersLimit;

    const subscriptionsController = useSubscriptionsForUserController();
    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (subscriptionData?.subscription_status === "past_due") {
        const pastDueSubscriptions = (subscriptionsController.activeSubscriptions ?? []).filter(s => s.status === "past_due" && s.metadata.projectId === projectId);
        if (pastDueSubscriptions.length === 0) return null;

        return <PastDueAlert subscription={pastDueSubscriptions[0]}/>;
    }

    if (!subscriptionPlan) return null;
    if (showForPlans && !showForPlans.includes(subscriptionPlan)) return null;

    return <div className={"my-2 flex flex-col gap-2"}>

        <Alert
            color={"info"}
            action={includeCTA && <Button
                className={"dark:!text-white dark:border-white dark:hover:bg-white dark:hover:!text-primary min-w-content"}
                variant={"outlined"}
                onClick={() => setDialogOpen(true)}>
                More info
            </Button>}>
            <div>This project is currently in the <PlanChip
                subscriptionPlan={subscriptionPlan}/>
                <span
                    className={"ml-2"}>{!message && "Try out all the PLUS features for free!"}</span></div>
            <Typography variant={"caption"}>{message}</Typography>
        </Alert>

        {includeTooManyUsersAlert && tooManyUsers && <Alert
            color={"error"}>
            <div>You have registered more users than you plan allows</div>
            <Typography variant={"caption"}>Some users will not be able to access FireCMS Cloud</Typography>
        </Alert>}


        <PlansComparisonDialog open={dialogOpen} onClose={() => setDialogOpen(false)}/>

    </div>;
}
