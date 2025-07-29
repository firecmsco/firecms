import { buildCollection, EnumValues } from "@firecms/core";
import { localeCollection } from "./locales";
import { Product } from "@/app/common/types";
import { CMSProductPreview } from "./components/CMSProductPreview";

export const categories: EnumValues = {
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


export const productsCollection = buildCollection<Product>({
    name: "Products",
    singularName: "Product",
    slug: "products",
    dbPath: "products",
    group: "E-commerce",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    // Here you can override the user permissions
    // permissions: ({ authController }) => ({
    //     read: true,
    //     edit: true,
    //     create: true,
    //     delete: true
    // }),
    subcollections: [localeCollection],
    entityViews: [
        {
            key: "preview",
            name: "Product preview",
            Builder: ({ modifiedValues, entity }) => <CMSProductPreview
                id={entity?.id ?? "temp"}
                product={modifiedValues}/>
        }
    ],
    properties: {
        name: {
            type: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            }
        },
        category: {
            type: "string",
            name: "Category",
            clearable: true,
            enumValues: categories
        },
        images: {
            type: "array",
            name: "Images",
            hideFromCollection: true,
            of: {
                type: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        },
        available: {
            type: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: ({ values }) => ({
            type: "number",
            name: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price between 0 and 10000",
                min: 0,
                max: 10000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            }
        }),
        currency: {
            type: "string",
            name: "Currency",
            enumValues: [
                {
                    id: "EUR",
                    label: "Euros",
                    color: "blueDark"
                },
                {
                    id: "DOL",
                    label: "Dollars",
                    color: "greenLight"
                }
            ],
            validation: {
                required: true
            }
        },
        public: {
            type: "boolean",
            name: "Public",
            description: "Should this product be visible in the website"
        },
        brand: {
            type: "string",
            name: "Brand",
            validation: {
                required: true
            }
        },
        description: {
            type: "string",
            name: "Description",
            markdown: true
        },
        amazon_link: {
            type: "string",
            name: "Amazon link",
            url: true
        },
        related_products: {
            type: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                type: "reference",
                slug: "products"
            }
        },
        publisher: {
            name: "Publisher",
            description: "This is an example of a map property",
            type: "map",
            properties: {
                name: {
                    name: "Name",
                    type: "string"
                },
                external_id: {
                    name: "External id",
                    type: "string"
                }
            }
        },
        added_on: {
            type: "date",
            name: "Added on",
            autoValue: "on_create"
        },
        tags: {
            type: "array",
            name: "Tags",
            of: {
                type: "string"
            }
        }
    }
});
