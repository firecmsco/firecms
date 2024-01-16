import { ProductView } from "./ProductView";
import { useFireCMSBackend, useProjectConfig, useSubscriptionsForUserController } from "../../hooks";
import { LoadingButton, RocketLaunchIcon } from "@firecms/ui";

export function UpgradeToPlusButton({}: {}) {
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

    // if (products === undefined) {
    //     return <CircularProgress/>
    // }

    const cloudProducts = products
        ? products.filter(p => p.metadata?.type === "cloud_plus" || p.metadata?.type === "cloud_pro")
        : [];

    const plusProduct = cloudProducts.find(p => p.metadata?.type === "cloud_plus");

    if (!plusProduct) {
        return <LoadingButton
            variant={"filled"}
            loading={true}
            startIcon={<RocketLaunchIcon/>}>
            Upgrade to PLUS
        </LoadingButton>
    }

    return <ProductView
        includePriceSelect={false}
        product={plusProduct}
        projectId={projectId}
        subscribe={subscribe}/>
}
