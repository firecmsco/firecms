import { FireCMSCustomization } from "@firecms/firebase_firecms_v3";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";

export const config: FireCMSCustomization = {
    collections: [testCollection, productsCollection]
}
