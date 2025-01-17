import { UpgradeCloudSubscriptionView } from "./UpgradeCloudSubscriptionView";
import { useProjectConfig, useSubscriptionsForUserController } from "../../hooks";
import { LoadingButton, RocketLaunchIcon } from "@firecms/ui";
import { ProductPrice } from "../../types";

export function UpgradeToPlusButton({
                                        includePriceSelect,
                                        largePriceLabel
                                    }: {
    includePriceSelect: boolean,
    largePriceLabel: boolean
}) {
    const {
        subscriptionPlan,
        projectId
    } = useProjectConfig();

    if (!subscriptionPlan)
        throw new Error("No subscription plan");

    const {
        products,
        subscribeCloud
    } = useSubscriptionsForUserController();

    const plusProduct = products?.find(p => p.metadata?.type === "cloud_plus");

    if (!plusProduct) {
        return <LoadingButton
            variant={"filled"}
            loading={true}
            startIcon={<RocketLaunchIcon/>}>
            Create a subscription
        </LoadingButton>
    }

    return <UpgradeCloudSubscriptionView
        includePriceSelect={includePriceSelect}
        largePriceLabel={largePriceLabel}
        product={plusProduct}
        projectId={projectId}
        subscribeCloud={subscribeCloud}/>
}

function getPriceString(price: ProductPrice) {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: price.currency
    }).format(price.unit_amount / 100) + " per " + price.interval;
}
