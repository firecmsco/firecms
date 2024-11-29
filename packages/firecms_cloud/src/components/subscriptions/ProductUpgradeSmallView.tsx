import { useEffect, useState } from "react";
import { Alert, LoadingButton, RocketLaunchIcon } from "@firecms/ui";
import { ProductPrice, ProductWithPrices } from "../../types";
import { getSubscriptionPlanName } from "../settings";
import { SubscriptionPriceSelect } from "./SubscriptionPriceSelect";
import { SubscribeParams } from "../../hooks";

export function ProductUpgradeSmallView({
                                            product,
                                            includePriceSelect = true,
                                            includePriceLabel = true,
                                            largePriceLabel = false,
                                            subscribe,
                                            projectId
                                        }: {
    product: ProductWithPrices,
    projectId?: string,
    includePriceSelect?: boolean,
    includePriceLabel?: boolean,
    largePriceLabel?: boolean,
    subscribe: (params: SubscribeParams) => Promise<void>
}) {

    const [error, setError] = useState<Error>();

    const [selectedPrice, setSelectedPrice] = useState<ProductPrice>();
    const productPrices: ProductPrice[] = product.prices;
    useEffect(() => {
        if (productPrices.length > 0) {
            setSelectedPrice(productPrices[0]);
        }
    }, [productPrices]);

    if (product.metadata.type !== "pro" && product.metadata.type !== "cloud_plus") {
        throw new Error("Error: Unmapped product type in ProductView");
    }

    const planName = getSubscriptionPlanName(product.metadata.type);

    const priceSelect = <SubscriptionPriceSelect
        productPrices={productPrices}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        largePriceLabel={largePriceLabel}/>;

    const [linkLoading, setLinkLoading] = useState<boolean>(false);

    const doSubscribe = () => {
        if (!projectId || selectedPrice === undefined) return;
        setLinkLoading(true);
        return subscribe({
            projectId,
            productPrice: selectedPrice,
            onCheckoutSessionReady: (url, error) => {
                if (!url && !error)
                    return;
                if (error) {
                    setError(error);
                }
                if (url) {
                    if (typeof window !== "undefined")
                        // window.open(url, "_blank"); // Open a new tab
                        window.location.assign(url);
                }
                setLinkLoading(false);
            },
            type: product.metadata.type
        });
    }

    return <>

        {includePriceSelect && <>
            {includePriceLabel && <div className={"my-2 flex items-center gap-2"}>
                You can upgrade your project for {priceSelect}
            </div>}
            {!includePriceLabel && priceSelect}
        </>}

        <LoadingButton
            variant={"filled"}
            loading={linkLoading}
            onClick={doSubscribe}
            startIcon={<RocketLaunchIcon/>}>
            Upgrade to {planName}
        </LoadingButton>

        {error &&
            <Alert color="error" className={"my-4"}>{error.message}</Alert>
        }

    </>;
}
