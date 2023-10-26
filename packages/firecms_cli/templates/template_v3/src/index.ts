import { FireCMSCustomization } from "@firecms/firebase";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";

export const customization: FireCMSCustomization = {
    collections: [testCollection, productsCollection]
}
