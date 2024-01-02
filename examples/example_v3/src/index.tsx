import { FireCMSAppConfig } from "firecms";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";
import { colorPropertyConfig } from "./property_configs/color_property_config";
import { pricePropertyConfig } from "./property_configs/property_config_builder";
import { showcaseCollection } from "./collections/showcase_collection";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            testCollection,
            productsCollection,
            // showcaseCollection
        ]);
    },
    modifyCollection: (props) => {
        return props.collection;
    },
    propertyConfigs: [
        colorPropertyConfig,
        pricePropertyConfig,
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English",
                        editable: true
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                    it: {
                        dataType: "string",
                        name: "Italiano"
                    }
                },
            },
        }
    ],
    entityViews: [{
        key: "test",
        name: "Test",
        Builder: SampleEntityView
    }]
}

export default appConfig;
