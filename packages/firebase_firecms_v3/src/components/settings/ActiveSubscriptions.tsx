import { useEffect, useState } from "react";

import { Button, Chip, cn, defaultBorderMixin, Paper, Typography } from "@firecms/core";
import { Subscription } from "../../types";
import { getPriceString, getStatusText } from "./common";
import { useFireCMSBackend } from "../../hooks";

interface CurrentSubscriptionViewProps {
    subscription: Subscription;
}

export function CurrentSubscriptionView({
                                            subscription,
                                        }: CurrentSubscriptionViewProps) {
    const { projectsApi } = useFireCMSBackend();

    const statusText = getStatusText(subscription);
    const [stripePortalUrl, setStripePortalUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!stripePortalUrl) {
            projectsApi.getStripePortalLink(subscription.metadata.projectId)
                .then(setStripePortalUrl)
            ;
        }
    }, []);

    return (
        <Paper
            key={subscription.id}
            className="mt-2 mb-2 p-4 -mx-2"
        >
            <div className="flex">
                <Typography
                    className="flex-grow"
                    variant={"h6"}>{subscription.product.name}</Typography>

                <Chip
                    size={"small"}
                    colorScheme={statusText === "Active" ? "greenDark" : "orangeDark"}>
                    {statusText}
                </Chip>
            </div>
            <div className="flex mt-2 items-center">
                <div
                    className="flex-grow flex flex-col items-start gap-2">
                    <Typography>
                        Project: <b>{subscription.metadata.projectId}</b>
                    </Typography>
                    <Chip
                        size={"small"}>
                        {getPriceString(subscription.price) + " per active user"}
                    </Chip>
                    {subscription.cancel_at &&
                        <Typography variant={"caption"}
                                    className="text-secondary">
                            This subscription was <b>cancelled</b> and
                            will be
                            active
                            until {subscription.cancel_at.toDate().toLocaleDateString()}
                        </Typography>}
                </div>

                <Button component={"a"}
                        variant={"text"}
                        className={" " + subscription.canceled_at ? undefined : "text-text-secondary dark:text-text-secondary-dark"}
                        size={"small"}
                        href={stripePortalUrl}
                        target="_blank"
                        rel="noreferrer">{
                    subscription.canceled_at ? "Renew" : "Cancel"
                }</Button>
            </div>

        </Paper>
    );
}

export function ActiveSubscriptions({ activeSubscriptions }: {
    activeSubscriptions: Subscription[],
}) {

    return <div className={cn("my-8 border-t", defaultBorderMixin)}>

        <Typography className="my-4 mt-8 font-medium">
            {"Active Subscriptions".toUpperCase()}
        </Typography>

        {activeSubscriptions.map(subscription => {
            return <CurrentSubscriptionView key={subscription.id}
                                            subscription={subscription}/>;
        })}
    </div>

}
