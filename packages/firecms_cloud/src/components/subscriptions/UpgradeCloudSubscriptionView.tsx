import { useEffect, useState } from "react";
import { Alert, LoadingButton, RocketLaunchIcon } from "@firecms/ui";
import { ProductPrice, ProductWithPrices } from "../../types";
import { SubscribeCloudParams } from "../../hooks";
import { CurrencyPriceSelect } from "./CurrencyPriceSelect";

function getDefaultCurrency(productPrice: ProductPrice) {
    return productPrice.currency;
}

// get the user locale based on the browser
function getUserLocale() {
    return navigator.language || "en-US";
}

export function UpgradeCloudSubscriptionView({
                                            product,
                                            includePriceSelect = true,
                                            largePriceLabel = false,
                                            subscribeCloud,
                                            projectId
                                        }: {
    product: ProductWithPrices,
    projectId?: string,
    includePriceSelect?: boolean,
    largePriceLabel?: boolean,
    subscribeCloud: (params: SubscribeCloudParams) => Promise<void>
}) {

    const [error, setError] = useState<Error>();

    const productPrices: ProductPrice[] = product.prices.filter((p) => Boolean(p.recurring && p.currency_options));

    if (!productPrices) {
        throw new Error("INTERNAL: No product prices found");
    }

    const productPrice = productPrices[0];
    const currencies = Object.keys(productPrice.currency_options);
    const [currency, setCurrency] = useState<string>(getDefaultCurrency(productPrice));

    if (product.metadata.type !== "pro" && product.metadata.type !== "cloud_plus") {
        throw new Error("Error: Unmapped product type in ProductView");
    }

    console.log("currency", currency);
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
        return subscribeCloud({
            projectId,
            currency,
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
            }
        });
    }

    return <>

        {includePriceSelect && priceSelect}

        <LoadingButton
            variant={"filled"}
            loading={linkLoading}
            onClick={doSubscribe}
            startIcon={<RocketLaunchIcon/>}>
            Create a subscription
        </LoadingButton>

        {error &&
            <Alert color="error" className={"my-4"}>{error.message}</Alert>
        }

    </>;
}
