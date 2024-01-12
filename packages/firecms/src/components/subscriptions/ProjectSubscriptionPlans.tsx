import React, { useEffect, useState } from "react";
import { CircularProgressCenter, useBrowserTitleAndIcon } from "@firecms/core";
import { AutoAwesomeIcon, Card, Chip, cn, Typography, } from "@firecms/ui";
import { useSubscriptionsForUserController } from "../../hooks/useSubscriptionsForUserController";
import { ProductView } from "./ProductView";
import { getPriceString, getStatusText } from "../settings/common";
import { Subscription } from "../../types/subscriptions";
import { StripeDisclaimer } from "./StripeDisclaimer";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { PlanChip } from "./PlanChip";

export function ProjectSubscriptionPlans({ uid }: {
    uid: string
}) {

    const { backendFirebaseApp } = useFireCMSBackend();
    const { subscriptionPlan, projectId } = useProjectConfig();
    if (!subscriptionPlan)
        throw new Error("No subscription plan");

    useBrowserTitleAndIcon("Plans")

    const {
        products,
        subscribe,
        getSubscriptionsForProject
    } = useSubscriptionsForUserController({
        firebaseApp: backendFirebaseApp,
    });

    const projectSubscriptions = getSubscriptionsForProject(projectId);

    if (projectSubscriptions === undefined || products === undefined) {
        return <CircularProgressCenter/>
    }

    const cloudProducts = products.filter(p => p.metadata?.type === "cloud_plus" || p.metadata?.type === "cloud_pro");

    const plusProduct = cloudProducts.find(p => p.metadata?.type === "cloud_plus");
    const plusSubscription = projectSubscriptions.find(s => s.product.metadata?.type === "cloud_plus");

    return (
        <div className={"grid grid-cols-12 gap-4 items-center"}>

            <div className={"col-span-12 md:col-span-7 flex flex-col gap-2"}>

                <Typography variant={"h4"} className="mt-4 mb-2">Subscription Plan</Typography>

                <Typography
                    variant={"subtitle1"}
                    className="my-2">
                    This project is on the <PlanChip subscriptionPlan={subscriptionPlan}/>

                </Typography>

                {subscriptionPlan !== "cloud_plus" && plusProduct && <ProductView
                    product={plusProduct}
                    projectId={projectId}
                    subscribe={subscribe}/>}

                {subscriptionPlan === "cloud_plus" && plusSubscription &&
                    <CurrentSubscriptionView subscription={plusSubscription}/>}

                <StripeDisclaimer/>

            </div>

            <div className={cn("col-span-12 md:col-span-5")}>
                <Card
                    className={"p-6 bg-amber-200 dark:bg-amber-700 border-amber-300 dark:border-amber-800 flex flex-col gap-4"}>

                    {subscriptionPlan === "free" && <div>Upgrade to the <b>PLUS</b> plan to enable the following
                        features:</div>}

                    {subscriptionPlan === "cloud_plus" && <div>By being on the <b>PLUS</b> plan you are enjoying the
                        following features:</div>}

                    <ul className={"px-2 text-base"}>
                        <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>Unlimited
                            users and roles
                        </li>
                        <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>Theme and
                            logo customization
                        </li>
                        <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>Custom
                            user
                            roles
                        </li>
                        <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>GPT-4
                            content generation
                        </li>
                    </ul>
                </Card>

            </div>
        </div>

    );

}

interface CurrentSubscriptionViewProps {
    subscription: Subscription;
}

function CurrentSubscriptionView({
                                     subscription,
                                 }: CurrentSubscriptionViewProps) {

    const { getBackendAuthToken, projectsApi } = useFireCMSBackend();

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
        <div
            key={subscription.id}
            className="mt-2 mb-2"
        >
            <div>
                <>
                    The subscription is <Chip
                    className={"inline"}
                    size={"smaller"}
                    colorScheme={statusText === "Active" ? "greenDark" : "orangeDark"}>
                    {statusText} </Chip>.
                </>

                {subscription.current_period_end && <> The next payment is
                    on {subscription.current_period_end.toDate().toLocaleDateString()}. </>}

                <>
                    The current price is <Chip
                    size={"smaller"}>{getPriceString(subscription.price)}
                </Chip>per active user.
                </>

                {subscription.cancel_at && <> This subscription was <b>cancelled</b> and
                    will be active
                    until {subscription.cancel_at.toDate().toLocaleDateString()}. </>}

                <a
                    className={" " + subscription.canceled_at ? undefined : "text-text-secondary dark:text-text-secondary-dark"}
                    href={stripePortalUrl}
                    target="_blank" rel="noreferrer">{
                    subscription.canceled_at ? " Renew subscription" : " Cancel subscription"
                }</a>
            </div>

        </div>
    );
}
