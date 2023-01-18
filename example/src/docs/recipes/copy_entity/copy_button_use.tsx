import { buildCollection, CollectionActionsProps } from "firecms";
import { CopyEntityButton } from "./copy_button";
import {
    Product,
    productsCollection,
    properties
} from "./simple_product_collection";

export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    path: "products_copied",
    properties,
    Actions: ({ path, collection }: CollectionActionsProps<Product>) =>
        <CopyEntityButton
            pathFrom={"products"}
            collectionFrom={productsCollection}
            pathTo={path}
            collectionTo={collection}
        />
});
