import React, { useEffect, useState } from "react";
import { useBrowserTitleAndIcon, useTranslation } from "@firecms/core";
import { AutoAwesomeIcon, Button, Card, Chip, CircularProgress, cls, Typography, } from "@firecms/ui";
import { useSubscriptionsForUserController } from "../../hooks/useSubscriptionsForUserController";
import { UpgradeCloudSubscriptionView } from "./UpgradeCloudSubscriptionView";
import { formatPrice, getPriceString, getSubscriptionStatusText } from "../settings/common";
import { Subscription } from "../../types";
import { StripeDisclaimer } from "./StripeDisclaimer";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";

export function ProjectSubscriptionPlans() {

    const {
        subscriptionPlan,
        projectId,
        trialValidUntil
    } = useProjectConfig();

    const { t } = useTranslation();

    if (!subscriptionPlan)
        throw new Error("No subscription plan");

    useBrowserTitleAndIcon("Plans")

    const {
        products,
        getSubscriptionsForProject
    } = useSubscriptionsForUserController();

    const projectSubscriptions = getSubscriptionsForProject(projectId);

    const loading = projectSubscriptions === undefined || products === undefined;

    const cloudProducts = (products ?? []).filter(p => p.metadata?.type === "cloud_plus" || p.metadata?.type === "pro");

    const plusProduct = cloudProducts.find(p => p.metadata?.type === "cloud_plus");
    const plusSubscription = projectSubscriptions.find(s => s.product.metadata?.type === "cloud_plus");

    const trialIsActive = Boolean(trialValidUntil && trialValidUntil > new Date());

    const activePlusSubscription = projectSubscriptions.find(s => s.product.metadata?.type === "cloud_plus" && s.status === "active");
    const isSubscribed = Boolean(activePlusSubscription);

    return (
        <div className={"relative"}>

            {loading &&
                <div className={"absolute w-full h-full flex items-center justify-center"}><CircularProgress /></div>}

            <div className={cls("grid grid-cols-12 gap-4 items-center", loading ? "collapse" : "")}>

                <div className={"col-span-12 md:col-span-7 flex flex-col gap-2"}>

                    <Typography variant={"h4"} className="mt-4 mb-2">{t("settings_subscription_plan")}</Typography>

                    {isSubscribed &&
                        <Typography
                            variant={"subtitle1"}
                            className="my-2">
                            {t("settings_subscribed_to")} <Chip size={"small"}>FireCMS Cloud</Chip>.
                        </Typography>}

                    {!isSubscribed && <Typography
                        variant={"subtitle1"}
                        className="my-2">
                        {t("settings_no_active_subscription")}
                    </Typography>}


                    {!isSubscribed && trialIsActive && trialValidUntil &&
                        <Typography
                            variant={"subtitle1"}
                            className="my-2">
                            {t("settings_trial_valid_until", { date: trialValidUntil.toLocaleDateString() })}
                        </Typography>}

                    {!isSubscribed && plusProduct && <UpgradeCloudSubscriptionView
                        product={plusProduct}
                        projectId={projectId} />}


                    {isSubscribed && plusSubscription &&
                        <CurrentCloudSubscriptionView subscription={plusSubscription} />}

                    <StripeDisclaimer />

                </div>

                <div className={cls("col-span-12 md:col-span-5")}>
                    <Card
                        className={"p-6 bg-amber-200 dark:bg-amber-700 border-amber-300 dark:border-amber-800 flex flex-col gap-4"}>

                        <div>{t("settings_features_intro")}
                        </div>

                        <ul className={"px-2 text-base"}>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_managed_service")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_local_text_search")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_unlimited_users_roles")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_theme_logo")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_custom_fields_views")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_secondary_databases")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_ai_content")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_unlimited_export")}
                            </li>
                            <li className={"flex gap-4 items-center py-0.5"}><AutoAwesomeIcon size={"small"} />
                                {t("settings_feature_appcheck")}
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

    const { t } = useTranslation();

    const statusText = getSubscriptionStatusText(subscription);
    const [cancelLinkUrl, setCancelLinkUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!cancelLinkUrl && !subscription.canceled_at) {
            projectsApi.getStripeCancelLinkForSubscription(subscription.id)
                .then(setCancelLinkUrl);
        }
    }, [subscription.canceled_at]);

    const [stripeUpdatePaymentUrl, setStripeUpdatePaymentUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (subscription.id) {
            projectsApi.getStripeUpdateLinkForPaymentMethod(subscription.id)
                .then(setStripeUpdatePaymentUrl);
        }
    }, []);

    // Detect if this is a per-seat subscription vs legacy metered billing
    const isPerSeatBilling = subscription.items?.[0]?.price?.lookup_key === "cloud_per_seat";
    const seatCount = subscription.items?.[0]?.quantity ?? subscription.quantity;
    const seatPrice = subscription.items?.[0]?.price?.unit_amount;
    const seatCurrency = subscription.items?.[0]?.price?.currency ?? subscription.price?.currency ?? "eur";

    return (
        <div
            key={subscription.id}
            className="mt-2 mb-2"
        >
            <div className={"flex flex-col gap-2"}>
                <div>
                    {t("settings_subscription_is")} <Chip
                        className={"inline"}
                        size={"small"}
                        colorScheme={statusText === "Active" ? "greenDark" : "orangeDark"}>
                        {statusText} </Chip>.

                    {subscription.current_period_end && !subscription.canceled_at && <> {t("settings_next_payment_on", { date: subscription.current_period_end.toDate().toLocaleDateString() })} </>}

                    {isPerSeatBilling ? (
                        <>
                            {t("settings_seats_count")} <Chip size={"small"}>{seatCount} {seatCount === 1 ? t("settings_seat") : t("settings_seats")}</Chip>
                            {seatPrice && <> {t("settings_per_seat", { price: formatPrice(seatPrice, seatCurrency), interval: subscription.interval ?? "month" })}</>}.
                        </>
                    ) : (
                        <>
                            {t("settings_current_price")} <Chip
                                size={"small"}>{getPriceString(subscription.price)}
                            </Chip> {t("settings_per_user_usage")}
                        </>
                    )}

                    {subscription.cancel_at && <>
                        {" "}{t("settings_cancelled_active_until", { date: subscription.cancel_at.toDate().toLocaleDateString() })}
                        {isPerSeatBilling && <> {t("settings_no_additional_charges")}</>}
                    </>}

                    {!subscription.canceled_at && <a
                        className={" " + subscription.canceled_at ? undefined : "text-text-secondary dark:text-text-secondary-dark"}
                        href={cancelLinkUrl}
                        target="_blank" rel="noreferrer">{
                            " " + t("settings_manage_subscription")
                        }</a>}

                </div>

                {stripeUpdatePaymentUrl && <Button component={"a"}
                    variant={"filled"}
                    color={"neutral"}
                    size={"small"}
                    href={stripeUpdatePaymentUrl}
                    target="_blank"
                    rel="noreferrer">
                    Update payment method
                </Button>}

            </div>

        </div>
    );
}
