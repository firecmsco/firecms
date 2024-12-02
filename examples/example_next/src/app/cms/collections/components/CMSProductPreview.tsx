import { Product, ProductWithId } from "@/app/common/types";
import { convertProduct } from "@/app/common/database";
import React, { useEffect } from "react";
import { CircularProgress } from "@firecms/ui";
import { ProductDetailView } from "@/app/common/components/ProductDetailView";

export function CMSBProductPreview({ product, id }: {
    product?: Product,
    id: string
}) {

    const [convertedProduct, setConvertedProduct] = React.useState<ProductWithId | null>(null);
    useEffect(() => {
        if (product)
            convertProduct(product, id).then(setConvertedProduct);
    }, [product, id]);

    if (!convertedProduct) {
        return <CircularProgress/>;
    }

    return <ProductDetailView product={convertedProduct}/>;

}
