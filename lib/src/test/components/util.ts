import { EntityCollection } from "../../types";

export const productCollection: EntityCollection = {
    path: "product",
    name: "Product",
    views: [
        {
            path: "custom_view",
            name: "Test custom view",
            Builder: ({}) => null
        }
    ],
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            multiline: true,
            validation: { required: true }
        },
        publisher: {
            name: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                external_id: {
                    name: "External id",
                    dataType: "string"
                }
            },
            propertiesOrder: ["name", "external_id"]
        },
        main_image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        },
        available: {
            dataType: "boolean",
            name: "Available",
            columnWidth: 100
        },
        price: ({ values }: any) => ({
            dataType: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
                // Preview: PriceTextPreview
            description: "Price with range validation"
        }),
    }
};
