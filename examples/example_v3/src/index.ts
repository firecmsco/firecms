import { FireCMSCustomization } from "@firecms/firebase";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

export const customization: FireCMSCustomization = {
    collections: [testCollection, productsCollection],
    entityViews: [{
        key: "test",
        name: "Test",
        Builder: SampleEntityView
    }]
}
