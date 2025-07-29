import { useEffect, useState } from "react";
import { Entity, EntityReference, EntityValues, useDataSource } from "@firecms/core";
import { Product } from "../../types";
import { Card, CircularProgress, Typography } from "@firecms/ui";
import { StorageImage } from "./StorageImage";

export function ProductGroupPreview({ references }: {
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
            <div className={"grow flex-shrink-1 flex-basis-[296px] p-8 max-h-[296px]"}>
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
