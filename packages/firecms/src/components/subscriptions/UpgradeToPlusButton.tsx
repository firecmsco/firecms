import { ProductView } from "./ProductView";
import { useFireCMSBackend, useProjectConfig, useSubscriptionsForUserController } from "../../hooks";
import { LoadingButton, RocketLaunchIcon } from "@firecms/ui";
import { ProductPrice } from "../../types";

export function UpgradeToPlusButton({
                                        includePriceSelect,
                                        includePriceLabel,
                                        largePriceLabel
                                    }: {
    includePriceSelect: boolean,
    includePriceLabel: boolean,
    largePriceLabel: boolean
}) {
    const { backendFirebaseApp } = useFireCMSBackend();
    const {
        subscriptionPlan,
        projectId
    } = useProjectConfig();
    if (!subscriptionPlan)
        throw new Error("No subscription plan");
    const {
        products,
        subscribe,
        getSubscriptionsForProject
    } = useSubscriptionsForUserController({
        firebaseApp: backendFirebaseApp,
    });

    const plusProduct = products?.find(p => p.metadata?.type === "cloud_plus");

    if (!plusProduct) {
        return <LoadingButton
            variant={"filled"}
            loading={true}
            startIcon={<RocketLaunchIcon/>}>
            Upgrade to PLUS
        </LoadingButton>
    }

    return <ProductView
        includePriceSelect={includePriceSelect}
        includePriceLabel={includePriceLabel}
        largePriceLabel={largePriceLabel}
        product={plusProduct}
        projectId={projectId}
        subscribe={subscribe}/>
}

function getPriceString(price: ProductPrice) {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: price.currency
    }).format(price.unit_amount / 100) + " per " + price.interval;
}
