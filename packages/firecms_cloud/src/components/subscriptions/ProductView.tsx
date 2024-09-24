import { useEffect, useState } from "react";
import { Alert, Chip, LoadingButton, RocketLaunchIcon, Select, SelectItem } from "@firecms/ui";
import { ProductPrice, ProductWithPrices, SubscriptionType } from "../../types";
import { getPriceString, getSubscriptionPlanName } from "../settings/common";

export function ProductView({
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

    if (product.metadata.type !== "pro" && product.metadata.type !== "cloud_plus") {
        throw new Error("Error: Unmapped product type in ProductView");
    }

    const planName = getSubscriptionPlanName(product.metadata.type);

    const priceSelect = productPrices?.length > 1
        ? <>
            <Select
                size={"small"}
                invisible={true}
                padding={false}
                onChange={(e) => {
                    setSelectedPrice(productPrices.find(price => price.id === e.target.value));
                }}
                position={"item-aligned"}
                // label={"Choose pricing plan"}
                renderValue={(value) => {
                    const price = productPrices.find(price => price.id === value);
                    if (!price) return null;
                    if (largePriceLabel) {
                        return <span
                            className={"ml-4 mb-4 text-2xl font-bold text-primary text-center my-8"}>{getPriceString(price)}</span>
                    }
                    return <Chip>
                        {price ? getPriceString(price) : ""}
                    </Chip>;
                }}
                value={selectedPrice?.id ?? ""}>
                {productPrices && productPrices.map(price =>
                    <SelectItem key={price.id} value={price.id}>
                        {getPriceString(price)}
                    </SelectItem>
                )}
            </Select>
        </>
        : productPrices ?
            (largePriceLabel ? <span
                    className={"ml-4 mb-4 text-2xl font-bold text-primary text-center my-8"}>{getPriceString(productPrices[0])}</span>
                : <Chip
                    size={"small"}>
                    {getPriceString(productPrices[0])}
                </Chip>)
            : null;

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
                    if (typeof window !== "undefined")
                        // window.open(url, "_blank"); // Open a new tab
                        window.location.assign(url);
                }
                setLinkLoading(false);
            },
            product.metadata.type);
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
