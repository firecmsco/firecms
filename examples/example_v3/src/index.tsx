import { Entity, EntityCollection, FireCMSAppConfig } from "@firecms/cloud";
import { testCollection } from "./collections/test_collection";
import { productsCollection } from "./collections/products_collection";
import { SampleEntityView } from "./custom_entity_view/SampleEntityView";
import { colorPropertyConfig } from "./property_configs/color_property_config";
import { pricePropertyConfig } from "./property_configs/property_config_builder";
import { usersCollection } from "./collections/users_collection";
import { ExampleCMSView } from "./views/ExampleCMSView";
import { SampleCustomEntityCollection } from "./views/SampleCustomEntityCollection";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async ({ authController, dataSource }) => {
        const firstProducts = await dataSource.fetchCollection({
            path: "products",
            limit: 5
        });
        const newTestCollection = {
            ...testCollection,
            properties: {
                ...testCollection.properties,
                fetched_products: {
                    dataType: "string",
                    name: "Fetched products",
                    enumValues: firstProducts.map((product: Entity<any>) => ({
                        id: product.id,
                        label: product.values.name
                    }))
                }
            }
        } satisfies EntityCollection;

        return ([
            newTestCollection,
            productsCollection,
            usersCollection,
            // pagesCollection
            // showcaseCollection
        ]);
    },
    views: [
        {
            path: "sample",
            name: "Sample additional view",
            icon: "extension",
            view: <ExampleCMSView/>
        },
        {
            path: "custom_entity_table",
            name: "Sample entity table",
            icon: "extension",
            view: <SampleCustomEntityCollection/>
        }
    ],
    modifyCollection: ({ collection }) => {
        if (collection.id === "products") {
            return {
                ...collection,
                name: "Products modified",
                entityActions: [
                    {
                        name: "Test",
                        onClick: ({ entity }) => {
                            console.log("Entity", entity);
                        }
                    }
                ]
            }
        }
        return collection;
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
