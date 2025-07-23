import React, { useEffect, useState } from "react";
import { useBrowserTitleAndIcon } from "@firecms/core";
import { AutoAwesomeIcon, Card, Chip, CircularProgress, cls, Typography, } from "@firecms/ui";
import { useSubscriptionsForUserController } from "../../hooks/useSubscriptionsForUserController";
import { UpgradeCloudSubscriptionView } from "./UpgradeCloudSubscriptionView";
import { getPriceString, getSubscriptionStatusText } from "../settings/common";
import { Subscription } from "../../types";
import { StripeDisclaimer } from "./StripeDisclaimer";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";

export function ProjectSubscriptionPlans() {

    const {
        subscriptionPlan,
        projectId,
        trialValidUntil
    } = useProjectConfig();

    if (!subscriptionPlan)
        throw new Error("No subscription plan");

    useBrowserTitleAndIcon("Plans")

    const {
        products,
        subscribeCloud,
        activeSubscriptions,
        getSubscriptionsForProject
    } = useSubscriptionsForUserController();

    const projectSubscriptions = getSubscriptionsForProject(projectId);

    const loading = projectSubscriptions === undefined || products === undefined;

    const cloudProducts = (products ?? []).filter(p => p.metadata?.type === "cloud_plus" || p.metadata?.type === "pro");

    const plusProduct = cloudProducts.find(p => p.metadata?.type === "cloud_plus");
    const plusSubscription = projectSubscriptions.find(s => s.product.metadata?.type === "cloud_plus");

    const isSubscribed = subscriptionPlan === "cloud_plus";
    return (
        <div className={"relative"}>

            {loading &&
                <div className={"absolute w-full h-full flex items-center justify-center"}><CircularProgress/></div>}

            <div className={cls("grid grid-cols-12 gap-4 items-center", loading ? "collapse" : "")}>

                <div className={"col-span-12 md:col-span-7 flex flex-col gap-2"}>

                    <Typography variant={"h4"} className="mt-4 mb-2">Subscription Plan</Typography>

                    {isSubscribed &&
                        <Typography
                            variant={"subtitle1"}
                            className="my-2">
                            You are currently subscribed to <Chip size={"small"}>FireCMS Cloud</Chip>.
                        </Typography>}

                    {!isSubscribed && trialValidUntil &&
                        <Typography
                            variant={"subtitle1"}
                            className="my-2">
                            Your trial is valid until {trialValidUntil.toLocaleDateString()}.
                        </Typography>}

                    {subscriptionPlan !== "cloud_plus" && plusProduct && <UpgradeCloudSubscriptionView
                        product={plusProduct}
                        projectId={projectId}
                        subscribeCloud={subscribeCloud}/>}

                    {isSubscribed && plusSubscription &&
                        <CurrentCloudSubscriptionView subscription={plusSubscription}/>}

                    <StripeDisclaimer/>

                </div>

                <div className={cls("col-span-12 md:col-span-5")}>
                    <Card
                        className={"p-6 bg-amber-200 dark:bg-amber-700 border-amber-300 dark:border-amber-800 flex flex-col gap-4"}>

                        <div>These are some of the features you are already enjoying by using FireCMS Cloud
                        </div>

                        <ul className={"px-2 text-base"}>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                Managed always up-to-date service
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                Local text search
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>Unlimited
                                users and roles
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>Theme and
                                logo customization
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                Custom form fields and custom views
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                Secondary databases
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>AI
                                content generation with OpenAI and Google
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                Unlimited data export
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"}/>
                                AppCheck
                            </li>
                        </ul>
                    </Card>

                </div>
            </div>
        </div>
    );

}

interface CurrentSubscriptionViewProps {
    subscription: Subscription;
}

function CurrentCloudSubscriptionView({
                                          subscription,
                                      }: CurrentSubscriptionViewProps) {

    const {
        getBackendAuthToken,
        projectsApi
    } = useFireCMSBackend();

    const statusText = getSubscriptionStatusText(subscription);
    const [cancelLinkUrl, setCancelLinkUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!cancelLinkUrl && !subscription.canceled_at) {
            projectsApi.getStripeCancelLinkForSubscription(subscription.id)
                .then(setCancelLinkUrl);
        }
    }, [subscription.canceled_at]);

    return (
        <div
            key={subscription.id}
            className="mt-2 mb-2"
        >
            <div>
                <>
                    The subscription is <Chip
                    className={"inline"}
                    size={"small"}
                    colorScheme={statusText === "Active" ? "greenDark" : "orangeDark"}>
                    {statusText} </Chip>.
                </>

                {subscription.current_period_end && <> The next payment is
                    on {subscription.current_period_end.toDate().toLocaleDateString()}. </>}

                <>
                    The current price is <Chip
                    size={"small"}>{getPriceString(subscription.price)}
                </Chip>per user.
                </>

                {subscription.cancel_at && <> This subscription was <b>cancelled</b> and
                    will be active
                    until {subscription.cancel_at.toDate().toLocaleDateString()}. </>}

                {!subscription.canceled_at && <a
                    className={" " + subscription.canceled_at ? undefined : "text-text-secondary dark:text-text-secondary-dark"}
                    href={cancelLinkUrl}
                    target="_blank" rel="noreferrer">{
                    " Manage subscription"
                }</a>}
            </div>

        </div>
    );
}
