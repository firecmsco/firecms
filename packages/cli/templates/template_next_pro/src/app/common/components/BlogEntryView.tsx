"use client";
import React from "react";

import { CircularProgress, cls, Container, Markdown, Typography, } from "@firecms/ui";
import { BlogEntryWithId, ProductWithId } from "../types";
import ProductPreviewCard from "@/app/common/components/ProductPreviewCard";

/**
 * This is a sample view used to render the content of a blog entry.
 * It is bound to the data that is modified in the form.
 */
export function BlogEntryView({ blogEntry }: { blogEntry: BlogEntryWithId }) {

    return (
        <div>

            {blogEntry.header_image && <img
                alt={"Header"}
                style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover"
                }}
                src={blogEntry.header_image}
            />}

            <Container className={"mb-16"}>

                <Container maxWidth={"5xl"} className={"my-12"}>
                    {blogEntry?.name && <Typography variant={"h1"} className="mt-16 mb-8 mx-4 md:mx-12">
                        {blogEntry.name}
                    </Typography>}
                    {blogEntry?.tags && <div className={"mx-4 md:mx-12"}>
                        {blogEntry?.tags.map((tag, index) => <span key={`tag_${index}`}
                                                                   className="text-sm bg-secondary text-white px-3 py-1.5 rounded-lg mr-2">
                            {tag}
                        </span>)}
                    </div>}
                </Container>

                {blogEntry?.content && blogEntry.content
                    .filter((e: any) => !!e)
                    .map(
                        (entry: any, index: number) => {
                            if (entry.type === "text")
                                return <Text key={`preview_text_${index}`}
                                             markdownText={entry.value}/>;
                            if (entry.type === "quote")
                                return <Quote key={`preview_text_${index}`}
                                              quoteText={entry.value}/>;
                            if (entry.type === "images")
                                return <Images key={`preview_images_${index}`}
                                               images={entry.value}/>;
                            if (entry.type === "products")
                                return <ProductGroupPreview
                                    key={`preview_products_${index}`}
                                    products={entry.value}/>;
                            return <div key={`preview_images_${index}`}>Unexpected value in blog entry</div>;
                        }
                    )}

            </Container>

        </div>
    );

}

export function Images({ images }: {
    images: string[]
}) {
    if (!Array.isArray(images))
        return <></>;
    return <div className="flex justify-center my-1 sm:my-3 md:my-6">
        {images.map((url, index) =>
            <div key={`images_${index}`}
                 className=" w-full h-[350px]">
                <img src={url} className={"w-full h-full object-cover"}/>
            </div>
        )}
    </div>;
}

function Text({ markdownText }: {
    markdownText: string
}) {

    if (!markdownText)
        return <></>;

    return <Container maxWidth={"5xl"}>
        <div className="mt-12 mb-12 mx-4 md:mx-12">
            <Markdown source={markdownText}/>
        </div>
    </Container>;
}

function ProductGroupPreview({ products }: {
    products: ProductWithId[]
}) {

    if (!products) return <CircularProgress/>;

    const manyProducts = products.length > 3;

    return <div className={cls("flex gap-4 items-center max-w-5xl mx-auto px-4 md:px-12", {
        "flex-wrap": manyProducts,
    })}>
        {products.map((p, index) => <ProductPreviewCard
            className={cls("w-full", {
                "flex-grow": !manyProducts,
            })}
            key={`products_${index}`}
            product={p}/>)}
    </div>;
}


function Quote({ quoteText }: {
    quoteText: string
}) {

    if (!quoteText)
        return <></>;

    return <Container maxWidth={"5xl"} className={"border-l-2 border-l-red-950 dark:border-l-red-100 my-8 mx-8 italic"}>
        <Typography variant="h3">
            {quoteText}
        </Typography>
    </Container>;
}
