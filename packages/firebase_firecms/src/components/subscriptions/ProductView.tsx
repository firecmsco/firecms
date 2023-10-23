import { useEffect, useState } from "react";
import { Alert, Chip, LoadingButton, RocketLaunchIcon, Select, SelectItem } from "@firecms/core";
import { ProductPrice, ProductWithPrices, SubscriptionType } from "../../types/subscriptions";
import { getPriceString, getSubscriptionPlanName } from "../settings/common";

export function ProductView({
                                product,
                                includePriceSelect = true,
                                subscribe,
                                projectId
                            }: {
    product: ProductWithPrices,
    projectId?: string,
    includePriceSelect?: boolean,
    subscribe: (projectId: string,
                productPrice: ProductPrice,
                onCheckoutSessionReady: (url: string, error: Error) => void,
                type: SubscriptionType) => Promise<() => void>
}) {

    const [error, setError] = useState<Error>();

    const [selectedPrice, setSelectedPrice] = useState<ProductPrice>();
    const productPrices: ProductPrice[] = product.prices;
    useEffect(() => {
        if (productPrices.length > 0) {
            setSelectedPrice(productPrices[0]);
        }
    }, [productPrices]);

    if (product.metadata.type !== "cloud_pro" && product.metadata.type !== "cloud_plus") {
        throw new Error("Error: Unmapped product type in ProductView");
    }

    const planName = getSubscriptionPlanName(product.metadata.type);

    const priceSelect = productPrices?.length > 1
        ? <>
            <Select
                size={"small"}
                onChange={(e) => {
                    setSelectedPrice(productPrices.find(price => price.id === e.target.value));
                }}
                position={"item-aligned"}
                label={"Choose pricing plan"}
                renderValue={(value) => {
                    const price = productPrices.find(price => price.id === value);
                    return price ? getPriceString(price) : "";
                }}
                value={selectedPrice?.id ?? ""}>
                {productPrices && productPrices.map(price =>
                    <SelectItem key={price.id} value={price.id}>
                        {getPriceString(price)}
                    </SelectItem>
                )}
            </Select>
        </>
        : <Chip
            size={"small"}>
            {getPriceString(productPrices[0]) + " per user"}
        </Chip>;

    const [linkLoading, setLinkLoading] = useState<boolean>(false);

    const doSubscribe = () => {
        if (!projectId || selectedPrice === undefined) return;
        setLinkLoading(true);
        return subscribe(
            projectId,
            selectedPrice,
            (url, error) => {
                if (!url && !error)
                    return;
                if (error) {
                    setError(error);
                }
                if (url) {
                    window.location.assign(url);
                }
                setLinkLoading(false);
            },
            product.metadata.type);
    }

    return <>

        {includePriceSelect && <div className={"my-4"}>
            You can upgrade your project for {priceSelect}
        </div>}

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
