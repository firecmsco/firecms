import { FireCMSAppConfig } from "@firecms/firebase";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            testCollection,
            productsCollection
        ]);
    },
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

export default appConfig;
