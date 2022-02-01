import { EntitySchema, PropertyBuilder } from "../../models";
import { mergeSchemas } from "../../core/util/schemas";

const priceBuilder:PropertyBuilder = ({ values }: any) => ({
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
    description: "Price with range validation"
});

export const baseProductSchema: EntitySchema = {
    id: "product",
    name: "Product",
    properties: {
        name: {
            dataType: "string",
            title: "Name",
            multiline: true,
            validation: { required: true }
        },
        currency: {
            dataType: "string",
            title: "Currency",
            enumValues: "currency"
        },
        price: priceBuilder
    }
};
export const persistedProductSchema: EntitySchema = {
    id: "product",
    name: "Product persisted",
    properties: {
        name: {
            dataType: "string",
            title: "Name updated",
            multiline: true,
            validation: { required: true }
        },
        currency: {
            dataType: "string",
            title: "Currency",
            enumValues: [
                { id: "EUR", label: "Euros" },
                { id: "DOL", label: "Dollars" },
            ]
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                external_id: {
                    title: "External id",
                    dataType: "string"
                },
                name: {
                    title: "Name",
                    dataType: "string"
                },
            },
            propertiesOrder: ["name", "external_id"]
        }
    },
    propertiesOrder: ["name", "publisher", "price"]
};


it("Merge schemas", () => {
    const mergedSchema = mergeSchemas(baseProductSchema, persistedProductSchema);

    expect(mergedSchema).toEqual<EntitySchema>(
        {
            id: "product",
            name: "Product persisted",
            properties: {
                name: {
                    dataType: "string",
                    title: "Name updated",
                    multiline: true,
                    validation: { required: true }
                },
                currency: {
                    dataType: "string",
                    title: "Currency",
                    enumValues: [
                        { id: "EUR", label: "Euros" },
                        { id: "DOL", label: "Dollars" },
                    ]
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
                price: priceBuilder,
            },
            propertiesOrder: ["name", "publisher", "price"]
        });
});
