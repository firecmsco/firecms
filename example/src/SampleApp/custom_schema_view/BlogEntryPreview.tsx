import React, { useEffect, useState } from "react";
import {
    Box,
    CardActionArea,
    CardContent,
    CircularProgress,
    Container,
    Typography
} from "@material-ui/core";
import {
    EntityCustomViewParams,
    EntityValues,
    getDownloadURL,
    Markdown
} from "@camberi/firecms";
import { blogSchema } from "../schemas/blog_schema";
import { productSchema } from "../schemas/products_schema";
import firebase from "firebase";


export function BlogEntryPreview({ modifiedValues }: EntityCustomViewParams<typeof blogSchema>) {

    const [headerUrl, setHeaderUrl] = useState<string | undefined>();
    useEffect(() => {
        if (modifiedValues?.header_image) {
            getDownloadURL(modifiedValues.header_image)
                .then((res) => setHeaderUrl(res));
        }
    }, [modifiedValues?.header_image]);

    return (
        <Box>

            {headerUrl && <img
                alt={"Header"}
                style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover"
                }}
                src={headerUrl}
            />}

            <Container maxWidth={"md"} style={{
                alignItems: "center",
                justifyItems: "center",
                display: "flex",
                flexDirection: "column"
            }}>
                {modifiedValues?.name && <Typography variant={"h2"} style={{
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
                                return <Products
                                    key={`preview_products_${index}`}
                                    references={entry.value}/>;
                            else throw Error(`Unsupported component ${entry.type}`);
                        }
                    )}

            </Container>

        </Box>
    );

}

export function Images({ storagePaths }: { storagePaths: string[] }) {
    if (!storagePaths)
        return <></>;
    return <Box display="flex">
        {storagePaths.map((path, index) =>
            <Box p={2} m={1}
                 key={`images_${index}`}
                 style={{
                     width: 250,
                     height: 250
                 }}>
                <StorageImage storagePath={path}/>
            </Box>
        )}
    </Box>;
}

export function StorageImage({ storagePath }: { storagePath: string }) {

    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (storagePath) {
            getDownloadURL(storagePath)
                .then((res) => setUrl(res));
        }
    }, [storagePath]);

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

export function Text({ markdownText }: { markdownText: string }) {

    if (!markdownText)
        return <></>;

    return <Container maxWidth={"sm"}>
        <Box mt={6} mb={6}>
            <Markdown source={markdownText}/>
        </Box>
    </Container>;
}

export function Products({ references }: { references: firebase.firestore.DocumentReference[] }) {


    const [products, setProducts] = useState<object[] | undefined>();

    useEffect(() => {
        if (references) {
            Promise.all(references.map((ref) => ref.get().then(doc => doc.data())))
                .then((results) => results.filter(r => !!r) as object[])
                .then((results) => setProducts(results));
        }
    }, [references]);


    if (!references)
        return <></>;

    if (!products) return <CircularProgress/>;

    return <Box>
        {products.map((p, index) => <ProductPreview
            key={`products_${index}`}
            productValues={p as EntityValues<typeof productSchema>}/>)}
    </Box>;
}

export function ProductPreview({ productValues }: { productValues: EntityValues<typeof productSchema> }) {

    if (!productValues)
        return <></>;

    return <CardActionArea style={{
        width: "400px",
        height: "400px",
        margin: "16px",
        boxShadow: "rgb(0 0 0 / 8%) 0px 8px 12px -4px"
    }}>
        <CardContent style={{
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }}>
            <Box flexGrow={1} flexShrink={1} flexBasis={296} p={2}
                 maxHeight={296}>
                <StorageImage storagePath={productValues.main_image}/>
            </Box>
            <Typography gutterBottom
                        variant="h6"
                        noWrap
                        style={{
                            marginTop: "16px"
                        }}>
                {productValues.name}
            </Typography>

            <Typography variant="body2"
                        color="textSecondary"
                        component="div">
                {productValues.price} {productValues.currency}
            </Typography>
        </CardContent>
    </CardActionArea>;

}
