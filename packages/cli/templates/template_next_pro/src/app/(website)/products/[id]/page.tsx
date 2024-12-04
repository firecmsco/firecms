import React from "react";
import { ProductDetailView } from "@/app/common/components/ProductDetailView";
import { getProduct } from "@/app/common/database";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getProduct(id);
    if (!data) {
        return <div>Product not found</div>;
    }
    return (
        <ProductDetailView product={data}/>
    )
}


