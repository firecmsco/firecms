import { FireCMSCustomization } from "@firecms/firebase";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

export const customization: FireCMSCustomization = {
    collections: [
        testCollection,
        productsCollection
    ],
    fields: [
        {
            key: "test",
            name: "Test",
            description: "This is a test field",
            property: {
                dataType: "number",
                defaultValue: 42,
            }
        }
    ],
    entityViews: [{
        key: "test",
        name: "Test",
        Builder: SampleEntityView
    }]
}
