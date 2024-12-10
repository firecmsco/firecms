"use client";
import React from "react";
import Link from 'next/link'
import { getCurrencySymbol } from "../utils";
import { ProductWithId } from "@/app/common/types";
import { cls } from "@firecms/ui";

export interface ProductPreviewCardProps {
    product: ProductWithId;
    className?: string;
}

const ProductPreviewCard: React.FC<ProductPreviewCardProps> = ({ product, className }) => {
    return (
        <Link href={"/products/" + product.id}
              className={cls("relative h-72 block w-full rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition duration-300 hover:scale-[1.02] text-white", className)}>
            {product.images.length > 0 && (
                <img className="absolute h-full w-full object-contain p-2 "
                     src={product.images[0]}
                     alt={product.name}/>

            )}

            <div
                className={"h-full relative flex flex-col justify-end bg-gradient-to-t from-surface-600 via-[#00000010] via-40% to-60% pb-2"}>
                <div className="px-6 typography-h6">{product.name}</div>
                <div className="px-6 flex gap-4">
                    {product.price && <span
                        className="flex gap-2 text-white  py-1 text-sm font-semibold mr-2 mb-2 items-center">
                    {getCurrencySymbol(product.currency)}{product.price}
                    </span>}
                </div>
            </div>

        </Link>
    );
};

export default ProductPreviewCard;
