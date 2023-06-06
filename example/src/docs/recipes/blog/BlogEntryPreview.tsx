import React, { useEffect, useState } from "react";
import {
    Box,
    CardActionArea,
    CardContent,
    CircularProgress,
    Container,
    Paper,
    Typography
} from "@mui/material";
import {
    Entity,
    EntityCustomViewParams,
    EntityReference,
    EntityValues,
    ErrorView,
    Markdown,
    useDataSource,
    useStorageSource
} from "firecms";
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
                .then((res) => setHeaderUrl(res.url));
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

            <Container maxWidth={"md"}
                       sx={{
                           alignItems: "center",
                           justifyItems: "center",
                           display: "flex",
                           flexDirection: "column"
                       }}>
                {modifiedValues?.name && <Typography variant={"h3"} sx={{
                    marginTop: "40px",
                    marginBottom: "20px"
                }}>
                    {modifiedValues.name}
                </Typography>}

                {modifiedValues?.content && modifiedValues.content
                    .filter((e: any) => !!e)
                    .map(
                        (entry: any, index: number) => {
                            if (entry.type === "text")
                                return <Text key={`preview_text_${index}`}
                                             markdownText={entry.value}/>;
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

export function Images({ storagePaths }: { storagePaths: string[] }) {
    if (!Array.isArray(storagePaths))
        return <></>;
    return <div className="flex">
        {storagePaths.map((path, index) =>
            <div key={`images_${index}`}
                 className="m-4 p-8 w-[250px] h-[250px]">
                <StorageImage storagePath={path}/>
            </div>
        )}
    </div>;
}

export function StorageImage({ storagePath }: { storagePath: string }) {

    const storage = useStorageSource();
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (storagePath) {
            storage.getDownloadURL(storagePath)
                .then((res) => setUrl(res.url));
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

function Text({ markdownText }: { markdownText: string }) {

    if (!markdownText)
        return <></>;

    return <Container maxWidth={"sm"}>
        <div className="mt-24 mb-24">
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

    return <div>
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
        <Paper sx={{
            width: "400px",
            height: "400px",
            margin: "16px",
            boxShadow: "rgb(0 0 0 / 8%) 0px 8px 12px -4px"
        }}
               variant={"outlined"}>
            <CardActionArea>
                <CardContent sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div className={"flex-grow flex-shrink-1 flex-basis-[296px] p-8 max-h-[296px]"} >
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
                </CardContent>
            </CardActionArea>
        </Paper>
    );

}
