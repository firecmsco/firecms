import { FireCMSAppConfig } from "@firecms/firebase";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";
import { colorPropertyConfig } from "./property_configs/color_property_config";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            testCollection,
            productsCollection
        ]);
    },
    propertyConfigs: [
        colorPropertyConfig
    ],
    entityViews: [{
        key: "test",
        name: "Test",
        Builder: SampleEntityView
    }]
}

export default appConfig;
