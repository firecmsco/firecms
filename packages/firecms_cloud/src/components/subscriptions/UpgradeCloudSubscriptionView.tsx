import { useState } from "react";
import { Alert, LoadingButton, RocketLaunchIcon } from "@firecms/ui";
import { ProductPrice, ProductWithPrices } from "../../types";
import { useSubscriptionsForUserController } from "../../hooks";
import { CurrencyPriceSelect } from "./CurrencyPriceSelect";

function getDefaultCurrency(productPrice: ProductPrice) {
    return productPrice.currency;
}

export function UpgradeCloudSubscriptionView({
                                                 product,
                                                 includePriceSelect = true,
                                                 largePriceLabel = false,
                                                 projectId
                                             }: {
    product: ProductWithPrices,
    projectId: string,
    includePriceSelect?: boolean,
    largePriceLabel?: boolean,
}) {

    const [error, setError] = useState<Error>();

    const {
        subscribeCloud,
    } = useSubscriptionsForUserController();

    const productPrices: ProductPrice[] = product.prices.filter((p) => Boolean(p.recurring && p.currency_options));

    if (!productPrices) {
        throw new Error("INTERNAL: No product prices found");
    }

    const productPrice = productPrices[0];
    const [currency, setCurrency] = useState<string>(getDefaultCurrency(productPrice));

    if (product.metadata.type !== "pro" && product.metadata.type !== "cloud_plus") {
        throw new Error("Error: Unmapped product type in ProductView");
    }

    const priceSelect = <CurrencyPriceSelect
        price={productPrice}
        currencies={productPrice.currency_options}
        selectedCurrency={currency}
        setSelectedCurrency={setCurrency}
        largePriceLabel={largePriceLabel}/>;

    const [linkLoading, setLinkLoading] = useState<boolean>(false);

    const doSubscribe = () => {
        if (!projectId || currency === undefined) return;
        setLinkLoading(true);
        try {
            subscribeCloud({
                projectId,
                currency,
                onCheckoutSessionReady: (url, error) => {

                    setLinkLoading(false);

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
                }
            });
        } catch (e: any) {
            setLinkLoading(false);
            setError(e);
        }
    }

    return <div className={"flex flex-col gap-4"}>
        <div className={"flex flex-row gap-4"}>
            {includePriceSelect && priceSelect}

            <LoadingButton
                variant={"filled"}
                loading={linkLoading}
                onClick={doSubscribe}
                color={"primary"}
                startIcon={<RocketLaunchIcon/>}>
                Create a subscription
            </LoadingButton>

        </div>
        {error &&
            <Alert color="error" outerClassName={"my-4"}>{error.message}</Alert>
        }

    </div>;
}
