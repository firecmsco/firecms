import {
    propertiesToTree,
    treeToProperties
} from "../../core/components/SchemaEditor/util";
import { EntitySchema } from "../../models";
const util = require('util');

export const productSchema: EntitySchema = {
    id: "product",
    name: "Product",
    views: [
        {
            path: "custom_view",
            name: "Test custom view",
            builder: ({}) => undefined
        }
    ],
    properties: {
        name: {
            dataType: "string",
            title: "Name",
            multiline: true,
            validation: { required: true }
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
            },
            propertiesOrder: ["name", "external_id"]
        },
        main_image: {
            dataType: "string",
            title: "Image",
            storage: {
                mediaType: "image",
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
            title: "Available",
            columnWidth: 100
        },
        price: ({ values }: any) => ({
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
                // Preview: PriceTextPreview
            },
            description: "Price with range validation"
        }),
    }
};

it("Schema editor", () => {
    const tree = propertiesToTree(productSchema.properties);
    console.log(util.inspect(tree, false, 100, true));
    const [properties] = treeToProperties(tree);
    expect(productSchema.properties).toEqual(properties);
});
