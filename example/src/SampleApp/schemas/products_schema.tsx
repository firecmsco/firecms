import {
    AdditionalColumnDelegate,
    AsyncPreviewComponent,
    buildSchema,
    EntityCallbacks,
    EntityCustomView,
    EnumValues,
    ExtraActionsParams
} from "@camberi/firecms";

import PriceTextPreview from "../custom_field_preview/PriceTextPreview";
import { SampleExtraActions } from "../collection_actions/SampleExtraActions";
import { SampleProductsView } from "../custom_schema_view/SampleProductsView";
import { Locale, Product } from "../types";

export const locales: EnumValues = {
    "es": "Spanish",
    "de": "German",
    "en": "English",
    "it": "Italian",
    "fr": {
        label: "French",
        disabled: true
    }
};

const categories: EnumValues = {
    art_and_decoration: "Art and decoration",
    art_design_books: "Art and design books",
    babys: "Babies and kids",
    backpacks: "Backpacks and bags",
    bath: "Bath",
    bicycle: "Bicycle",
    books: "Books",
    cameras: "Cameras",
    clothing_man: "Clothing man",
    clothing_woman: "Clothing woman",
    coffee_and_tea: "Coffee and tea",
    cookbooks: "Cookbooks",
    delicatessen: "Delicatessen",
    desk_accessories: "Desk accessories",
    exercise_equipment: "Exercise equipment",
    furniture: "Furniture",
    gardening: "Gardening",
    headphones: "Headphones",
    home_accessories: "Home accessories",
    home_storage: "Home storage",
    kitchen: "Kitchen",
    lighting: "Lighting",
    music: "Music",
    outdoors: "Outdoors",
    personal_care: "Personal care",
    photography_books: "Photography books",
    serveware: "Serveware",
    smart_home: "Smart Home",
    sneakers: "Sneakers",
    speakers: "Speakers",
    sunglasses: "Sunglasses",
    toys_and_games: "Toys and games",
    watches: "Watches"
};

const sampleView: EntityCustomView = {
    path: "sample_custom_view",
    name: "Custom view",
    builder: ({ schema, entity, modifiedValues }) =>
        <SampleProductsView entity={entity}
                            modifiedValues={modifiedValues}/>
};


export const productSchema = buildSchema<Product>({
    name: "Product",
    views: [
        sampleView
    ],

    properties: {
        name: {
            dataType: "string",
            title: "Name",
            validation: {
                required: true
            }
        },
        main_image: {
            dataType: "string",
            title: "Image",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        },
        category: {
            dataType: "string",
            title: "Category",
            config: {
                enumValues: categories
            }
        },
        available: {
            dataType: "boolean",
            title: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: ({ values }) => ({
            dataType: "number",
            title: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            config: {
                Preview: PriceTextPreview
            },
            description: "Price with range validation"
        }),
        currency: {
            dataType: "string",
            title: "Currency",
            config: {
                enumValues: {
                    EUR: "Euros",
                    DOL: "Dollars"
                }
            },
            validation: {
                required: true
            }
        },
        public: {
            dataType: "boolean",
            title: "Public",
            description: "Should this product be visible in the website"
            // longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        },
        brand: {
            dataType: "string",
            title: "Brand",
            validation: {
                required: true
            }
        },
        description: {
            dataType: "string",
            title: "Description",
            description: "Example of a markdown field",
            config: {
                markdown: true
            }
        },
        amazon_link: {
            dataType: "string",
            title: "Amazon link",
            config: {
                url: true
            }
        },
        images: {
            dataType: "array",
            title: "Images",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        },
        related_products: {
            dataType: "array",
            title: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products"
            }
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        },
        available_locales: {
            title: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "array",
            readOnly: true,
            of: {
                dataType: "string",
                config: {
                    enumValues: locales
                }
            }
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback"
        },
        added_on: {
            dataType: "timestamp",
            title: "Added on",
            autoValue: "on_create"
        }

    },
    defaultValues: {
        currency: "EUR",
        publisher: {
            name: "Default publisher"
        }
    }

});

export const productCallbacks: EntityCallbacks = {
    onPreSave: ({
                    schema,
                    path,
                    entityId,
                    values,
                    status
                }) => {
        values.uppercase_name = values.name.toUpperCase();
        return values;
    },

    onSaveSuccess: (props) => {
        console.log("onSaveSuccess", props);
    },

    onDelete: (props) => {
        console.log("onDelete", props);
    },

    onPreDelete: (props) => {
        const email: string | undefined = props.context.authController.user?.email;
        if (!email || !email.endsWith("@camberi.com"))
            throw Error("Product deletion not allowed in this demo");
    }
};

export const productAdditionalColumn: AdditionalColumnDelegate<Product> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: entity.path,
                entityId: entity.id,
                schema: localeSchema
            }).then((entity) => entity.values.name)
        }/>
};


export const localeSchema = buildSchema<Locale>({
    customId: locales,
    name: "Locale",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            title: "Description",
            validation: { required: true },
            dataType: "string",
            config: {
                multiline: true
            }
        },
        selectable: {
            title: "Selectable",
            description: "Is this locale selectable",
            longDescription: "Changing this value triggers a cloud function that updates the parent product",
            dataType: "boolean"
        },
        video: {
            title: "Video",
            dataType: "string",
            validation: { required: false },
            config: {
                storageMeta: {
                    mediaType: "video",
                    storagePath: "videos",
                    acceptedFiles: ["video/*"],
                    fileName: (context) => {
                        return context.file.name;
                    }
                }
            },
            columnWidth: 400
        }
    }
});


export const productExtraActionBuilder = ({
                                              selectionController
                                          }: ExtraActionsParams) => {
    return (
        <SampleExtraActions
            selectionController={selectionController}/>
    );
};
