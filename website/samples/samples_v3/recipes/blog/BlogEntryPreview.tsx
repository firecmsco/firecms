import React, { useEffect, useState } from "react";
import { Card, CircularProgress, Container, Markdown, Typography } from "@firecms/ui";
import {
    Entity,
    EntityCustomViewParams,
    EntityReference,
    EntityValues,
    ErrorView,
    useDataSource,
    useStorageSource
} from "@firecms/core";
import { productsCollection } from "./products_collection";
import { BlogEntry, Product } from "./types";

/**
 * This is a sample view used to render the content of a blog entry.
 * It is bound to the data that is modified in the form.
 */
export function BlogEntryPreview({ modifiedValues }: EntityCustomViewParams<BlogEntry>) {

    const storage = useStorageSource();

    const [headerUrl, setHeaderUrl] = useState<string | undefined>();
    useEffect(() => {
        if (modifiedValues?.header_image) {
            storage.getDownloadURL(modifiedValues.header_image)
                .then((res) => setHeaderUrl(res.url ?? undefined));
        }
    }, [storage, modifiedValues?.header_image]);

    return (
        <div>

            {headerUrl && <img
                alt={"Header"}
                style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover"
                }}
                src={headerUrl}
            />}

            <Container className={"mb-16"}>

                <Container maxWidth={"3xl"}>
                    {modifiedValues?.name && <Typography variant={"h3"} className="mt-16 mb-12 mx-12">
                        {modifiedValues.name}
                    </Typography>}
                </Container>

                {modifiedValues?.content && modifiedValues.content
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
                                               storagePaths={entry.value}/>;
                            if (entry.type === "products")
                                return <ProductGroupPreview
                                    key={`preview_products_${index}`}
                                    references={entry.value}/>;
                            return <ErrorView key={`preview_images_${index}`}
                                              error={"Unexpected value in blog entry"}/>
                        }
                    )}

            </Container>

        </div>
    );

}

export function Images({ storagePaths }: {
    storagePaths: string[]
}) {
    if (!Array.isArray(storagePaths))
        return <></>;
    return <div className="flex justify-center">
        {storagePaths.map((path, index) =>
            <div key={`images_${index}`}
                 className="m-4 p-8 w-[350px] h-[350px]">
                <StorageImage storagePath={path}/>
            </div>
        )}
    </div>;
}

export function StorageImage({ storagePath }: {
    storagePath: string
}) {

    const storage = useStorageSource();
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (storagePath) {
            storage.getDownloadURL(storagePath)
                .then((res) => setUrl(res.url ?? undefined));
        }
    }, [storage, storagePath]);

    if (!storagePath)
        return <></>;

    return (<img
        alt={"Generic"}
        style={{
            objectFit: "contain",
            width: "100%",
            height: "100%"
        }} src={url}/>);
}

function Text({ markdownText }: {
    markdownText: string
}) {

    if (!markdownText)
        return <></>;

    return <Container maxWidth={"3xl"}>
        <div className="mt-12 mb-12 px-12">
            <Markdown source={markdownText}/>
        </div>
    </Container>;
}

function ProductGroupPreview({ references }: {
    references: EntityReference[]
}) {

    const [products, setProducts] = useState<Entity<Product>[] | undefined>();
    const dataSource = useDataSource();

    /**
     * Fetch the products determined by the references, using the datasource
     * and the products collection
     */
    useEffect(() => {
        if (references) {
            Promise.all(references.map((ref) => dataSource.fetchEntity({
                path: ref.path,
                entityId: ref.id,
                collection: productsCollection
            })))
                .then((results) => results.filter(r => !!r) as Entity<Product>[])
                .then((results) => setProducts(results));
        }
    }, [references, dataSource]);

    if (!references)
        return <></>;

    if (!products) return <CircularProgress/>;

    return <div className={"flex gap-2 flex-wrap items-center justify-center"}>
        {products.map((p, index) => <ProductPreview
            key={`products_${index}`}
            productValues={p.values as EntityValues<Product>}/>)}
    </div>;
}

export function ProductPreview({ productValues }: {
    productValues: EntityValues<Product>
}) {

    if (!productValues)
        return <></>;

    return (
        <Card className={"m-4 max-w-[340px] p-8 border"}>
            <div className={"flex-grow flex-shrink-1 flex-basis-[296px] p-8 max-h-[296px]"}>
                <StorageImage storagePath={productValues.main_image}/>
            </div>
            <Typography gutterBottom
                        variant="h6"
                        noWrap
                        style={{
                            marginTop: "16px"
                        }}>
                {productValues.name}
            </Typography>

            <Typography variant="body2"
                        color="secondary"
                        component="div">
                {productValues.price} Euros
            </Typography>
        </Card>
    );

}

function Quote({ quoteText }: {
    quoteText: string
}) {

    if (!quoteText)
        return <></>;

    return <Container maxWidth={"5xl"} className={"border-l-2 border-l-red-950 dark:border-l-red-100 my-8 italic"}>
        <Typography variant="h5" sx={{ fontStyle: "italic" }}>
            {quoteText}
        </Typography>
    </Container>;
}
