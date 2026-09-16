import React from "react";

import { getProducts } from "@/app/common/database";
import { ProductsListView } from "../components/ProductsListView";
import { parseQuery } from "./url";

// Re-rendered at most once a minute, so content edited in the CMS appears on the
// website. Without this the page is built once and never changes in production.
export const revalidate = 60;

export default async function Page({ params }: {
    params: Promise<{ searchParams: Map<string, string> | URLSearchParams }>
}) {
    const { searchParams } = await params;
    const filters = parseQuery(searchParams);
    const products = await getProducts({
        limit: 10,
        categoryFilter: filters.category,
        minPriceFilter: filters.priceMin,
        maxPriceFilter: filters.priceMax
    });

    return <ProductsListView initialProducts={products}
                             initialCategoryFilter={filters.category}/>;
}
